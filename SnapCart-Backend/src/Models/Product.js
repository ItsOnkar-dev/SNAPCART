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
    required: [true, 'Seller ID is required'],
    index: true
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {
  versionKey: false,
  timestamps: true
})

ProductSchema.index({ title: 'text', description: 'text' })
ProductSchema.index({ price: 1 })
ProductSchema.index({ createdAt: -1 })

const Product = mongoose.model('Product', ProductSchema)

export default Product
