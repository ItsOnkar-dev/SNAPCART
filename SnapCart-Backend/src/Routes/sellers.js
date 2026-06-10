import express from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Logger from '../Config/Logger.js';
import { AuthenticationError, BadRequestError, NotFoundError } from '../Core/ApiError.js';
import catchAsync from '../Core/catchAsync.js';
import { isLoggedIn } from '../Middlewares/Auth.js';
import Product from '../Models/Product.js';
import User from '../Models/User.js';
import { createSellerValidator } from '../Validators/sellerValidator.js';

const router = express.Router();

const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null, errors = null }) => {
  const response = { status, message };
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

// Get all the sellers
router.get('/sellers', catchAsync(async (req, res) => {
  Logger.info("Fetching all sellers");
  const sellers = await User.find({ role: 'Seller' }).select('username email sellerDetails createdAt').lean();
  
  if (!sellers || sellers.length === 0) {
    throw NotFoundError('No sellers found');
  }
  
  return sendResponse(res, { message: 'Fetched all sellers successfully', data: sellers });
}));

// Get the seller data of the current user
router.get('/sellers/current', isLoggedIn, catchAsync(async (req, res) => {
  Logger.info("Fetching the seller data of the current user");
  
  const user = await User.findById(req.userId).select('-password').lean();
  
  if (!user || user.role !== 'Seller' || !user.sellerDetails) {
    throw NotFoundError('No seller profile found for your account');
  }
  
  return sendResponse(res, { 
    message: 'Fetched seller data successfully',
    data: {
      _id: user._id,
      userId: user._id,
      username: user.username,
      email: user.email,
      phone: user.sellerDetails.phone,
      businessName: user.sellerDetails.businessName,
      businessAddress: user.sellerDetails.businessAddress,
      isVerified: user.sellerDetails.isVerified,
      createdAt: user.createdAt
    }
  });   
}));

// Check if an email is already registered as a seller
router.get('/sellers/check-email', catchAsync(async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    throw BadRequestError("Email parameter is required");
  }
  
  const user = await User.findOne({ email, role: 'Seller' }).lean();
  
  return sendResponse(res, { 
    message: user ? 'Email is associated with a seller account' : 'Email is not associated with a seller account',
    data: { exists: !!user }
  });
}));

// Create a new seller profile for the logged-in user (role upgrade)
router.post('/sellers', isLoggedIn, createSellerValidator, catchAsync(async (req, res) => {
  Logger.info("Upgrade user to seller request received", { userId: req.userId, body: req.body });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, { 
      status: 'error', 
      statusCode: 400, 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { phone, businessName, businessAddress } = req.body;

  // Find user
  const user = await User.findById(req.userId);
  if (!user) {
    throw NotFoundError("User not found");
  }

  // Check if user is already a seller
  if (user.role === 'Seller' && user.sellerDetails) {
    return sendResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'You already have a seller account'
    });
  }

  // Upgrade user's details and role
  user.role = 'Seller';
  user.isSeller = true;
  user.sellerDetails = {
    phone,
    businessName,
    businessAddress,
    isVerified: false
  };

  await user.save();

  const userObject = user.toObject();
  delete userObject.password;

  return sendResponse(res, { 
    message: 'Seller account created successfully', 
    data: {
      _id: user._id,
      userId: user._id,
      username: user.username,
      email: user.email,
      phone: user.sellerDetails.phone,
      businessName: user.sellerDetails.businessName,
      businessAddress: user.sellerDetails.businessAddress,
      isVerified: user.sellerDetails.isVerified,
      createdAt: user.createdAt
    }
  });
}));

// Deprecated Login endpoint for compatibility with frontend code prior to refactor
router.post('/sellers/login', isLoggedIn, catchAsync(async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user || user.role !== 'Seller') {
    return sendResponse(res, {
      status: 'error',
      statusCode: 401,
      message: 'No seller profile found for your account. Please register.'
    });
  }

  return sendResponse(res, { 
    message: 'Logged in successfully',
    data: { 
      sellerId: user._id,
      sellerInfo: {
        _id: user._id,
        userId: user._id,
        username: user.username,
        email: user.email,
        phone: user.sellerDetails?.phone,
        businessName: user.sellerDetails?.businessName,
        businessAddress: user.sellerDetails?.businessAddress,
        isVerified: user.sellerDetails?.isVerified,
      }
    } 
  });
}));

// Delete seller account (revert back to buyer)
router.delete('/sellers/current', isLoggedIn, catchAsync(async (req, res) => {
  Logger.info("Revert seller account request received", { userId: req.userId });

  const user = await User.findById(req.userId);
  if (!user || user.role !== 'Seller') {
    throw new NotFoundError("Seller profile not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete all products associated with this seller (sellerId is now user._id)
    const deletedProducts = await Product.deleteMany({ sellerId: user._id }, { session });

    // Update user role back to Buyer and clear seller details
    user.role = 'Buyer';
    user.isSeller = false;
    user.sellerDetails = undefined;
    await user.save({ session });

    await session.commitTransaction();

    Logger.info("Seller profile reverted and products deleted successfully", {
      userId: user._id,
      deletedProductCount: deletedProducts.deletedCount
    });

    return sendResponse(res, {
      message: 'Seller account reverted to buyer and products deleted successfully',
      status: 'success',
      data: {
        deletedProductCount: deletedProducts.deletedCount
      }
    });
  } catch (error) {
    await session.abortTransaction();
    Logger.error("Error deleting seller account:", error);
    throw error;
  } finally {
    session.endSession();
  }
}));

export default router;
