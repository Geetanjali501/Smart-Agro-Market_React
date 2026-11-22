/**
 * Seed script — creates an admin user for initial setup.
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ role: 'admin' });
  if (exists) { console.log('Admin already exists:', exists.email); process.exit(0); }

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@agriconnect.com',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
    isApproved: true
  });
  console.log('Admin created:', admin.email, '| Password: Admin@1234');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
