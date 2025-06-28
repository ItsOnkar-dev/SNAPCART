import MongoStore from 'connect-mongo'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import helmet from 'helmet'
import passport from './Config/passport-setup.js'
import adminRoutes from './Routes/admin.js'
import authRoutes from './Routes/auth.js'
import productRoutes from './Routes/products.js'
import reviewRoutes from './Routes/review.js'
import sellerRoutes from './Routes/sellers.js'
import userRoutes from './Routes/users.js'

const app = express()

dotenv.config(); // Load environment variables from .env file

const allowedOrigins = process.env.FRONTEND_URL.split(',');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] ,
  credentials: true
})) 
app.use(express.json()) // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET_KEY || 'cdhbuebyewruflewbr6374fjkd',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URL, 
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Add debugging middleware for OAuth routes
app.use('/auth', (req, res, next) => {
  console.log(`OAuth request: ${req.method} ${req.path}`);
  console.log('Session:', req.session);
  console.log('User:', req.user);
  next();
});

// Help secure Express apps by setting HTTP response headers.
app.use(helmet())

//  global rate limiting for all endpoints.
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000, // adjust as needed
})
app.use(globalLimiter)

app.use('/api', productRoutes) // Add product routes
app.use('/api', reviewRoutes) // Add review routes
app.use('/user', userRoutes) // Add user routes
app.use('/auth', authRoutes) // Add auth routes
app.use(sellerRoutes)
app.use('/api/admin', adminRoutes) // Add admin routes

// Health check route
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global Express Error Handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request headers:', req.headers);
  
  const statusCode = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  const errors = err.errors || null
  
  const response = {
    status: 'error',
    message
  }
  
  if (errors) response.errors = errors
  
  // Log additional error details in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response)
})

export default app
