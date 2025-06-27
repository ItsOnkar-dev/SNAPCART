import bcrypt from 'bcrypt';
import express from 'express';
import { BadRequestError } from '../CoreTemp/ApiError.js';
import catchAsync from '../CoreTemp/catchAsync.js';
import { isLoggedIn, restrictTo } from '../Middlewares/Auth.js';
import Order from '../Models/Order.js';
import Product from '../Models/Product.js';
import User from '../Models/User.js';

const router = express.Router();

// Utility for standardized API responses
const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null, errors = null }) => {
  const response = { status, message };
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

// Middleware to ensure only platform admins can access these routes
const platformAdminOnly = restrictTo('PlatformAdmin');

// Get dashboard statistics
router.get('/stats', isLoggedIn, platformAdminOnly, catchAsync(async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueData] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
  ]);

  const totalRevenue = revenueData[0]?.total || 0;

  return sendResponse(res, {
    message: 'Dashboard statistics fetched successfully',
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue
    }
  });
}));

// Get recent orders
router.get('/recent-orders', isLoggedIn, platformAdminOnly, catchAsync(async (req, res) => {
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('_id customerName totalAmount status createdAt');

  return sendResponse(res, {
    message: 'Recent orders fetched successfully',
    data: recentOrders
  });
}));

// Get all sellers
router.get('/sellers', isLoggedIn, platformAdminOnly, catchAsync(async (req, res) => {
  const sellers = await User.find({ role: 'Seller' })
    .select('-password')
    .populate('sellerProfile');

  return sendResponse(res, {
    message: 'Sellers fetched successfully',
    data: sellers
  });
}));

// Get all buyers
router.get('/buyers', isLoggedIn, platformAdminOnly, catchAsync(async (req, res) => {
  const buyers = await User.find({ role: 'Buyer' })
    .select('-password');

  return sendResponse(res, {
    message: 'Buyers fetched successfully',
    data: buyers
  });
}));

// Get all products (admin only)
router.get('/products', isLoggedIn, platformAdminOnly, catchAsync(async (req, res) => {
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .populate('sellerId', 'username email')
    .select('title price status createdAt sellerId');

  return sendResponse(res, {
    message: 'Products fetched successfully',
    data: products
  });
}));

// Update user role (only platform admin can do this)
router.patch('/users/:userId/role', isLoggedIn, platformAdminOnly, catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Prevent changing to PlatformAdmin role through this endpoint
  if (role === 'PlatformAdmin') {
    throw BadRequestError('Cannot assign PlatformAdmin role through this endpoint');
  }

  if (!['Seller', 'Buyer'].includes(role)) {
    return sendResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'Invalid role. Must be one of: Seller, Buyer'
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    return sendResponse(res, {
      status: 'error',
      statusCode: 404,
      message: 'User not found'
    });
  }

  return sendResponse(res, {
    message: 'User role updated successfully',
    data: updatedUser
  });
}));

// Create platform admin (this should be a one-time setup endpoint)
router.post('/setup-platform-admin', catchAsync(async (req, res) => {
  // Check if any platform admin exists
  const existingAdmin = await User.findOne({ role: 'PlatformAdmin' });
  if (existingAdmin) {
    throw BadRequestError('Platform admin already exists');
  }

  const { username, email, password } = req.body;

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create the platform admin
  const platformAdmin = await User.create({
    username,
    email,
    password: passwordHash,
    role: 'PlatformAdmin',
    isPlatformAdmin: true
  });

  // Remove password from response
  const { password: _, ...adminWithoutPassword } = platformAdmin.toObject();

  return sendResponse(res, {
    statusCode: 201,
    message: 'Platform admin created successfully',
    data: adminWithoutPassword
  });
}));

// Delete platform admin (for setup purposes only)
router.delete('/delete-platform-admin', catchAsync(async (req, res) => {
  const deletedAdmin = await User.findOneAndDelete({ role: 'PlatformAdmin' });
  
  if (!deletedAdmin) {
    return sendResponse(res, {
      status: 'error',
      statusCode: 404,
      message: 'No platform admin found to delete'
    });
  }

  return sendResponse(res, {
    message: 'Platform admin deleted successfully',
    data: { username: deletedAdmin.username }
  });
}));

export default router; 