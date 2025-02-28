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

// History Entry Schema - embedded in Dispute
const historyEntrySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['created', 'updated', 'responded', 'resolved', 'rejected'],
    required: true
  },
  actionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionByType: {
    type: String,
    enum: ['consumer', 'lender', 'admin'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

// Dispute Schema
const disputeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditAccount',
    required: true
  },
  lenderId: {
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
    required: true,
    minlength: 10
  },
  affectedItems: [affectedItemSchema],
  supportingDocuments: [{
    type: String
  }],
  lenderResponse: {
    type: String
  },
  adminResolution: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'resolved', 'rejected'],
    default: 'pending'
  },
  history: [historyEntrySchema],
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes
disputeSchema.index({ userId: 1 });
disputeSchema.index({ accountId: 1 });
disputeSchema.index({ lenderId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ disputeReason: 1 });
disputeSchema.index({ createdAt: 1 });

// Virtual for calculating dispute age in days
disputeSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for determining if dispute is overdue for resolution (30 days)
disputeSchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'rejected') {
    return false;
  }
  return this.ageInDays > 30;
});

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;