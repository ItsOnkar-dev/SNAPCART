import jwt from 'jsonwebtoken'
import { AuthorizationError } from '../Core/ApiError.js'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'JWTKJDGFSDFHDGSVFSDUFSDBFS'

export const isLoggedIn = (req, res, next) => {
  // Check if Authorization header exists
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return next(new AuthorizationError('No token provided. Please login.'))
  }

  // Extract token and verify
  try {
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      console.error('Empty token')
      return next(new AuthorizationError('Invalid token format'))
    }

    const { userId } = jwt.verify(token, JWT_SECRET_KEY)
    req.user = { _id: userId }

    req.userId = userId

    return next() // this will call the next middleware function in the stack
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AuthorizationError('Session expired. Please login again.'))
    }
    return next(new AuthorizationError('Invalid Token. Please login to continue'))
  }
}

export const restrictTo = (role) => {
  return (req, res, next) => {
    // Check if user exists and their role matches the required role
    if (!req.user || req.user.role !== role) {
      return next(new AuthorizationError('You do not have permission to perform this action'))
    }

    next()
  }
}
