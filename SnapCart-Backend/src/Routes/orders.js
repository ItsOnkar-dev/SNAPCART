import express from 'express';
import catchAsync from '../Core/catchAsync.js';
import { isLoggedIn } from '../Middlewares/Auth.js';
import Order from '../Models/Order.js';
import Cart from '../Models/Cart.js';
import Product from '../Models/Product.js';
import User from '../Models/User.js';
import { BadRequestError, NotFoundError } from '../Core/ApiError.js';

const router = express.Router();

const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null }) => {
  const response = { status, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

// Create a new order (Checkout)
router.post('/orders', isLoggedIn, catchAsync(async (req, res) => {
  const { shippingAddress, paymentMethod = 'Credit Card' } = req.body;

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
    throw BadRequestError('Full shipping address is required');
  }

  // Get user's cart
  const cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    throw BadRequestError('Your cart is empty');
  }

  // Fetch the user to get their customer name
  const user = await User.findById(req.userId);
  const customerName = user ? (user.name || user.username) : 'Valued Customer';

  // Process items and calculate total amount
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.productId;
    if (!product) {
      throw NotFoundError('One or more products in your cart no longer exist');
    }

    orderItems.push({
      productId: product._id,
      quantity: item.qty,
      price: product.price
    });

    subtotal += product.price * item.qty;
  }

  // Calculate tax and shipping
  const shipping = subtotal >= 1000 ? 0 : 50;
  const tax = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + shipping + tax;

  // Create Order in DB
  const order = await Order.create({
    customerId: req.userId,
    customerName,
    items: orderItems,
    totalAmount,
    status: 'completed', // Completed mock transaction
    shippingAddress,
    paymentMethod,
    paymentStatus: 'completed' // Mock successful payment
  });

  // Clear user's cart
  cart.items = [];
  await cart.save();

  return sendResponse(res, { 
    statusCode: 201, 
    message: 'Order placed successfully! Thank you for shopping with SnapCart.', 
    data: order 
  });
}));

// Get order history of logged-in buyer
router.get('/orders/my-orders', isLoggedIn, catchAsync(async (req, res) => {
  const orders = await Order.find({ customerId: req.userId })
    .populate('items.productId')
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, { 
    message: 'Orders fetched successfully', 
    data: orders || [] 
  });
}));

// Get incoming orders for a seller (private)
router.get('/orders/seller', isLoggedIn, catchAsync(async (req, res) => {
  // Check if current user is seller
  const seller = await User.findById(req.userId);
  if (!seller || seller.role !== 'Seller') {
    throw BadRequestError('Only sellers can access seller orders');
  }

  // Get all products owned by this seller
  const sellerProducts = await Product.find({ sellerId: req.userId }).select('_id');
  const sellerProductIds = sellerProducts.map(p => p._id.toString());

  // Find all orders that contain any of these products
  const orders = await Order.find({ 'items.productId': { $in: sellerProductIds } })
    .populate('items.productId')
    .sort({ createdAt: -1 })
    .lean();

  // For each order, filter items to only show those belonging to this seller
  const sellerOrders = orders.map(order => {
    const itemsFiltered = order.items.filter(item => {
      return item.productId && sellerProductIds.includes(item.productId._id.toString());
    });

    // Re-calculate the total for the seller's specific items in the order
    const sellerTotal = itemsFiltered.reduce((total, item) => total + (item.price * item.quantity), 0);

    return {
      ...order,
      items: itemsFiltered,
      sellerSubtotal: sellerTotal
    };
  }).filter(order => order.items.length > 0); // Only return orders that have items for this seller

  return sendResponse(res, { 
    message: 'Seller incoming orders fetched successfully', 
    data: sellerOrders 
  });
}));

export default router;
