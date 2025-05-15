import express from 'express';
import Seller from '../Models/Seller.js';
import catchAsync from '../Core/catchAsync.js';
import { InternalServerError, BadRequestError, NotFoundError, AuthenticationError } from '../Core/ApiError.js';
import Logger from '../Config/Logger.js';
import { isLoggedIn } from '../Middlewares/Auth.js'; 
import UserRepo from "../Repositories/UserRepo.js";
import { createSellerValidator, updateSellerValidator } from '../Validators/sellerValidator.js';
import { validationResult } from 'express-validator';

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
    throw BadRequestError('No sellers found');
  }
  
  return sendResponse(res, { message: 'Fetched all sellers successfully', data: sellers });
}));

// Get the seller of the current user
router.get('/sellers/current', isLoggedIn, catchAsync(async (req, res) => {
  Logger.info("Fetching the seller data of the current user");
  
  // Make sure req.user exists and has an _id
  if (!req.user || !req.user._id) {
    throw new AuthenticationError('User is not authenticated');
  }
  
  const seller = await Seller.findOne({ userId: req.user._id });
  
  if (!seller) {
    return res.status(404).json({
      status: 'error',
      message: 'User is not a seller'
    });
  }
  
  return sendResponse(res, { 
    message: 'Fetched seller data successfully',
    data: seller
  });   
}));


// Check if an email is associated with a seller account
router.get('/sellers/check-email', catchAsync(async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return sendResponse(res, { 
      status: 'error', 
      statusCode: 400, 
      message: 'Email parameter is required' 
    });
  }
  
  const seller = await Seller.findOne({ email }).lean();
  
  return sendResponse(res, { 
    message: seller ? 'Email is associated with a seller account' : 'Email is not associated with a seller account',
    data: { exists: !!seller }
  });
}));

// Create a new seller
router.post('/sellers', createSellerValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, { status: 'error', statusCode: 400, message: 'Validation failed', errors: errors.array() });
  }
  next();
}, catchAsync(async (req, res) => {
  Logger.info("Create the seller request received", { body: req.body });
  
  const { name, email, storeName, storeDescription } = req.body;

  const { userId } = req;
  // Find user by ID from the token, excluding password
  const sellerId = await UserRepo.findByUserId(userId);
  
  // Validate required fields (redundant with validator, but kept for safety)
  if (!name || !email || !storeName || !storeDescription) {
    return sendResponse(res, { status: 'error', statusCode: 400, message: 'Missing required fields: name, email, storeName, and storeDescription are required' });
  }
  
  // Check if email or store name already exists
  const existingEmail = await Seller.findOne({ email }).lean();
  if (existingEmail) {
    throw BadRequestError('This email is already used for a seller account');
  }
  
  const existingStoreName = await Seller.findOne({ storeName }).lean();
  if (existingStoreName) {
    throw BadRequestError('This store name is already taken');
  }
  
  const newSeller = await Seller.create({
    name,
    email,
    storeName,
    storeDescription,
    sellerId
  });
  
  if (!newSeller) {
    throw InternalServerError('Failed to create seller');
  }
  
  return sendResponse(res, { statusCode: 201, message: 'Seller created successfully', data: newSeller });
}));

// Update the seller by ID
router.patch('/sellers/:id', updateSellerValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, { status: 'error', statusCode: 400, message: 'Validation failed', errors: errors.array() });
  }
  next();
}, isLoggedIn, catchAsync(async (req, res) => {
  Logger.info("Updating the seller data", { sellerId: req.params.id });
  
  const allowedFields = ['name', 'email', 'storeName', 'storeDescription'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });
  
  const seller = await Seller.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!seller) throw BadRequestError('Seller not found');
  
  return sendResponse(res, { message: 'Updated the seller successfully', data: seller });
}));

export default router;