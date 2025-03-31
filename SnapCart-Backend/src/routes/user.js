import express from "express";
import bcrypt from "bcrypt"; // A library to help you hash passwords.
import { validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import UserRepo from "../Repositories/UserRepo.js";
import catchAsync from "../Core/catchAsync.js";
import { AuthenticationError, BadRequestError } from "../Core/ApiError.js";
import jwt from "jsonwebtoken";
import isLoggedIn from "../Middlewares/Auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "JWTKJDGFSDFHDGSVFSDUFSDBFS";

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 login attempts per window per IP
  message: "Too many login attempts, please try again later",
});

// Password update rate limiter
const passwordUpdateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 password update attempts per window per IP
  message: "Too many password update attempts, please try again later",
});

// User Register
router.post(
  "/register",
  catchAsync(async (req, res) => {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email, role } = req.body;

    if (!username || !password || !email || !role) {
      return res.status(400).json({ msg: "Please enter all required credentials" });
    }

    // Check user with the given username or email already exists?
    const existingUserByUsername = await UserRepo.findByUsername(username);
    const existingUserByEmail = await UserRepo.findByEmail(email);

    if (existingUserByUsername || existingUserByEmail) {
      throw new BadRequestError(`${existingUserByUsername ? `Username` : `Email`} already exists`);
    }

    // To hash a password using bcrypt, you can use the hash() function. The first argument is the password you want to hash, and the second argument is ( saltRounds) the number of rounds you want to use. When you are hashing your data, the module will go through a series of rounds to give you a secure hash. The higher the number of rounds, the more secure the password will be.
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await UserRepo.CreateUser(username, passwordHash, email, role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      msg: "Signed Up successful! Please login to get started.",
      user: userWithoutPassword,
    });
  })
);

// User Login
router.post(
  "/login",
  loginLimiter,
  catchAsync(async (req, res) => {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ msg: "Please enter all required credentials" });
    }

    // Find user with a single database call
    const user = await UserRepo.findByUsername(username);
    if (!user) {
      throw new AuthenticationError("No user found with the provided credentials");
    }

    // Verify password (assuming you have a password verification function)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid Username/Password");
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, { expiresIn: "24h" });

    // Before sending the response, remove the password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      msg: "Logged in successfully, Welcome back!",
      user: userWithoutPassword,
      token: jwtToken,
    });
  })
);

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

export default router;
