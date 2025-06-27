import bcrypt from "bcrypt"; // A library to help you hash passwords.
import express from "express";
import rateLimit from "express-rate-limit";
import { validationResult } from 'express-validator';
import { AuthenticationError, BadRequestError } from "../CoreTemp/ApiError.js";
import catchAsync from "../CoreTemp/catchAsync.js";
import { isLoggedIn } from "../Middlewares/Auth.js";
import UserRepo from "../Repositories/UserRepo.js";
import { updatePasswordValidator } from '../Validators/userValidator.js';

const router = express.Router();

// Password update rate limiter
const passwordUpdateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 password update attempts per window per IP
  message: "Too many password update attempts, please try again later",
});

// Utility for standardized API responses
const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null, errors = null }) => {
  const response = { status, message };
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

// Profile
router.get(
  "/profile",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { userId } = req;
    // Find user by ID from the token, excluding password
    const user = await UserRepo.findByUserId(userId);

    if (!user) {
      console.error("User not found for ID:", req.userId);
      throw AuthenticationError('User not found, Please login again to continue');
    }

    // Remove sensitive information before sending
    const { password, ...userWithoutPassword } = user;

    return sendResponse(res, { message: 'Profile fetched successfully', data: userWithoutPassword });
  })
);

router.get(
  "/download-data",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { userId } = req;

    // Fetch the complete user data
    const user = await UserRepo.findByUserId(userId);

    if (!user) {
      throw AuthenticationError('User not found');
    }

    // Remove sensitive information like password
    const { password, token, __v, ...userDataToDownload } = user._doc || user;

    // Add any other related data you want to include
    // For example, if you have a separate collection for orders:
    // const orders = await OrderRepo.findByUserId(userId);
    // userDataToDownload.orders = orders;

    // Add wishlist, payment info, etc. if stored separately

    // Create a complete user data package
    const userData = {
      accountInfo: userDataToDownload,
      exportDate: new Date().toISOString(),
    };

    // Set headers for file download
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", 'attachment; filename="user_data.json"');

    // Send the data as a downloadable file
    res.status(200).json(userData);
  })
);

// Update Password
router.put(
  "/update-password",
  isLoggedIn,
  passwordUpdateLimiter,
  updatePasswordValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, { status: 'error', statusCode: 400, message: 'Validation failed', errors: errors.array() });
    }
    next();
  },
  catchAsync(async (req, res) => {
    const { userId } = req;
    const { currentPassword, newPassword } = req.body;

    // Password strength validation is handled by validator
    if (currentPassword === newPassword) {
      return sendResponse(res, { status: 'error', statusCode: 400, message: 'New password should not be your current password, please create a new one' });
    }

    // Find user
    const user = await UserRepo.findByUserId(userId);
    if (!user) {
      throw AuthenticationError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update user's password in the database
    const updatedPassword = await UserRepo.updatePassword(userId, newPasswordHash);

    if (!updatedPassword) {
      throw BadRequestError('Failed to update password, please try again later');
    }

    return sendResponse(res, { message: 'Password updated successfully! Please login with your new password.' });
  })
);

router.delete(
  "/delete-account",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { userId } = req;

    // Find user before deleting (for confirmation logs)
    const user = await UserRepo.findByUserId(userId);
    if (!user) {
      throw AuthenticationError('User not found, unable to delete account.');
    }

    // Delete the user from the database
    const deletedUser = await UserRepo.deleteUser(userId);
    if (!deletedUser) {
      throw BadRequestError('Account deletion failed, please try again.');
    }
    console.log("Deleted User:", deletedUser);

    return sendResponse(res, { message: 'Account deleted successfully', data: deletedUser });
  })
);

export default router;
