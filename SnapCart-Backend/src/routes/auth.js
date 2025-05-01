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

dotenv.config();

const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "JWTKJDGFSDFHDGSVFSDUFSDBFS";

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 login attempts per window per IP
  message: "Too many login attempts, please try again later",
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
  "/registration",
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
        throw new Error("User authentication failed");
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
