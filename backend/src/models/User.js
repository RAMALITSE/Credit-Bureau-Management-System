// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Address Schema - embedded in User
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    default: 'Lesotho'
  }
});

// Employment Info Schema - embedded in User
const employmentInfoSchema = new mongoose.Schema({
  employer: {
    type: String,
    required: [true, 'Employer name is required']
  },
  position: {
    type: String,
    required: [true, 'Position is required']
  },
  yearEmployed: {
    type: Number,
    required: [true, 'Year employed is required']
  },
  monthlyIncome: {
    type: Number,
    required: [true, 'Monthly income is required']
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['consumer', 'lender', 'admin'],
    required: [true, 'User type is required']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true
  },
  address: {
    type: addressSchema,
    required: [true, 'Address is required']
  },
  employmentInfo: {
    type: employmentInfoSchema,
    required: function() {
      return this.userType === 'consumer';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Create index
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ nationalId: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, userType: this.userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Get age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const ageDiffMs = Date.now() - this.dateOfBirth.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

const User = mongoose.model('User', userSchema);

module.exports = User;