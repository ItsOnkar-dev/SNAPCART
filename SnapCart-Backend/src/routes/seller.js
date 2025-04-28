import express from 'express';
import Seller from '../Models/Seller.js'
import catchAsync from '../Core/catchAsync.js'
import {InternalServerError} from '../Core/ApiError.js'
import Logger from '../Config/Logger.js'

const router = express.Router();

// Create a new seller
router.post('/sellers', catchAsync(async (req, res) => {
  Logger.info("Create the seller request received", { body: req.body })
  const { name, email, storeName, storeDescription } = req.body;

  const newSeller = await Seller.create({
    name,
    email,
    storeName,
    storeDescription,
  });

  if (!newSeller) throw new InternalServerError('Failed to create seller');

  res.status(201).json({ status: 'success', message: 'Seller created successfully', data: newSeller });
}));

export default router;