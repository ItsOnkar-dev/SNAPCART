import { check } from 'express-validator'

export const createSellerValidator = [
  check('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Please provide a valid phone number'),

  check('businessName')
    .trim()
    .notEmpty().withMessage('Business name is required')
    .isLength({ min: 3 }).withMessage('Business name must be at least 3 characters long'),

  check('businessAddress')
    .trim()
    .notEmpty().withMessage('Business address is required')
]

