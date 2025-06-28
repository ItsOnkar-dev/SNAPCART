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
  max: 1000, // 1000 login attempts per window per IP (was too restrictive at 5)
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
// Test route to verify OAuth configuration
router.get("/google/test", (req, res) => {
  res.json({
    status: 'success',
    message: 'Google OAuth configuration test',
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      callbackUrl: `${process.env.BACKEND_URL}/auth/google/callback`,
      backendUrl: process.env.BACKEND_URL,
      frontendUrl: process.env.FRONTEND_URL
    }
  });
});

// Initiate Google OAuth login
router.get(
  "/google",
  (req, res, next) => {
    console.log("=== Google OAuth Initiation ===");
    console.log("Backend URL:", process.env.BACKEND_URL);
    console.log("Frontend URL:", process.env.FRONTEND_URL);
    console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    next();
  },
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    failureRedirect: '/registration'
  })
);

// Add failure route for debugging
router.get("/google/failure", (req, res) => {
  console.log("=== Google OAuth Failed ===");
  console.log("Session:", req.session);
  console.log("Query:", req.query);
  
  const frontendUrl = process.env.FRONTEND_URL;
  res.redirect(`${frontendUrl}/registration?error=oauth_failed`);
});

// Handle Google callback
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("=== Google Callback Route Hit ===");
    console.log("Query params:", req.query);
    console.log("Headers:", req.headers);
    console.log("URL:", req.url);
    console.log("Original URL:", req.originalUrl);
    
    // Check for error in query parameters
    if (req.query.error) {
      console.error("OAuth error in callback:", req.query.error);
      console.error("Error description:", req.query.error_description);
      
      const frontendUrl = process.env.FRONTEND_URL;
      return res.redirect(`${frontendUrl}/registration?error=oauth_error&message=${encodeURIComponent(req.query.error_description || 'OAuth failed')}`);
    }
    
    next();
  },
  passport.authenticate("google", { 
    session: true,  // Changed to true for better session handling
    failureRedirect: "/auth/google/failure"
  }),
  catchAsync(async (req, res) => {
    try {
      console.log("=== OAuth Callback Success ===");
      console.log("Authenticated user:", req.user ? req.user._id : 'No user');
      
      // At this point req.user should be populated by Passport
      if (!req.user || !req.user._id) {
        console.error("No user found in request after authentication");
        throw new Error("User authentication failed - no user object");
      }

      // Generate JWT token for OAuth user
      const jwtToken = jwt.sign(
        { 
          userId: req.user._id, 
          role: req.user.role || 'Buyer' 
        }, 
        JWT_SECRET_KEY, 
        { expiresIn: "24h" }
      );

      // Remove sensitive information safely
      let userWithoutPassword;
      if (req.user.toObject) {
        const userObj = req.user.toObject();
        const { password, ...rest } = userObj;
        userWithoutPassword = rest;
      } else {
        const { password, ...rest } = req.user;
        userWithoutPassword = rest;
      }
      
      console.log("User data prepared for frontend:", {
        id: userWithoutPassword._id,
        username: userWithoutPassword.username,
        email: userWithoutPassword.email
      });
      
      // Get frontend URL safely
      const frontendUrl = process.env.FRONTEND_URL;;
      console.log("Frontend URL for redirect:", frontendUrl);
      
      // Create success URL with token and minimal user data
      const successUrl = `${frontendUrl}/oauth-success?token=${jwtToken}&userId=${userWithoutPassword._id}&username=${encodeURIComponent(userWithoutPassword.username || '')}&email=${encodeURIComponent(userWithoutPassword.email || '')}`;
      
      console.log("Redirecting to success URL");
      
      // Redirect to frontend success page
      res.redirect(successUrl);
      
    } catch (error) {
      console.error("=== OAuth Callback Error ===");
      console.error("Error:", error.message);
      console.error("Stack:", error.stack);
      
      // Safe error redirect
      const frontendUrl = process.env.FRONTEND_URL;
      const errorUrl = `${frontendUrl}/registration?error=authentication_failed&message=${encodeURIComponent(error.message)}`;
      
      console.log("Redirecting to error URL:", errorUrl);
      res.redirect(errorUrl);
    }
  })
);

// Add a health check route for OAuth
router.get("/health", (req, res) => {
  res.json({
    status: 'success',
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;