import express from "express";
import bcrypt from "bcrypt"; // A library to help you hash passwords.
import { validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import UserRepo from "../Repositories/UserRepo.js";
import catchAsync from "../Core/catchAsync.js";
import { AuthenticationError, BadRequestError } from "../Core/ApiError.js";
import jwt from "jsonwebtoken";
import isLoggedIn from "../Middlewares/Auth.js";

const router = express.Router();

const JWT_SECRET_KEY = "JWTKJDGFSDFHDGSVFSDUFSDBFS";

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // 15 login attempts per window per IP
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
  "/login",
  loginLimiter,
  catchAsync(async (req, res) => {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Check if there's at least one identifier (username or email) and password
    if (!username || !password) {
      return res.status(400).json({ msg: "Please enter all required credentials" });
    }

    // Find user with a single database call
    const user = await UserRepo.findByUsername(username)

    if (!user) {
      throw new AuthenticationError("No user found with the provided credentials");
    }

    // Verify password (assuming you have a password verification function)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid Username/Password");
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET_KEY);

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
router.get('/profile', isLoggedIn, catchAsync(async (req, res) => {
  const { userId } = req;
  // Find user by ID from the token, excluding password
  const user = await UserRepo.findByUserId(userId);
  
  if (!user) {
      console.error('User not found for ID:', req.userId);
      throw new AuthenticationError("User not found, Please login again to continue");
  }

  // Remove sensitive information before sending
  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    user: userWithoutPassword,
  });
}));

export default router;
