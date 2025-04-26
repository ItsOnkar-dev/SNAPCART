import express from 'express'
import productRoutes from './Routes/products.js'
import userRoutes from './Routes/user.js'
import authRoutes from './Routes/auth.js'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session';
import passport from './Config/passport-setup.js';

const app = express();

dotenv.config(); // Load environment variables from .env file

app.use(cors()) // Enable CORS for all requests
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET_KEY || 'cdhbuebyewruflewbr6374fjkd',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', productRoutes) // Add product routes
app.use('/user', userRoutes)  // Add user routes
app.use('/auth', authRoutes) // Add auth routes

// Global Express Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Internal Server Error' } = err;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    errMsg: message
  });
})

export default app
 