import express from 'express'
import { validationResult } from 'express-validator'
import Logger from '../Config/Logger.js'
import { AuthenticationError, AuthorizationError, BadRequestError, InternalServerError, NotFoundError } from '../Core/ApiError.js'
import catchAsync from '../Core/catchAsync.js'
import { isLoggedIn } from '../Middlewares/Auth.js'
import Product from '../Models/Product.js'
import Review from '../Models/Reviews.js'
import User from '../Models/User.js'
import { createProductValidator, updateProductValidator } from '../Validators/productValidator.js'
import { buildProductSearchFilter, getSortOption, parseSearchParams } from '../Utils/searchUtils.js'

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
  // Optimize query: select only needed fields, limit population, add sort for consistency
  const products = await Product.find({})
    .populate('sellerId', 'username')
    .select('title description image price sellerId createdAt')
    .sort({ createdAt: -1 })
    .lean();
  // Return empty array instead of error if no products (better for frontend)
  return sendResponse(res, { message: 'Fetched all the products successfully', data: products || [] });
}));

// Advanced product search (public) — must be registered before /products/:productId
router.get('/products/search', catchAsync(async (req, res) => {
  const { q, minPrice, maxPrice, sort, page, limit, suggest } = parseSearchParams(req.query)
  const filter = buildProductSearchFilter({ q, minPrice, maxPrice })
  const sortOption = getSortOption(sort, Boolean(q))
  const skip = (page - 1) * limit
  const effectiveLimit = suggest ? Math.min(limit, 8) : limit

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('sellerId', 'username')
      .select('title description image price sellerId createdAt')
      .sort(sortOption)
      .skip(skip)
      .limit(effectiveLimit)
      .lean(),
    Product.countDocuments(filter),
  ])

  return sendResponse(res, {
    message: q ? `Found ${total} result${total !== 1 ? 's' : ''} for "${q}"` : 'Products fetched successfully',
    data: {
      products: products || [],
      pagination: {
        page,
        limit: effectiveLimit,
        total,
        totalPages: Math.ceil(total / effectiveLimit) || 0,
      },
      meta: { query: q, minPrice, maxPrice, sort, suggest },
    },
  })
}))

// Get products by seller ID — must be registered before /products/:productId
router.get('/products/seller/:sellerId', isLoggedIn, catchAsync(async (req, res) => {
  const { sellerId } = req.params;

  if (!sellerId) {
    throw BadRequestError("Seller ID is required");
  }

  const seller = await User.findOne({
    _id: sellerId,
    role: 'Seller'
  });

  if (!seller) {
    throw NotFoundError("Seller profile not found");
  }

  const products = await Product.find({ sellerId }).sort({ createdAt: -1 });

  return res.status(200).json({
    status: 'success',
    message: 'Products fetched successfully',
    data: products
  });
}));

// Get products for the logged-in seller (private)
router.get('/my-products', isLoggedIn, catchAsync(async(req, res) => {
  Logger.info("Fetch seller's own products request received")
  
  // Check if user has a seller profile
  const seller = await User.findById(req.userId);
  if (!seller || seller.role !== 'Seller') {
    throw AuthenticationError("You need to create a seller profile first");
  }

  // Use user id as sellerId
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
    throw BadRequestError('All fields are required');
  }

  // Get the seller profile first
  const seller = await User.findById(req.userId);
  if (!seller || seller.role !== 'Seller') {
    throw AuthenticationError("You need to create a seller profile first");
  }

  const newProduct = await Product.create(
    { 
      title, 
      description, 
      image, 
      price: parseFloat(price),
      sellerId: req.userId // Use User's _id
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
  const seller = await User.findById(req.userId);
  if (!seller || seller.role !== 'Seller') {
    throw AuthenticationError("You need to create a seller profile first");
  }
  
  // First check if product exists 
  const productExists = await Product.findById(productId);
  if (!productExists) throw NotFoundError('Failed to update product');

  // Then check if user owns the product using sellerId
  if (productExists.sellerId.toString() !== req.userId.toString()) {
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
  const seller = await User.findById(req.userId);
  if (!seller || seller.role !== 'Seller') {
    throw AuthenticationError("You need to create a seller profile first");
  }

  // First check if product exists
  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw NotFoundError('Product not found');
  }

  // Then check if user owns the product using sellerId
  if (productExists.sellerId.toString() !== req.userId.toString()) {
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

export default router;