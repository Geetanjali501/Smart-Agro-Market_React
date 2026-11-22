const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  price: { type: Number, required: true },
  aiSuggestedPrice: Number,
  qualityGrade: { type: String, enum: ['A', 'B', 'C'], required: true },
  harvestDate: Date,
  isOrganic: { type: Boolean, default: false },
  images: [String],
  location: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'sold'], default: 'pending' },
  adminNote: String,
  priceHistory: [{ price: Number, date: { type: Date, default: Date.now } }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
