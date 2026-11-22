require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/* ── Register ──────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !password || !role)
      return res.status(400).json({ message: 'Name, password and role are required' });
    if (!email && !phone)
      return res.status(400).json({ message: 'Email or phone is required' });

    // Build query carefully — avoid matching null fields
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });
    const existing = await User.findOne({ $or: orConditions });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({ name, email, phone, password, role, otp, otpExpiry });

    // Try to send SMS if Twilio is configured and phone is provided
    let smsSent = false;
    if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid') {
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const normalized = phone.startsWith('+') ? phone : `+${phone}`;
        await twilio.messages.create({
          body: `Your AgriConnect OTP is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: normalized
        });
        smsSent = true;
        console.log(`SMS OTP sent to ${phone}`);
      } catch (smsErr) {
        console.error('Twilio SMS failed:', smsErr.message);
      }
    }

    // Always log OTP in dev so you're never locked out
    console.log(`\n====== OTP for ${name}: ${otp} ======\n`);

    res.status(201).json({
      message: smsSent ? 'OTP sent to your phone' : 'OTP generated',
      userId: user._id,
      // Always expose OTP in dev for easy testing
      devOtp: otp,
      smsSent
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Verify OTP ────────────────────────────────────────── */
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp || new Date() > user.otpExpiry)
      return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    if (user.role !== 'farmer') user.isApproved = true;
    await user.save();

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id, name: user.name, role: user.role,
        isApproved: user.isApproved, isVerified: true
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Login ─────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone))
      return res.status(400).json({ message: 'Credentials required' });

    // Find by email OR phone (whichever was provided)
    const query = email ? { email: email.toLowerCase().trim() } : { phone: phone.trim() };
    const user = await User.findOne(query);

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified)
      return res.status(401).json({ message: 'Account not verified. Please verify OTP first.' });

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id, name: user.name, role: user.role,
        isApproved: user.isApproved, isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Get current user ──────────────────────────────────── */
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

/* ── Update profile ────────────────────────────────────── */
router.put('/profile', protect, async (req, res) => {
  try {
    const updates = { ...req.body };
    // strip fields that must never be updated via this endpoint
    delete updates.password;
    delete updates.role;
    delete updates.isApproved;
    delete updates.isVerified;
    delete updates.otp;
    delete updates.otpExpiry;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
