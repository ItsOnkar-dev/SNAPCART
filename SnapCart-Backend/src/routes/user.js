import express from 'express'
import bcrypt from 'bcrypt' // A library to help you hash passwords.
import UserRepo from '../Repositories/UserRepo.js';
import catchAsync from '../Core/catchAsync.js';
import {BadRequestError} from '../Core/ApiError.js';

const router = express.Router();

router.get('/user', (req, res) => {
  res.send('User Route');
});

// User Register 
router.post('/register', catchAsync(async(req, res) => {
  const {username, password, email} = req.body;

  if(!username || !password || !email) {
    return res.status(400).json({msg: 'Please enter all fields'});
  }

  // Check user with the given username already exists?
  const user = await UserRepo.findByUsername(username);
  if(user) throw new BadRequestError(`User with the username:${username} already exists`);

  // To hash a password using bcrypt, you can use the hash() function. The first argument is the password you want to hash, and the second argument is ( saltRounds) the number of rounds you want to use. When you are hashing your data, the module will go through a series of rounds to give you a secure hash. The higher the number of rounds, the more secure the password will be.
  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await UserRepo.CreateUser(username, passwordHash, email);
  res.status(201).json({msg: 'User registered successfully', user: newUser});
}))


// User Login
router.post('/login', catchAsync(async(req, res) => {
  const { username, email, password } = req.body;
  
  // Check if there's at least one identifier (username or email) and password
  if((!username && !email) || !password) {
    return res.status(400).json({msg: 'Please enter all required fields'});
  }
  
  // Try to find user by username first, then by email if username not provided
  const identifier = username || email;
  const user = await UserRepo.findByUsername(identifier) || await UserRepo.findByEmail(identifier);
  
  if(!user) {
    throw new BadRequestError(`No user found with the provided credentials`);
  }
  
  // Compare the password with the hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) throw new BadRequestError('Password is incorrect, Please try again');
  
  res.status(200).json({msg: 'User logged in successfully', user});
}));

export default router;