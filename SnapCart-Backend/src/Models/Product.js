import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
},{versionKey: false, timestamps: true})

const Product = mongoose.model('Product', ProductSchema);

export default Product;