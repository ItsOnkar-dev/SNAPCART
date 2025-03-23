import express from "express";
import bcrypt from "bcrypt"; // A library to help you hash passwords.
import { validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import UserRepo from "../Repositories/UserRepo.js";
import catchAsync from "../Core/catchAsync.js";
import { BadRequestError } from "../Core/ApiError.js";

const router = express.Router();

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 15 login attempts per window per IP
  message: "Too many login attempts, please try again later",
});

router.get("/user", (req, res) => {
  res.send("User Route");
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

    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ msg: "Please enter all required credentials" });
    }

    // Check user with the given username or email already exists?
    const existingUserByUsername = await UserRepo.findByUsername(username);
    const existingUserByEmail = await UserRepo.findByEmail(email);

    if (existingUserByUsername || existingUserByEmail) {
      throw new BadRequestError(`User with the ${existingUserByUsername ? `username :- ${username}` : `email :- ${email}`} already exists`);
    }

    // To hash a password using bcrypt, you can use the hash() function. The first argument is the password you want to hash, and the second argument is ( saltRounds) the number of rounds you want to use. When you are hashing your data, the module will go through a series of rounds to give you a secure hash. The higher the number of rounds, the more secure the password will be.
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await UserRepo.CreateUser(username, passwordHash, email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      msg: "User registered successfully",
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

    const { username, email, password } = req.body;

    // Check if there's at least one identifier (username or email) and password
    if ((!username && !email) || !password) {
      return res.status(400).json({ msg: "Please enter all required credentials" });
    }

    // Find user with a single database call
    const user = username ? await UserRepo.findByUsername(username) : await UserRepo.findByEmail(email);

    // Check if user exists - using generic message for security
    if (!user) {
      throw new BadRequestError("No user found with the provided username or email");
    }

    // Verify password (assuming you have a password verification function)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid Password");
    }

    // Before sending the response, remove the password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ 
      msg: "User logged in successfully", 
      user: userWithoutPassword });
  })
);

export default router;
