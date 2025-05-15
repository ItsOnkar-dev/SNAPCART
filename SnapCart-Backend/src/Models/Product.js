import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
},{versionKey: false, timestamps: true})

const Product = mongoose.model('Product', ProductSchema);

export default Product;