// backend/src/models/Collection.js
const mongoose = require('mongoose');

// Collection Schema
const collectionSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditProfile',
    required: true
  },
  originalAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditAccount'
  },
  collectionAgency: {
    type: String,
    required: true
  },
  originalCreditor: {
    type: String,
    required: true
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  collectionDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paid', 'settled', 'disputed'],
    default: 'active'
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  expiresFromRecord: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
collectionSchema.index({ profileId: 1 });
collectionSchema.index({ originalAccountId: 1 });
collectionSchema.index({ status: 1 });
collectionSchema.index({ expiresFromRecord: 1 });

// Check if collection is expired
collectionSchema.virtual('isExpired').get(function() {
  return this.expiresFromRecord < new Date();
});

// Get years until expiration
collectionSchema.virtual('yearsUntilExpiration').get(function() {
  if (this.isExpired) return 0;
  
  const diffTime = this.expiresFromRecord - new Date();
  const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
  return diffYears;
});

// Static method to get active collections
collectionSchema.statics.getActiveCollections = async function(profileId) {
  return this.find({
    profileId,
    expiresFromRecord: { $gt: new Date() },
    status: { $ne: 'paid' }
  }).sort({ collectionDate: -1 });
};

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;