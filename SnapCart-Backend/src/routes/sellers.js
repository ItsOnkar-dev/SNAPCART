import express from 'express';
import Seller from '../Models/Seller.js';
import catchAsync from '../Core/catchAsync.js';
import { InternalServerError, BadRequestError, NotFoundError, AuthenticationError } from '../Core/ApiError.js';
import Logger from '../Config/Logger.js';
import { isLoggedIn } from '../Middlewares/Auth.js'; 

const router = express.Router(); 

// Get all the sellers
router.get('/sellers', catchAsync(async (req, res) => {
  Logger.info("Fetching all sellers");
  const sellers = await Seller.find({});
  
  if (!sellers || sellers.length === 0) {
    throw new NotFoundError('No sellers found');
  }
  
  res.status(200).json({
    status: 'success', 
    message: 'Fetched all sellers successfully',
    data: sellers,
  });   
}));

// Get the seller of the current user
// router.get('/sellers/current', isLoggedIn, catchAsync(async (req, res) => {
//   Logger.info("Fetching the seller data of the current user");
  
//   // Make sure req.user exists and has an _id
//   if (!req.user || !req.user._id) {
//     throw new AuthenticationError('User is not authenticated');
//   }
  
//   const seller = await Seller.findOne({ userId: req.user._id });
  
//   if (!seller) {
//     throw new NotFoundError('User is not a seller');
//   }
  
//   res.status(200).json({
//     status: 'success', 
//     message: 'Fetched seller data successfully',
//     data: seller,
//   });   
// }));

// Create a new seller
router.post('/sellers', catchAsync(async (req, res) => {
  Logger.info("Create the seller request received", { body: req.body });
  
  // Extract data from request body
  const { name, email, storeName, storeDescription } = req.body;
  
  // Validate required fields
  if (!name || !email || !storeName || !storeDescription) {
    throw new BadRequestError('Missing required fields: name, email, storeName, and storeDescription are required');
  }
  
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
  // If user auth is implemented, uncomment the userId line:
  // const userId = req.user ? req.user._id : null;
  
  const newSeller = await Seller.create({
    name,
    email,
    storeName,
    storeDescription,
    // userId // Uncomment when user authentication is implemented
  });
  
  if (!newSeller) {
    throw new InternalServerError('Failed to create seller');
  }
  
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

export default router;