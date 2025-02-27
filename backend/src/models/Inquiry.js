// backend/src/models/Inquiry.js
const mongoose = require('mongoose');

// Inquiring Entity Schema - embedded in Inquiry
const inquiringEntitySchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

// Inquiry Schema
const inquirySchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditProfile',
    required: true
  },
  inquiringEntity: {
    type: inquiringEntitySchema,
    required: true
  },
  inquiryType: {
    type: String,
    enum: ['hard', 'soft'],
    required: true
  },
  inquiryPurpose: {
    type: String,
    enum: ['new_credit', 'credit_review', 'account_review', 'employment', 'insurance', 'prequalification'],
    required: true
  },
  inquiryDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
inquirySchema.index({ profileId: 1 });
inquirySchema.index({ inquiryDate: 1 });
inquirySchema.index({ expiresAt: 1 });

// Check if inquiry is expired
inquirySchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Get months remaining until expiration
inquirySchema.virtual('monthsUntilExpiration').get(function() {
  if (this.isExpired) return 0;
  
  const diffTime = this.expiresAt - new Date();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return diffMonths;
});

// Static method to get recent inquiries
inquirySchema.statics.getRecentInquiries = async function(profileId, months = 12) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  return this.find({
    profileId,
    inquiryDate: { $gte: cutoffDate }
  }).sort({ inquiryDate: -1 });
};

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;