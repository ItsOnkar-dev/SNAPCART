import express from 'express'
import Product from '../Models/Product.js'
import catchAsync from '../Core/catchAsync.js'
import {BadRequestError, InternalServerError} from '../Core/ApiError.js'
import Logger from '../Config/Logger.js'
import { createProductValidator, updateProductValidator } from '../Validators/productValidator.js'
import { validationResult } from 'express-validator'
import { isLoggedIn } from '../Middlewares/Auth.js'

const router = express.Router(); // Creates a new instance of an Express Router. The Router in Express is like a mini Express application that you can use to handle routes separately instead of defining all routes in server.js.

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
  const products = await Product.find({}).lean()
  if (!products || products.length === 0) throw BadRequestError('Products not found');
  return sendResponse(res, { message: 'Fetched all the products successfully', data: products });
}));

// Get products for the logged-in seller (private)
router.get('/my-products', isLoggedIn, catchAsync(async(req, res) => {
  Logger.info("Fetch seller's own products request received")
  const products = await Product.find({ sellerId: req.userId }).lean();
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
    return sendResponse(res, { status: 'error', statusCode: 400, message: 'All fields are required' });
  }

  const newProduct = await Product.create(
    { 
      title, 
      description, 
      image, 
      price: parseFloat(price),
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
  const product = await Product.findById(productId).lean();

  if (!product) throw BadRequestError('Product not found');

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
  // Only allow update if the product belongs to the logged-in seller
  const product = await Product.findOneAndUpdate(
    { _id: productId, sellerId: req.userId },
    { title, description, image, price: parseFloat(price) },
    { new: true, runValidators: true }
  );

  if (!product) throw BadRequestError('Product not found or you do not have permission to update this product');

  return sendResponse(res, { message: 'Product updated successfully', data: product });
}))
// Delete a product (private, only owner)
.delete(isLoggedIn, catchAsync(async(req, res) => {
  Logger.info("Delete the product request received")
  const { productId } = req.params;
  // Only allow delete if the product belongs to the logged-in seller
  const product = await Product.findOneAndDelete({ _id: productId, sellerId: req.userId });

  if (!product) throw BadRequestError('Product not found or you do not have permission to delete this product');

  return sendResponse(res, { message: 'Product deleted successfully' });
}));

export default router;