const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  }
});

/* ── Farmer: get own listings ── MUST be before /:id ───── */
router.get('/farmer/my-listings', protect, restrictTo('farmer'), async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort('-createdAt');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Get all approved products (marketplace) ───────────── */
router.get('/', async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, grade, organic, search } = req.query;
    const filter = { status: 'approved' };
    if (category) filter.category = new RegExp(category, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (grade) filter.qualityGrade = grade;
    if (organic === 'true') filter.isOrganic = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.name = new RegExp(search, 'i');

    const products = await Product.find(filter)
      .populate('farmer', 'name farmLocation rating')
      .sort('-createdAt');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Get single product ────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name farmLocation rating totalRatings');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Farmer: create listing ────────────────────────────── */
router.post('/', protect, restrictTo('farmer'), upload.array('images', 5), async (req, res) => {
  try {
    if (!req.user.isApproved)
      return res.status(403).json({ message: 'KYC not approved yet. Wait for admin approval.' });

    let images = (req.files || []).map(f => `/uploads/${f.filename}`);

    // If no uploaded files but autoImageUrl was sent, use it directly
    if (images.length === 0 && req.body.autoImageUrl) {
      images = [req.body.autoImageUrl];
    }

    const price = parseFloat(req.body.price);

    const product = await Product.create({
      ...req.body,
      price,
      quantity: parseInt(req.body.quantity),
      farmer: req.user._id,
      images,
      status: 'approved' // auto-approved, no admin review needed
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Farmer: update listing ────────────────────────────── */
router.put('/:id', protect, restrictTo('farmer'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    Object.assign(product, req.body);
    product.status = 'approved'; // stays live after edit
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Farmer: delete listing ────────────────────────────── */
router.delete('/:id', protect, restrictTo('farmer'), async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
