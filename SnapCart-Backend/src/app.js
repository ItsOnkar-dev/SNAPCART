import MongoStore from 'connect-mongo'
import cookieParser from 'cookie-parser'
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

dotenv.config();

// Safely handle FRONTEND_URL environment variable - support both environments
let allowedOrigins = [];
if (process.env.FRONTEND_URL) {
  const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins = frontendUrls;
} else {
  // Only use fallback if FRONTEND_URL is not set
  allowedOrigins = ['http://localhost:5173'];
}

console.log("CORS allowed origins:", allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] ,
  credentials: true
})) 
app.use(express.json()) // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser()); // Parse cookies

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
    secure: process.env.NODE_ENV === 'production' && process.env.BACKEND_URL?.startsWith('https'),
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: 'lax'
  }
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Add debugging middleware for OAuth routes
app.use('/auth', (req, res, next) => {
  console.log(`OAuth request: ${req.method} ${req.path}`);
  console.log('Session:', req.session);
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

// Global Express Error Handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  
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
