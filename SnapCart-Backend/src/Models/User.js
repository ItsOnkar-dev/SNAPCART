import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    required: function () {
      // Only required if password is set (local account)
      return this.password ? true : false
    }
  },
  password: {
    type: String,
    required: function () {
      // Only required if no googleId (local account)
      return this.googleId ? false : true
    }
  },
  googleId: {
    type: String
  },
  role: {
    type: String,
    enum: ['Seller', 'Buyer', 'Admin'],
    default: 'Buyer'
  },
  avatar: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true, versionKey: false })

const User = mongoose.model('User', userSchema)

export default User
