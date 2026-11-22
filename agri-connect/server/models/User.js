const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'buyer', 'logistics', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }, // for farmers KYC
  otp: String,
  otpExpiry: Date,
  avatar: String,

  // Farmer-specific
  farmLocation: String,
  cropsGrown: [String],
  landSize: String,
  bankDetails: {
    accountNumber: String,
    ifsc: String,
    accountHolder: String
  },

  // Buyer-specific
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  businessType: { type: String, enum: ['consumer', 'retailer', 'wholesaler', 'restaurant'] },
  paymentPreferences: [String],

  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
