import { body } from 'express-validator';

export const createSellerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('storeName').notEmpty().withMessage('Store name is required'),
  body('storeDescription').notEmpty().withMessage('Store description is required'),
];

export const updateSellerValidator = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('storeName').optional().notEmpty().withMessage('Store name cannot be empty'),
  body('storeDescription').optional().notEmpty().withMessage('Store description cannot be empty'),
]; 