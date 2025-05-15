import { body } from 'express-validator';

export const createProductValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('image').notEmpty().withMessage('Image is required'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
];

export const updateProductValidator = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('image').optional().notEmpty().withMessage('Image cannot be empty'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
]; 