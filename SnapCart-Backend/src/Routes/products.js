import express from 'express'
import { validationResult } from 'express-validator'
import Logger from '../Config/Logger.js'
import { AuthenticationError, AuthorizationError, BadRequestError, InternalServerError, NotFoundError } from '../CoreTemp/ApiError.js'
import catchAsync from '../CoreTemp/catchAsync.js'
import { isLoggedIn } from '../Middlewares/Auth.js'
import Product from '../Models/Product.js'
import Review from '../Models/Reviews.js'
import Seller from '../Models/Seller.js'
import { createProductValidator, updateProductValidator } from '../Validators/productValidator.js'

const router = express.Router(); // Creates a new instance of an Express Router. The Router in Express is like a mini Express application that you can use to handle routes separately instead of defining all routes in server.js.

// Product.sellerId must always reference the User _id, not Seller _id, for correct population and username display.

// Utility for standardized API responses
const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null, errors = null }) => {
  const response = { status, message };
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

// Get All products (public)
router.get('/products', catchAsync(async(req, res) => {
  Logger.info("Fetch all products request received")
  const products = await Product.find({}).populate('sellerId', 'username').lean();
  if (!products || products.length === 0) throw NotFoundError('Products not found');
  return sendResponse(res, { message: 'Fetched all the products successfully', data: products });
}));

// Get products for the logged-in seller (private)
router.get('/my-products', isLoggedIn, catchAsync(async(req, res) => {
  Logger.info("Fetch seller's own products request received")
  
  // Check if user has a seller profile
  const seller = await Seller.findOne({ userId: req.userId });
  if (!seller) {
    throw AuthenticationError("You need to create a seller profile first");
  }

  // Use seller._id to find products
  const products = await Product.find({ sellerId: seller._id }).lean();
  return sendResponse(res, { message: 'Fetched your products successfully', data: products });
}));

// Creating the new Product (private)
router.post('/products', isLoggedIn, createProductValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, { status: 'error', statusCode: 400, message: 'Validation failed', errors: errors.array() });
  }
  next();
}, catchAsync(async(req, res) => {
  Logger.info("Create the product request received", { body: req.body })
  const { title, description, image, price } = req.body;

  if(!title || !description || !image || !price) {
    throw BadRequestError('All fields are required');
  }

  // Get the seller profile first
  const seller = await Seller.findOne({ userId: req.userId });
  if (!seller) {
    throw AuthenticationError("You need to create a seller profile first");
  }

  const newProduct = await Product.create(
    { 
      title, 
      description, 
      image, 
      price: parseFloat(price),
      sellerId: seller._id // Use Seller's _id
    }
  );

  if (!newProduct) throw InternalServerError('Failed to create product');

  return sendResponse(res, { statusCode: 201, message: 'Product created successfully', data: newProduct });
}));

router.route('/products/:productId')
// Show a product (public)
.get(catchAsync(async(req, res) => {
  Logger.info("Show the product request received")
  const { productId } = req.params;
  const product = await Product.findById(productId).populate('sellerId', 'username').lean();

  if (!product) throw NotFoundError('Product not found');

  return sendResponse(res, { message: 'Product fetched successfully', data: product });
}))
// Update a product (private, only owner)
.patch(isLoggedIn, updateProductValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, { status: 'error', statusCode: 400, message: 'Validation failed', errors: errors.array() });
  }
  next();
}, catchAsync(async(req, res) => {
  Logger.info("Update the product request received")
  const { productId } = req.params;
  const { title, description, image, price } = req.body;
  
  // Get the seller profile first
  const seller = await Seller.findOne({ userId: req.userId });
  if (!seller) {
    throw AuthenticationError("You need to create a seller profile first");
  }
  
  // First check if product exists 
  const productExists = await Product.findById(productId);
  if (!productExists) throw NotFoundError('Failed to update product');

  // Then check if user owns the product using seller._id
  if (productExists.sellerId.toString() !== seller._id.toString()) {
    throw AuthorizationError('You do not have permission to update this product');
  }

  // Now update the product
  const product = await Product.findByIdAndUpdate(
    productId,
    { title, description, image, price: parseFloat(price) },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw InternalServerError('Failed to update product');
  }

  return sendResponse(res, { message: 'Product updated successfully', data: product });
}))
// Delete a product (private, only owner)
.delete(isLoggedIn, catchAsync(async(req, res) => {
  Logger.info("Delete the product request received")
  const { productId } = req.params;
  
  // Get the seller profile first
  const seller = await Seller.findOne({ userId: req.userId });
  if (!seller) {
    throw AuthenticationError("You need to create a seller profile first");
  }

  // First check if product exists
  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw NotFoundError('Product not found');
  }

  // Then check if user owns the product using seller._id
  if (productExists.sellerId.toString() !== seller._id.toString()) {
    throw AuthorizationError('You do not have permission to delete this product');
  }

  // Delete all reviews associated with this product
  if (productExists.reviews && productExists.reviews.length > 0) {
    await Review.deleteMany({ _id: { $in: productExists.reviews } });
  }

  // Now delete the product
  const deleteResult = await Product.findByIdAndDelete(productId);
    
  if (!deleteResult) {
    throw InternalServerError('Failed to delete product');
  }

  return sendResponse(res, { message: 'Product deleted successfully' });
}));

// Get products by seller ID
router.get('/products/seller/:sellerId', isLoggedIn, catchAsync(async (req, res) => {
  const { sellerId } = req.params;
  
  if (!sellerId) {
    throw BadRequestError("Seller ID is required");
  }

  // Find the seller to verify ownership
  const seller = await Seller.findOne({ 
    _id: sellerId,
    userId: req.userId 
  });

  if (!seller) {
    throw AuthenticationError("You are not authorized to view these products");
  }

  const products = await Product.find({ sellerId }).sort({ createdAt: -1 });

  return res.status(200).json({
    status: 'success',
    message: 'Products fetched successfully',
    data: products
  });
}));

export default router;