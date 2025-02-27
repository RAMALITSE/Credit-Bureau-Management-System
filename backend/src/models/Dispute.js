// backend/src/models/Dispute.js
const mongoose = require('mongoose');

// Affected Item Schema - embedded in Dispute
const affectedItemSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true
  },
  currentValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  claimedValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  }
});

// Dispute Schema
const disputeSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditProfile',
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditAccount',
    required: true
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  disputeReason: {
    type: String,
    enum: ['not_mine', 'incorrect_amount', 'paid_debt', 'incorrect_status', 'duplicate_account', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  supportingDocuments: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'rejected', 'canceled'],
    default: 'pending'
  },
  lenderResponse: {
    type: String
  },
  resolution: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  affectedItems: [affectedItemSchema]
}, {
  timestamps: true
});

// Create indexes
disputeSchema.index({ profileId: 1 });
disputeSchema.index({ accountId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ disputeReason: 1 });

// Get dispute resolution time in days
disputeSchema.virtual('resolutionTimeDays').get(function() {
  if (!this.resolvedAt || !this.createdAt) return null;
  
  const diffTime = this.resolvedAt - this.createdAt;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Get number of affected items resolved
disputeSchema.virtual('resolvedItemsCount').get(function() {
  if (!this.affectedItems || this.affectedItems.length === 0) return 0;
  
  return this.affectedItems.filter(item => item.resolved).length;
});

// Get dispute progress percentage
disputeSchema.virtual('progressPercentage').get(function() {
  switch (this.status) {
    case 'pending':
      return 0;
    case 'investigating':
      return 50;
    case 'resolved':
    case 'rejected':
    case 'canceled':
      return 100;
    default:
      return 0;
  }
});

// Static method to get recent disputes
disputeSchema.statics.getRecentDisputes = async function(profileId, limit = 5) {
  return this.find({ profileId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;