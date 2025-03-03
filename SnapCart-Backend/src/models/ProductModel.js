import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
},{versionKey: false, timestamps: true})

const Product = mongoose.model('Product', productSchema);

export default Product;