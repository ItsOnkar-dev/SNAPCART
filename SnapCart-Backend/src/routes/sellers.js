import express from 'express';
import Seller from '../Models/Seller.js';
import catchAsync from '../Core/catchAsync.js';
import { BadRequestError, AuthenticationError } from '../Core/ApiError.js';
import Logger from '../Config/Logger.js';
import { isLoggedIn } from '../Middlewares/Auth.js';
import { createSellerValidator } from '../Validators/sellerValidator.js';
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
  if (!req.user || !req.userId) {
    throw new AuthenticationError('User is not authenticated');
  }
  
  const seller = await Seller.findOne({ userId: req.userId });
  
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

// Check if an email is already registered as a seller
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

// Create a new seller profile for the logged-in user
router.post('/sellers', isLoggedIn, createSellerValidator, catchAsync(async (req, res) => {
  Logger.info("Create seller profile request received", { userId: req.userId, body: req.body });

  // Check if user is properly authenticated
  if (!req.user || !req.userId) {
    return sendResponse(res, { 
      status: 'error', 
      statusCode: 401, 
      message: 'User not authenticated properly' 
    });
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

  const { username, email, phone } = req.body;

  // Check if the user already has a seller profile
  const existingSeller = await Seller.findOne({ userId: req.userId }).lean();
  if (existingSeller) {
    return sendResponse(res, { 
      status: 'error', 
      statusCode: 400, 
      message: 'User already has a seller profile' 
    });
  }

  const newSeller = await Seller.create({
    username,
    email,
    phone,
    userId: req.userId // Link the seller profile to the logged-in user's ID
  });

  return sendResponse(res, { 
    message: 'Seller profile created successfully', 
    data: newSeller 
  });
}));

// Login for seller
router.post('/sellers/login', isLoggedIn, catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendResponse(res, { 
      status: 'error', 
      statusCode: 400, 
      message: 'Email is required' 
    });
  }

  // First try to find seller by both email and userId (most secure approach)
  let seller = await Seller.findOne({ 
    email: email,
    userId: req.userId 
  }).lean();
  
   // If not found by both, try just by email for backward compatibility
  if (!seller) {
    seller = await Seller.findOne({ email }).lean();
  }
  
  if (!seller) {
    return sendResponse(res, { 
      status: 'error', 
      statusCode: 404, 
      message: 'No seller account found with this email' 
    });
  }

  // In a real application, you would check password here
  // For now, we'll just return success
  
  return sendResponse(res, { 
    message: 'Seller login successful', 
    data: { 
      sellerId: seller._id,
      sellerInfo: seller
    } 
  });
}));

export default router;