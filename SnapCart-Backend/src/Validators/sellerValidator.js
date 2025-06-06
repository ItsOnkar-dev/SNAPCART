import { check } from 'express-validator'

export const createSellerValidator = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

  check('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Please provide a valid phone number'),

  check('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
]

export const sellerLoginValidator = [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
    
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required')
]

// export const updateSellerValidator = [
//   body('username').optional().notEmpty().withMessage('username cannot be empty'),
//   body('email').optional().isEmail().withMessage('Valid email is required'),
//   body('storeName').optional().notEmpty().withMessage('Store name cannot be empty'),
//   body('storeDescription').optional().notEmpty().withMessage('Store description cannot be empty')
// ]
