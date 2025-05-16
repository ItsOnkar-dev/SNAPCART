import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    type: String,
    required: true,
  },
  storeName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  phone: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;