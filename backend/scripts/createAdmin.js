// backend/scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { createError } = require('../src/utils/error');

const adminData = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@creditbureau.com',
  password: 'Admin123!',
  phoneNumber: '123-456-7890',
  dateOfBirth: '1990-01-01',
  nationalId: 'ADMIN123456',
  userType: 'admin',
  address: {
    street: '123 Admin St',
    city: 'Maseru',
    state: 'Maseru',
    postalCode: '100',
    country: 'Lesotho'
  }
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create the admin user - let the pre-save hook handle hashing
    const admin = await User.create({
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      passwordHash: adminData.password, // Do NOT hash it here, let the model do it
      phoneNumber: adminData.phoneNumber,
      dateOfBirth: adminData.dateOfBirth,
      nationalId: adminData.nationalId,
      userType: adminData.userType,
      address: adminData.address,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Admin user created successfully: ${admin.email}`);
    console.log('You can login with:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdmin();