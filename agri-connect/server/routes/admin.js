const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, restrictTo } = require('../middleware/auth');

const adminOnly = [protect, restrictTo('admin')];

/* ── Dashboard ─────────────────────────────────────────── */
router.get('/dashboard', ...adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, pendingKyc, pendingProducts, revenueData] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'farmer', isVerified: true, isApproved: false }),
      Product.countDocuments({ status: 'pending' }),
      Order.aggregate([
        { $match: { paymentStatus: 'released' } },
        { $group: { _id: null, total: { $sum: '$commission' } } }
      ])
    ]);
    res.json({
      totalUsers, totalProducts, totalOrders,
      pendingKyc, pendingProducts,
      revenue: revenueData[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── KYC: pending farmers ──────────────────────────────── */
router.get('/kyc-pending', ...adminOnly, async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer', isVerified: true, isApproved: false }).select('-password');
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── KYC: approve/reject farmer ────────────────────────── */
router.put('/kyc/:userId', ...adminOnly, async (req, res) => {
  try {
    const { approved } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isApproved: approved },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Products: pending approval ────────────────────────── */
router.get('/products/pending', ...adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending' })
      .populate('farmer', 'name farmLocation')
      .sort('-createdAt');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Products: approve/reject ──────────────────────────── */
router.put('/products/:id', ...adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── All users ─────────────────────────────────────────── */
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── All orders ────────────────────────────────────────── */
router.get('/orders', ...adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'name')
      .populate('farmer', 'name')
      .populate('product', 'name')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
