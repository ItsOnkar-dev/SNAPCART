import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required']
  },
  image: {
    type: String,
    required: [true, 'Product image URL is required']
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  }
}, {
  versionKey: false,
  timestamps: true
})

const Product = mongoose.model('Product', ProductSchema)

export default Product
