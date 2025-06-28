import mongoose from 'mongoose';

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
      // Required for all users (both local and OAuth)
      return true;
    },
    index: true
  },
  password: {
    type: String,
    required: function () {
      // Only required for local accounts (not OAuth users)
      return !this.googleId;
    }
  },
  googleId: {
    type: String
  },
  role: {
    type: String,
    enum: ['PlatformAdmin', 'Seller', 'Buyer'],
    default: 'Buyer'
  },
  // Additional fields for platform admin
  isPlatformAdmin: {
    type: Boolean,
    default: false
  },
  // Additional fields for seller
  isSeller: {
    type: Boolean,
    default: false
  },
  sellerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  avatar: {
    type: String
  },
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true, versionKey: false })

// Middleware to ensure role and isPlatformAdmin stay in sync
userSchema.pre('save', function(next) {
  if (this.role === 'PlatformAdmin') {
    this.isPlatformAdmin = true;
  } else {
    this.isPlatformAdmin = false;
  }
  next();
});

const User = mongoose.model('User', userSchema)

export default User
