const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  deliveryOption: { type: String, enum: ['standard', 'cold-chain', 'pickup'], default: 'standard' },
  paymentMethod: String,
  paymentStatus: { type: String, enum: ['pending', 'escrow', 'released', 'refunded'], default: 'pending' },
  orderStatus: {
    type: String,
    enum: ['placed', 'accepted', 'rejected', 'pickup_ready', 'in_transit', 'delivered', 'cancelled'],
    default: 'placed'
  },
  logistics: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trackingInfo: String,
  buyerRating: { type: Number, min: 1, max: 5 },
  buyerReview: String,
  qualityVerified: { type: Boolean, default: false },
  escrowAmount: Number,
  commission: Number
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
