import express from 'express';
import Seller from '../Models/Seller.js';
import catchAsync from '../Core/catchAsync.js';
import { InternalServerError, BadRequestError, NotFoundError, AuthenticationError } from '../Core/ApiError.js';
import Logger from '../Config/Logger.js';
import { isLoggedIn } from '../Middlewares/Auth.js'; 

const router = express.Router(); 

// Get the seller of the current user
router.get('/sellers', catchAsync(async (req, res) => {
  Logger.info("Fetching the seller data of the current user");
  const seller = await Seller.findOne({});
  
  if (!seller) {
    throw new NotFoundError('Seller not found');
  }
  
  res.status(200).json({
    status: 'success', 
    message: 'Fetched seller successfully',
    data: seller
  });
}));

// Create a new seller
router.post('/sellers', catchAsync(async (req, res) => {
  Logger.info("Create the seller request received", { body: req.body });
  const { name, email, storeName, storeDescription } = req.body;
  
  // Check if email or store name already exists
  const existingEmail = await Seller.findOne({ email });
  if (existingEmail) {
    throw new BadRequestError('This email is already used for a seller account');
  }
  
  const existingStoreName = await Seller.findOne({ storeName });
  if (existingStoreName) {
    throw new BadRequestError('This store name is already taken');
  }
  
  // Create the new seller
  const newSeller = await Seller.create({
    name,
    email,
    storeName,
    storeDescription,
    // userId: req.user._id // Uncomment when user authentication is implemented
  });
  
  if (!newSeller) throw new InternalServerError('Failed to create seller');
  
  res.status(201).json({
    status: 'success',
    message: 'Seller created successfully',
    data: newSeller
  });
}));

// Update the seller by ID
router.patch('/sellers/:id', isLoggedIn, catchAsync(async (req, res) => {
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
  
  if (!seller) throw new NotFoundError('Seller not found');
  
  res.status(200).json({
    status: 'success', 
    message: 'Updated the seller successfully',
    data: seller
  });
}));

// Fetch all unapproved sellers (admin only)
router.get('/admin/sellers', isLoggedIn, catchAsync(async (req, res) => {
  try {
    Logger.info("Fetching all unapproved sellers");
    
    // Check if user is admin (implement proper role-based auth)
    // if (!req.user || req.user.role !== 'admin') {
    //   throw new AuthenticationError('Not authorized');
    // }
    
    const unapprovedSellers = await Seller.find({ approved: false });
    
    res.status(200).json({
      status: 'success',
      data: unapprovedSellers
    });
  } catch (error) {
    Logger.error("Error fetching unapproved sellers", { error });
    // Let the global error handler handle this
    throw error;
  }
}));

// Approve a seller (admin only)
router.post('/admin/sellers/:id/approve', isLoggedIn, catchAsync(async (req, res) => {
  try {
    Logger.info("Approving a seller", { sellerId: req.params.id });
    const { id } = req.params;
    
    // Check if user is admin (implement proper role-based auth)
    // if (!req.user || req.user.role !== 'admin') {
    //   throw new AuthenticationError('Not authorized');
    // }
    
    const seller = await Seller.findByIdAndUpdate(
      id, 
      { approved: true },
      { new: true }
    );
    
    if (!seller) throw new NotFoundError('Seller not found');
    
    res.status(200).json({
      status: 'success',
      message: 'Seller approved successfully',
      data: seller
    });
  } catch (error) {
    Logger.error("Error approving seller", { error, sellerId: req.params.id });
    // Let the global error handler handle this
    throw error;
  }
}));

export default router;