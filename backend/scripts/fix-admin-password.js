// backend/scripts/fix-admin-password.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function fixAdminPassword() {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Find the admin user
    const admin = await User.findOne({ email: 'admin@creditbureau.com' }).select('+passwordHash');
    
    if (!admin) {
      console.log('Admin user not found');
      process.exit(1);
    }

    // Hash the password properly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);
    
    // Update the password
    admin.passwordHash = hashedPassword;
    
    // This time we'll use save() to bypass the pre-save middleware
    // to ensure the password is properly hashed
    admin.passwordHash = hashedPassword;
    
    // Save without triggering the pre-save hook
    await User.findByIdAndUpdate(admin._id, { passwordHash: hashedPassword });
    
    console.log('Admin password fixed successfully');
    console.log('Try logging in with:');
    console.log('Email: admin@creditbureau.com');
    console.log('Password: Admin123!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin password:', error.message);
    process.exit(1);
  }
}

// Run the function
fixAdminPassword();