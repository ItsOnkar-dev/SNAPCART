import express from "express";
import bcrypt from "bcrypt"; // A library to help you hash passwords.
import { validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import UserRepo from "../Repositories/UserRepo.js";
import catchAsync from "../Core/catchAsync.js";
import { AuthenticationError, BadRequestError } from "../Core/ApiError.js";
import passport from "../Config/passport-setup.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { registerAuthValidator, loginAuthValidator } from '../Validators/authValidator.js';

dotenv.config();

const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "JWTKJDGFSDFHDGSVFSDUFSDBFS";

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000, // 5 login attempts per window per IP
  message: "Too many login attempts, please try again later",
});

// Utility for standardized API responses
const sendResponse = (res, { status = 'success', statusCode = 200, message = '', data = null, errors = null }) => {
  const response = { status, message };
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

// User Register
router.post(
  "/register",
  registerAuthValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, { status: 'error', statusCode: 400, message: 'Validation failed', errors: errors.array() });
    }
    next();
  },
  catchAsync(async (req, res) => {
    // Input validation is handled by validator
    const { username, password, email, role } = req.body;

    // Check user with the given username or email already exists?
    const existingUserByUsername = await UserRepo.findByUsername(username);
    const existingUserByEmail = await UserRepo.findByEmail(email);

    if (existingUserByUsername || existingUserByEmail) {
      throw BadRequestError(`${existingUserByUsername ? `Username` : `Email`} already exists`);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await UserRepo.CreateUser(username, passwordHash, email, role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return sendResponse(res, { statusCode: 201, message: 'Signed Up successful! Please login to get started.', data: userWithoutPassword });
  })
);

// User Login
router.post(
  "/login",
  loginAuthValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, { status: 'error', statusCode: 400, message: 'Validation failed', errors: errors.array() });
    }
    next();
  },
  loginLimiter,
  catchAsync(async (req, res) => {
    // Input validation is handled by validator
    const { username, password } = req.body;

    // Find user with a single database call
    const user = await UserRepo.findByUsername(username);
    if (!user) {
      throw AuthenticationError('No user found with the provided credentials');
    }

    // Verify password (assuming you have a password verification function)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw AuthenticationError('Invalid Username/Password');
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET_KEY, { expiresIn: "24h" });

    // Before sending the response, remove the password from response
    const { password: _, ...userWithoutPassword } = user;

    return sendResponse(res, { message: 'Logged in successfully, Welcome back!', data: { user: userWithoutPassword, token: jwtToken } });
  })
);

// Google OAuth Routes
// Initiate Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { 
    session: false,  // Change this to true if you want to use sessions
    failureRedirect: "/registration" 
  }),
  catchAsync(async (req, res) => {
    try {
      // At this point req.user should be populated by Passport
      console.log("Authenticated user:", req.user);
      
      // Ensure user exists in database (double-check)
      if (!req.user || !req.user._id) {
        throw AuthenticationError("User authentication failed");
      }

      // Generate JWT token for OAuth user
      const jwtToken = jwt.sign({ userId: req.user._id }, JWT_SECRET_KEY, { expiresIn: "24h" });

      // Remove sensitive information
      const { password, ...userWithoutPassword } = req.user.toObject ? req.user.toObject() : req.user;
      
      // Create a URL-safe JSON string of user data
      const userData = encodeURIComponent(JSON.stringify(userWithoutPassword));
      
      // Redirect to frontend success page with token and user data
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-success?token=${jwtToken}&userData=${userData}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/registration?error=authentication_failed`);
    }
  })
);

export default router;
