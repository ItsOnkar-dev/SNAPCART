import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { AuthorizationError } from '../CoreTemp/ApiError.js'

dotenv.config()

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'JWTKJDGFSDFHDGSVFSDUFSDBFS'

export const isLoggedIn = (req, res, next) => {
  // Check if Authorization header exists
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return next(AuthorizationError('No token provided. Please login.'))
  }

  // Extract token and verify
  try {
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      console.error('Empty token')
      return next(AuthorizationError('Invalid token format'))
    }

    const decoded = jwt.verify(token, JWT_SECRET_KEY)

    // Store the complete user object
    req.user = decoded
    // For backward compatibility
    req.userId = decoded.userId

    return next() // this will call the next middleware function in the stack
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(AuthorizationError('Session expired. Please login again.'))
    }
    return next(AuthorizationError('Invalid Token. Please login to continue'))
  }
}

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user exists and their role matches the required role
    if (!req.user || !roles.includes(req.user.role)) {
      return next(AuthorizationError('You do not have permission to perform this action'))
    }
    next()
  }
}
