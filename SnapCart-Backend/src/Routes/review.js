import express from 'express'
import { BadRequestError, InternalServerError, NotFoundError } from '../CoreTemp/ApiError.js'
import catchAsync from '../CoreTemp/catchAsync.js'
import { isLoggedIn } from '../Middlewares/Auth.js'
import Product from '../Models/Product.js'
import Review from '../Models/Reviews.js'
import Seller from '../Models/Seller.js'

const router = express.Router()

// Utility for standardized API responses
const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null, errors = null }) => {
  const response = { status, message }
  if (data !== null) response.data = data
  if (errors !== null) response.errors = errors
  return res.status(statusCode).json(response)
}

// Add a review to a product
router.post('/products/:productId/reviews', isLoggedIn, catchAsync(async (req, res) => {
  const { productId } = req.params
  const { rating, review } = req.body

  // Basic validation
  if (!rating || rating < 1 || rating > 5) {
    throw BadRequestError('Rating must be between 1 and 5')
  }
  if (!review || typeof review !== 'string' || review.trim().length === 0) {
    throw BadRequestError('Review text is required')
  }

  // Check if product exists
  const product = await Product.findById(productId)
  if (!product) throw NotFoundError('Product not found')

  // Check if the logged-in user is the seller of this product
  const seller = await Seller.findById(product.sellerId)
  if (seller && seller.userId.toString() === req.userId.toString()) {
    throw BadRequestError('You cannot review your own product')
  }

  // Create review
  const newReview = await Review.create({ rating, review, user: req.userId })
  if (!newReview) throw InternalServerError('Failed to create review')

  // Add review to product
  product.reviews.push(newReview._id)
  await product.save()

  return sendResponse(res, { statusCode: 201, message: 'Review added successfully', data: newReview })
}))

// Get all reviews for a product
router.get('/products/:productId/reviews', catchAsync(async (req, res) => {
  const { productId } = req.params
  const product = await Product.findById(productId)
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name avatar username',
      },
    })
    .lean()
  if (!product) throw NotFoundError('Product not found')
  return sendResponse(res, { message: 'Reviews fetched successfully', data: product.reviews || [] })
}))

// Delete a review from a product 
router.delete('/products/:productId/reviews/:reviewId', isLoggedIn, catchAsync(async (req, res) => {
  const { productId, reviewId } = req.params
  // Check if product exists
  const product = await Product.findById(productId)
  if (!product) throw NotFoundError('Product not found')

  // Check if review exists in product
  const reviewIndex = product.reviews.findIndex(rid => rid.toString() === reviewId)
  if (reviewIndex === -1) throw NotFoundError('Review not found for this product')

  // Remove review from product
  product.reviews.splice(reviewIndex, 1)
  await product.save()

  // Delete review document
  await Review.findByIdAndDelete(reviewId)

  return sendResponse(res, { message: 'Review deleted successfully' })
}))

// Update a review for a product
router.patch('/products/:productId/reviews/:reviewId', isLoggedIn, catchAsync(async (req, res) => {
  const { productId, reviewId } = req.params;
  const { rating, review } = req.body;

  // Basic validation
  if (rating && (rating < 1 || rating > 5)) {
    throw BadRequestError('Rating must be between 1 and 5');
  }
  if (review && (typeof review !== 'string' || review.trim().length === 0)) {
    throw BadRequestError('Review text is required');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) throw NotFoundError('Product not found');

  // Check if review exists in product
  const reviewIndex = product.reviews.findIndex(rid => rid.toString() === reviewId);
  if (reviewIndex === -1) throw NotFoundError('Review not found for this product');

  // Update review document
  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { $set: { rating, review } },
    { new: true, runValidators: true }
  );
  if (!updatedReview) throw NotFoundError('Review not found');

  return sendResponse(res, { message: 'Review updated successfully', data: updatedReview });
}))

export default router
