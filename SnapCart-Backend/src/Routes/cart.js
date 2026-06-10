import express from 'express';
import catchAsync from '../Core/catchAsync.js';
import { isLoggedIn } from '../Middlewares/Auth.js';
import Cart from '../Models/Cart.js';
import Product from '../Models/Product.js';
import { BadRequestError, NotFoundError } from '../Core/ApiError.js';

const router = express.Router();

const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null }) => {
  const response = { status, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

// Fetch current user's cart
router.get('/cart', isLoggedIn, catchAsync(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
  if (!cart) {
    cart = await Cart.create({ userId: req.userId, items: [] });
  }
  return sendResponse(res, { message: 'Cart fetched successfully', data: cart });
}));

// Add or increment item in cart
router.post('/cart/add', isLoggedIn, catchAsync(async (req, res) => {
  const { productId, qty = 1 } = req.body;

  if (!productId) {
    throw BadRequestError('Product ID is required');
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw NotFoundError('Product not found');
  }

  let cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    cart = new Cart({ userId: req.userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].qty += Number(qty);
  } else {
    cart.items.push({ productId, qty: Number(qty) });
  }

  await cart.save();
  const populatedCart = await cart.populate('items.productId');

  return sendResponse(res, { message: 'Item added to cart', data: populatedCart });
}));

// Update item quantity
router.put('/cart/update', isLoggedIn, catchAsync(async (req, res) => {
  const { productId, qty } = req.body;

  if (!productId || qty === undefined) {
    throw BadRequestError('Product ID and quantity are required');
  }

  if (Number(qty) <= 0) {
    // If quantity is 0 or less, remove item
    let cart = await Cart.findOne({ userId: req.userId });
    if (cart) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
    }
    const populatedCart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
    return sendResponse(res, { message: 'Item removed from cart', data: populatedCart });
  }

  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    throw NotFoundError('Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex === -1) {
    throw NotFoundError('Product not found in cart');
  }

  cart.items[itemIndex].qty = Number(qty);
  await cart.save();
  const populatedCart = await cart.populate('items.productId');

  return sendResponse(res, { message: 'Cart updated successfully', data: populatedCart });
}));

// Remove item from cart
router.delete('/cart/remove/:productId', isLoggedIn, catchAsync(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    throw NotFoundError('Cart not found');
  }

  cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  await cart.save();
  const populatedCart = await cart.populate('items.productId');

  return sendResponse(res, { message: 'Item removed from cart', data: populatedCart });
}));

// Sync/Merge cart on login
router.post('/cart/sync', isLoggedIn, catchAsync(async (req, res) => {
  const { guestCart } = req.body; // Array of { productId, qty }

  if (!guestCart || !Array.isArray(guestCart)) {
    throw BadRequestError('Guest cart must be an array');
  }

  let cart = await Cart.findOne({ userId: req.userId });
  if (!cart) {
    cart = new Cart({ userId: req.userId, items: [] });
  }

  for (const guestItem of guestCart) {
    if (!guestItem.productId) continue;
    const existingIndex = cart.items.findIndex(item => item.productId.toString() === guestItem.productId);
    
    if (existingIndex > -1) {
      cart.items[existingIndex].qty += Number(guestItem.qty || 1);
    } else {
      cart.items.push({ productId: guestItem.productId, qty: Number(guestItem.qty || 1) });
    }
  }

  await cart.save();
  const populatedCart = await cart.populate('items.productId');

  return sendResponse(res, { message: 'Cart synchronized successfully', data: populatedCart });
}));

// Clear all items in cart
router.delete('/cart', isLoggedIn, catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  const populatedCart = cart ? await cart.populate('items.productId') : { items: [] };
  return sendResponse(res, { message: 'Cart cleared successfully', data: populatedCart });
}));

export default router;
