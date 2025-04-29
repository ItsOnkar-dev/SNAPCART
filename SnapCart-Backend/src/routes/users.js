import express from "express";
import bcrypt from "bcrypt"; // A library to help you hash passwords.
import rateLimit from "express-rate-limit";
import UserRepo from "../Repositories/UserRepo.js";
import catchAsync from "../Core/catchAsync.js";
import { AuthenticationError, BadRequestError } from "../Core/ApiError.js";
import {isLoggedIn} from "../Middlewares/Auth.js";

const router = express.Router();

// Password update rate limiter
const passwordUpdateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 password update attempts per window per IP
  message: "Too many password update attempts, please try again later",
});

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
      throw new AuthenticationError("User not found, Please login again to continue");
    }

    // Remove sensitive information before sending
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
    });
  })
);

router.get(
  "/download-data",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { userId } = req;

    try {
      // Fetch the complete user data
      const user = await UserRepo.findByUserId(userId);

      if (!user) {
        throw new AuthenticationError("User not found");
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
    } catch (error) {
      console.error("Error downloading user data:", error);
      res.status(500).json({ errMsg: "Failed to download user data. Please try again." });
    }
  })
);

// Update Password
// Update Password
router.put(
  "/update-password",
  isLoggedIn,
  passwordUpdateLimiter,
  catchAsync(async (req, res) => {
    try {
      const { userId } = req;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        throw new BadRequestError("Current password and new password are required");
      }

      // Password strength validation
      if (newPassword.length < 8) {
        throw new BadRequestError("New password must be at least 8 characters long");
      }

      if (currentPassword === newPassword) {
        throw new BadRequestError("New password should not be your current password, please create a new one");
      }

      // Find user
      const user = await UserRepo.findByUserId(userId);
      if (!user) {
        throw new AuthenticationError("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new BadRequestError("Current password is incorrect");
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update user's password in the database
      const updatedPassword = await UserRepo.updatePassword(userId, newPasswordHash);

      if (!updatedPassword) {
        throw new Error("Failed to update password, please try again later");
      }

      res.status(200).json({
        msg: "Password updated successfully! Please login with your new password.",
      });
    } catch (error) {
      console.error("Error updating password:", error);

      if (error instanceof BadRequestError) {
        return res.status(400).json({ errMsg: error.message });
      } else if (error instanceof AuthenticationError) {
        return res.status(401).json({ errMsg: error.message });
      } else {
        // For any other errors, return 500
        return res.status(500).json({ errMsg: "Internal server error. Please try again later." });
      }
    }
  })
);

router.delete(
  "/delete-account",
  isLoggedIn,
  catchAsync(async (req, res) => {
    try {
      const { userId } = req;

      // Find user before deleting (for confirmation logs)
      const user = await UserRepo.findByUserId(userId);
      if (!user) {
        throw new AuthenticationError("User not found, unable to delete account.");
      }

      // Delete the user from the database
      const deletedUser = await UserRepo.deleteUser(userId);
      if (!deletedUser) {
        throw new Error("Account deletion failed, please try again.");
      }
      console.log("Deleted User:", deletedUser);

      res.status(200).json({ status: "success", message: "Account deleted successfully", deletedData: deletedUser });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ errMsg: "Failed to delete account. Please try again." });
    }
  })
);

export default router;
