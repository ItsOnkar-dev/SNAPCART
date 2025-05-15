import express from 'express'
import Product from '../Models/Product.js'
import catchAsync from '../Core/catchAsync.js'
import {BadRequestError, InternalServerError} from '../Core/ApiError.js'
import Logger from '../Config/Logger.js'
import { createProductValidator, updateProductValidator } from '../Validators/productValidator.js'
import { validationResult } from 'express-validator'

const router = express.Router(); // Creates a new instance of an Express Router. The Router in Express is like a mini Express application that you can use to handle routes separately instead of defining all routes in server.js.

// Utility for standardized API responses
const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null, errors = null }) => {
  const response = { status, message };
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

// Get All products
router.get('/products', catchAsync(async(req, res) => {
  Logger.info("Fetch all products request received")
  const products = await Product.find({}).lean()
  if (!products || products.length === 0) throw BadRequestError('Products not found');
  return sendResponse(res, { message: 'Fetched all the products successfully', data: products });
}));

// Creating the new Product
router.post('/products', createProductValidator, (req, res, next) => {
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
      price: parseFloat(price) 
    }
  );

  if (!newProduct) throw InternalServerError('Failed to create product');

  return sendResponse(res, { statusCode: 201, message: 'Product created successfully', data: newProduct });
}));

router.route('/products/:productId')
// Show a product
.get(catchAsync(async(req, res) => {
  Logger.info("Show the product request received")
  const { productId } = req.params;
  const product = await Product.findById(productId).lean();

  if (!product) throw BadRequestError('Product not found');

  return sendResponse(res, { message: 'Product fetched successfully', data: product });
}))
// Update a product
.patch(updateProductValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, { status: 'error', statusCode: 400, message: 'Validation failed', errors: errors.array() });
  }
  next();
}, catchAsync(async(req, res) => {
  Logger.info("Update the product request received")
  const { productId } = req.params;
  const { title, description, image, price } = req.body;
  const product = await Product.findByIdAndUpdate(
    productId, 
    { 
      title, 
      description, 
      image, 
      price: parseFloat(price) 
    }, 
    { new: true, runValidators: true }); // Returns the updated document

  if (!product) throw BadRequestError('Product not found');

  return sendResponse(res, { message: 'Product updated successfully', data: product });
}))
// Delete a product
.delete(catchAsync(async(req, res) => {
  Logger.info("Delete the product request received")
  const { productId } = req.params;
  const product = await Product.findByIdAndDelete(productId);

  if (!product) throw BadRequestError('Product not found');

  return sendResponse(res, { message: 'Product deleted successfully' });
}));

export default router;