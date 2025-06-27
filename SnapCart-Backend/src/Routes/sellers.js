import bcrypt from 'bcrypt';
import express from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Logger from '../Config/Logger.js';
import { AuthenticationError, BadRequestError, InternalServerError, NotFoundError } from '../Core/ApiError.js';
import catchAsync from '../Core/catchAsync.js';
import { isLoggedIn } from '../Middlewares/Auth.js';
import Product from '../Models/Product.js';
import Seller from '../Models/Seller.js';
import User from '../Models/User.js';
import { createSellerValidator, sellerLoginValidator } from '../Validators/sellerValidator.js';

const router = express.Router();

// Utility for standardized API responses
const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null, errors = null }) => {
  const response = { status, message };
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

// Get all the sellers
router.get('/sellers', catchAsync(async (req, res) => {
  Logger.info("Fetching all sellers");
  const sellers = await Seller.find({}).lean();
  
  if (!sellers || sellers.length === 0) {
    throw NotFoundError('No sellers found');
  }
  
  return sendResponse(res, { message: 'Fetched all sellers successfully', data: sellers });
}));

// Get the seller of the current user
router.get('/sellers/current', isLoggedIn, catchAsync(async (req, res) => {
  Logger.info("Fetching the seller data of the current user");
  
  // Make sure req.user exists and has an _id
  if (!req.user || !req.userId) {
    throw new AuthenticationError('User is not authenticated');
  }
  
  const seller = await Seller.findOne({ userId: req.userId });
  
  if (!seller) {
    throw InternalServerError('No seller found');
  }
  
  return sendResponse(res, { 
    message: 'Fetched seller data successfully',
    data: seller
  });   
}));

// Check if an email is already registered as a seller
router.get('/sellers/check-email', catchAsync(async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    throw BadRequestError("Email parameter is required")
  }
  
  const seller = await Seller.findOne({ email }).lean();
  
  return sendResponse(res, { 
    message: seller ? 'Email is associated with a seller account' : 'Email is not associated with a seller account',
    data: { exists: !!seller }
  });
}));

// Create a new seller profile for the logged-in user
router.post('/sellers', isLoggedIn, createSellerValidator, catchAsync(async (req, res) => {
  Logger.info("Create seller profile request received", { userId: req.userId, body: req.body });

  // Check if user is properly authenticated
  if (!req.user || !req.userId) {
    throw AuthenticationError("User not authenticated properly")
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, { 
      status: 'error', 
      statusCode: 400, 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { username, email, phone, password } = req.body;

  // Check if the user already has a seller profile
  const existingSeller = await Seller.findOne({ userId: req.userId });
  if (existingSeller) {
    return sendResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'You already have a seller account, please login from that account'
    });
  }

  // Check if email is already used by another seller
  const emailExists = await Seller.findOne({ email });
  if (emailExists) {
    return sendResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'This email is already registered as a seller'
    });
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create the seller profile
  const newSeller = await Seller.create({
    username,
    email,
    phone,
    password: passwordHash,
    userId: req.userId // Link the seller profile to the logged-in user's ID
  });

  // Update the user's role to Seller
  await User.findByIdAndUpdate(req.userId, { role: 'Seller' });

  // Remove password from response
  const { password: _, ...sellerWithoutPassword } = newSeller.toObject();

  return sendResponse(res, { 
    message: 'Seller account created successfully', 
    data: sellerWithoutPassword 
  });
}));

// Login for seller
router.post('/sellers/login', isLoggedIn, sellerLoginValidator, catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw BadRequestError("Email and password are required")
  }

  // Find seller by both email and userId (strict matching)
  const seller = await Seller.findOne({ 
    email: email,
    userId: req.userId 
  }).lean();
  
  if (!seller) {
    return sendResponse(res, {
      status: 'error',
      statusCode: 401,
      message: 'No seller account found with this email for your user account. Please register as a seller first.'
    });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, seller.password);
  if (!isPasswordValid) {
    return sendResponse(res, {
      status: 'error',
      statusCode: 401,
      message: 'Invalid password'
    });
  }
  
  // Remove password from response
  const { password: _, ...sellerWithoutPassword } = seller;
  
  return sendResponse(res, { 
    data: { 
      sellerId: seller._id,
      sellerInfo: sellerWithoutPassword,
      message: 'Logged in successfully',
    } 
  });
}));

// Delete seller account
router.delete('/sellers/current', isLoggedIn, catchAsync(async (req, res) => {
  Logger.info("Delete seller account request received", { userId: req.userId });

  // Check if user is properly authenticated
  if (!req.user || !req.userId) {
    throw new AuthenticationError("User not authenticated properly");
  }

  // Find the seller profile
  const seller = await Seller.findOne({ userId: req.userId });
  if (!seller) {
    throw new NotFoundError("Seller profile not found");
  }

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // First, get all product IDs associated with this seller
    const sellerProducts = await Product.find({ sellerId: seller._id }).select('_id');
    const productIds = sellerProducts.map(product => product._id);

    // Delete all products associated with this seller
    await Product.deleteMany({ sellerId: seller._id }, { session });

    // Delete the seller profile
    await Seller.findByIdAndDelete(seller._id, { session });

    // Update user role back to Buyer
    await User.findByIdAndUpdate(req.userId, { role: 'Buyer' }, { session });

    // Commit the transaction
    await session.commitTransaction();

    Logger.info("Seller account and associated products deleted successfully", {
      sellerId: seller._id,
      deletedProductCount: productIds.length
    });

    return sendResponse(res, {
      message: 'Seller account and all associated products deleted successfully',
      status: 'success',
      data: {
        deletedProductCount: productIds.length
      }
    });
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    Logger.error("Error deleting seller account:", error);
    throw error;
  } finally {
    // End the session
    session.endSession();
  }
}));

export default router;
