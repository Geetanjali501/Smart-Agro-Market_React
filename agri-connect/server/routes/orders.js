const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

const COMMISSION_RATE = 0.05; // 5%

/* ── Buyer: place order ────────────────────────────────── */
router.post('/', protect, restrictTo('buyer'), async (req, res) => {
  try {
    const { productId, quantity, deliveryAddress, deliveryOption, paymentMethod } = req.body;

    if (!productId || !quantity || quantity < 1)
      return res.status(400).json({ message: 'Product and valid quantity required' });

    const product = await Product.findById(productId);
    if (!product || product.status !== 'approved')
      return res.status(400).json({ message: 'Product not available' });
    if (product.quantity < quantity)
      return res.status(400).json({ message: `Only ${product.quantity} ${product.unit} available` });

    const totalPrice = parseFloat((product.price * quantity).toFixed(2));
    const commission = parseFloat((totalPrice * COMMISSION_RATE).toFixed(2));

    const order = await Order.create({
      buyer: req.user._id,
      farmer: product.farmer,
      product: productId,
      quantity,
      totalPrice,
      deliveryAddress,
      deliveryOption: deliveryOption || 'standard',
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'escrow',
      orderStatus: 'placed',
      escrowAmount: totalPrice,
      commission
    });

    // Reduce available stock
    product.quantity -= quantity;
    if (product.quantity === 0) product.status = 'sold';
    await product.save();

    const populated = await order.populate([
      { path: 'product', select: 'name images price unit' },
      { path: 'farmer', select: 'name farmLocation phone' }
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Get orders (role-based) ───────────────────────────── */
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'buyer') filter.buyer = req.user._id;
    else if (req.user.role === 'farmer') filter.farmer = req.user._id;
    else if (req.user.role === 'logistics') {
      // Show orders that are ready for pickup (unassigned) OR assigned to this logistics person
      filter = {
        $or: [
          { orderStatus: 'pickup_ready', logistics: { $exists: false } },
          { orderStatus: 'pickup_ready', logistics: null },
          { logistics: req.user._id }
        ]
      };
    }
    // admin sees all via /admin/orders

    const orders = await Order.find(filter)
      .populate('product', 'name images price unit')
      .populate('buyer', 'name phone')
      .populate('farmer', 'name farmLocation phone')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Get single order ──────────────────────────────────── */
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product')
      .populate('buyer', 'name phone deliveryAddress')
      .populate('farmer', 'name farmLocation phone')
      .populate('logistics', 'name phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Update order status ───────────────────────────────── */
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, trackingInfo } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { role } = req.user;

    // Role-based transition rules
    const allowed = {
      farmer: ['accepted', 'rejected', 'pickup_ready'],
      logistics: ['in_transit', 'delivered'],
      buyer: ['delivered', 'cancelled'],
      admin: ['accepted', 'rejected', 'pickup_ready', 'in_transit', 'delivered', 'cancelled']
    };

    if (!allowed[role]?.includes(status))
      return res.status(403).json({ message: `Your role cannot set status to "${status}"` });

    // Buyer cancellation only before farmer accepts
    if (role === 'buyer' && status === 'cancelled' && order.orderStatus !== 'placed')
      return res.status(400).json({ message: 'Can only cancel before farmer accepts' });

    order.orderStatus = status;
    if (trackingInfo) order.trackingInfo = trackingInfo;

    // Release escrow when buyer confirms delivery
    if (status === 'delivered') {
      order.paymentStatus = 'released';
      await User.findByIdAndUpdate(order.farmer, {
        $inc: { earnings: order.totalPrice - order.commission }
      });
    }

    // Refund escrow on cancellation
    if (status === 'cancelled' || status === 'rejected') {
      order.paymentStatus = 'refunded';
      // Restore product quantity
      await Product.findByIdAndUpdate(order.product, {
        $inc: { quantity: order.quantity },
        status: 'approved'
      });
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Logistics: claim an order ─────────────────────────── */
router.put('/:id/claim', protect, restrictTo('logistics'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.orderStatus !== 'pickup_ready')
      return res.status(400).json({ message: 'Order is not ready for pickup' });
    if (order.logistics)
      return res.status(400).json({ message: 'Order already claimed by another delivery person' });

    order.logistics = req.user._id;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Buyer: rate and review ────────────────────────────── */
router.put('/:id/review', protect, restrictTo('buyer'), async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.orderStatus !== 'delivered')
      return res.status(400).json({ message: 'Can only review delivered orders' });
    if (order.buyerRating)
      return res.status(400).json({ message: 'Already reviewed' });

    order.buyerRating = rating;
    order.buyerReview = review || '';
    await order.save();

    // Update farmer average rating
    const farmer = await User.findById(order.farmer);
    const newTotal = farmer.totalRatings + 1;
    const newRating = ((farmer.rating * farmer.totalRatings) + rating) / newTotal;
    farmer.rating = parseFloat(newRating.toFixed(2));
    farmer.totalRatings = newTotal;
    await farmer.save();

    res.json({ message: 'Review submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
