import express from 'express';
import Seller from '../Models/Seller.js'
import catchAsync from '../Core/catchAsync.js'
import {BadRequestError} from '../Core/ApiError.js'
import Logger from '../Config/Logger.js'

const router = express.Router();

// Fetch all unapproved sellers
router.get('/admin/sellers', catchAsync(async (req, res) => {
  Logger.info("Fetching all unapproved sellers")
  const unapprovedSellers = await Seller.find({ approved: false });
  res.status(200).json({ status: 'success', data: unapprovedSellers });
}));

// Approve a seller
router.post('/admin/sellers/:id/approve', catchAsync(async (req, res) => {
  Logger.info("Approving a seller")
  const { id } = req.params;
  const seller = await Seller.findByIdAndUpdate(id, { approved: true }, { new: true });

  if (!seller) throw new BadRequestError('Seller not found');

  res.status(200).json({ status: 'success', message: 'Seller approved successfully', data: seller });
}));

export default router;
