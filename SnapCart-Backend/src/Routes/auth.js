import bcrypt from "bcrypt"; // A library to help you hash passwords.
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import passport from "../Config/passport-setup.js";
import { AuthenticationError, BadRequestError } from "../Core/ApiError.js";
import catchAsync from "../Core/catchAsync.js";
import UserRepo from "../Repositories/UserRepo.js";
import { loginAuthValidator, registerAuthValidator } from '../Validators/authValidator.js';

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

// OAuth error route
router.get("/oauth-error", (req, res) => {
  const { error, message } = req.query;
  console.error("OAuth error:", { error, message });
  
  const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0].trim() : 'http://localhost:5173';
  res.redirect(`${frontendUrl}/registration?error=${error || 'oauth_failed'}&message=${encodeURIComponent(message || 'Authentication failed')}`);
});

// Test route to verify server is working
router.get("/test", (req, res) => {
  return sendResponse(res, { message: "Auth server is working", data: { timestamp: new Date().toISOString() } });
});

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
  (req, res, next) => {
    console.log("Google OAuth initiation - Environment check:");
    console.log("GOOGLE_CLIENT_ID:", !!process.env.GOOGLE_CLIENT_ID);
    console.log("GOOGLE_CLIENT_SECRET:", !!process.env.GOOGLE_CLIENT_SECRET);
    console.log("BACKEND_URL:", process.env.BACKEND_URL);
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handle Google callback
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { 
      session: false,
      failureRedirect: "/registration" 
    }, (err, user, info) => {
      if (err) {
        console.error("Passport authentication error:", err);
        const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0].trim() : 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/registration?error=authentication_failed&message=${encodeURIComponent(err.message)}`);
      }
      if (!user) {
        console.error("No user returned from passport authentication");
        const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0].trim() : 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/registration?error=no_user_found`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  catchAsync(async (req, res) => {
    try {
      // At this point req.user should be populated by Passport
      console.log("Authenticated user:", req.user);
      
      // Ensure user exists in database (double-check)
      if (!req.user || !req.user._id) {
        throw AuthenticationError("User authentication failed");
      }

      // Generate JWT token for OAuth user
      const jwtToken = jwt.sign({ userId: req.user._id, role: req.user.role }, JWT_SECRET_KEY, { expiresIn: "24h" });

      // Remove sensitive information
      const { password, ...userWithoutPassword } = req.user.toObject ? req.user.toObject() : req.user;
      
      // Create a URL-safe JSON string of user data
      const userData = encodeURIComponent(JSON.stringify(userWithoutPassword));
      
      // Get the first frontend URL from the comma-separated list
      const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0].trim() : 'http://localhost:5173';
      
      // Redirect to frontend success page with token and user data
      res.redirect(`${frontendUrl}/oauth-success?token=${jwtToken}&userData=${userData}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      
      // Get the first frontend URL from the comma-separated list
      const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0].trim() : 'http://localhost:5173';
      
      res.redirect(`${frontendUrl}/registration?error=authentication_failed&message=${encodeURIComponent(error.message)}`);
    }
  })
);

export default router;