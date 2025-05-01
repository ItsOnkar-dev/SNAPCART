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
  // approved: {
  //   type: Boolean,
  //   default: false, // Initially, sellers are not approved
  // },
});

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
