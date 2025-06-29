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

// Initiate Google OAuth login
router.get(
  "/google",
  (req, res, next) => {
    // Create a custom state that includes environment info
    const state = req.query.state || encodeURIComponent(JSON.stringify({
      environment: 'production',
      origin: 'https://snapcart-now.netlify.app'
    }));
    
    // Store the state in a way that will be preserved
    res.cookie('oauth_state', state, { 
      maxAge: 5 * 60 * 1000, // 5 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    next();
  },
  passport.authenticate("google", { 
    scope: ["profile", "email"]
  })
);

// Handle Google callback
router.get(
  "/google/callback", 
  passport.authenticate("google", { 
    session: false,
    failureRedirect: "/registration" 
  }),
  catchAsync(async (req, res) => {
    try {
      // At this point req.user should be populated by Passport
      console.log("Authenticated user:", req.user);
      
      // Ensure user exists in database (double-check)
      if (!req.user || !req.user._id) {
        console.error("No user found in request after authentication");
        throw AuthenticationError("User authentication failed");
      }

      // Generate JWT token for OAuth user
      const jwtToken = jwt.sign({ userId: req.user._id }, JWT_SECRET_KEY, { expiresIn: "24h" });

      // Remove sensitive information
      const { password, ...userWithoutPassword } = req.user.toObject ? req.user.toObject() : req.user;
      
      // Create a URL-safe JSON string of user data
      const userData = encodeURIComponent(JSON.stringify(userWithoutPassword));
      
      // Safely get frontend URL - detect environment from state
      let frontendUrl = process.env.FRONTEND_URL;
      if (!frontendUrl) {
        throw new Error("Frontend URL not configured");
      }

      // Handle comma-separated URLs and detect environment from state
      const frontendUrls = frontendUrl.split(',').map(url => url.trim());
      let redirectUrl = frontendUrls[0]; // Default to first URL
      
      // Try to get environment from state (from cookie or query)
      let environment = 'production'; // Default to production
      
      try {
        const stateData = req.cookies?.oauth_state || req.query.state;
        if (stateData) {
          const parsedState = JSON.parse(decodeURIComponent(stateData));
          environment = parsedState.environment || 'production';
          origin = parsedState.origin || '';
        }
      } catch (error) {
        // Fallback to referer-based detection
        const referer = req.headers.referer || req.headers.origin || '';
        if (referer.includes('localhost') || referer.includes('127.0.0.1')) {
          environment = 'development';
        }
      }
      
      // Choose URL based on environment
      if (frontendUrls.length > 1) {
        if (environment === 'development') {
          const localhostUrl = frontendUrls.find(url => 
            url.includes('localhost') || url.includes('127.0.0.1')
          );
          if (localhostUrl) {
            redirectUrl = localhostUrl; // Using localhost URL for development
          }
        } else {
          const deployedUrl = frontendUrls.find(url => 
            !url.includes('localhost') && !url.includes('127.0.0.1')
          );
          if (deployedUrl) {
            redirectUrl = deployedUrl;  // Using deployed URL for production
          }
        }
      }
      
      // Clear the OAuth state cookie
      res.clearCookie('oauth_state');
      
      // Redirect to frontend success page with token and user data
      res.redirect(`${redirectUrl}/oauth-success?token=${jwtToken}&userData=${userData}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      
      // Safely handle error redirect - use same logic as success
      let frontendUrl = process.env.FRONTEND_URL;
      if (frontendUrl) {
        const frontendUrls = frontendUrl.split(',').map(url => url.trim());
        let redirectUrl = frontendUrls[0];
        
        // Apply same environment detection logic for error redirects
        let environment = 'production';
        try {
          const stateData = req.cookies?.oauth_state || req.query.state;
          if (stateData) {
            const parsedState = JSON.parse(decodeURIComponent(stateData));
            environment = parsedState.environment || 'production';
          }
        } catch (error) {
          const referer = req.headers.referer || req.headers.origin || '';
          if (referer.includes('localhost') || referer.includes('127.0.0.1')) {
            environment = 'development';
          }
        }
        
        if (frontendUrls.length > 1) {
          if (environment === 'development') {
            const localhostUrl = frontendUrls.find(url => 
              url.includes('localhost') || url.includes('127.0.0.1')
            );
            if (localhostUrl) {
              redirectUrl = localhostUrl;
            }
          } else {
            const deployedUrl = frontendUrls.find(url => 
              !url.includes('localhost') && !url.includes('127.0.0.1')
            );
            if (deployedUrl) {
              redirectUrl = deployedUrl;
            }
          }
        }
        
        res.redirect(`${redirectUrl}/registration?error=authentication_failed`);
      } else {
        // Fallback error response
        res.status(500).json({ 
          status: 'error', 
          message: 'Authentication failed. Please try again.' 
        });
      }
    }
  })
);

export default router;