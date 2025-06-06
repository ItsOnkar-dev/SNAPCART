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
import sellerRoutes from './Routes/sellers.js'
import userRoutes from './Routes/users.js'

const app = express()

dotenv.config(); // Load environment variables from .env file

app.use(cors()) // Enable CORS for all requests
app.use(express.json()) // Parse incoming JSON requests
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
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Help secure Express apps by setting HTTP response headers.
app.use(helmet())

//  global rate limiting for all endpoints.
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000, // adjust as needed
})
app.use(globalLimiter)

app.use('/api', productRoutes) // Add product routes
app.use('/user', userRoutes) // Add user routes
app.use('/auth', authRoutes) // Add auth routes
app.use(sellerRoutes)
app.use('/api/admin', adminRoutes) // Add admin routes

// Global Express Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  const errors = err.errors || null
  const response = {
    status: 'error',
  message}
  if (errors) response.errors = errors
  res.status(statusCode).json(response)
})

export default app
