import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  storeName: {
    type: String,
    required: true,
    unique: true,
  },
  storeDescription: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    default: true, // Initially sellers are approved by default (can be changed to false if admin approval is needed)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;