// backend/src/models/PublicRecord.js
const mongoose = require('mongoose');

// Public Record Schema
const publicRecordSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditProfile',
    required: true
  },
  recordType: {
    type: String,
    enum: ['bankruptcy', 'tax_lien', 'judgment', 'foreclosure', 'civil_suit'],
    required: true
  },
  caseNumber: {
    type: String,
    required: true
  },
  courtName: {
    type: String,
    required: true
  },
  filedDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['filed', 'discharged', 'dismissed', 'satisfied', 'vacated'],
    required: true
  },
  resolvedDate: {
    type: Date
  },
  liabilityAmount: {
    type: Number,
    required: function() {
      return ['tax_lien', 'judgment', 'civil_suit'].includes(this.recordType);
    },
    min: 0
  },
  expiresFromRecord: {
    type: Date,
    required: true
  },
  reportedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
publicRecordSchema.index({ profileId: 1 });
publicRecordSchema.index({ recordType: 1 });
publicRecordSchema.index({ filedDate: 1 });
publicRecordSchema.index({ expiresFromRecord: 1 });

// Check if record is expired
publicRecordSchema.virtual('isExpired').get(function() {
  return this.expiresFromRecord < new Date();
});

// Check if record is resolved
publicRecordSchema.virtual('isResolved').get(function() {
  return ['discharged', 'dismissed', 'satisfied', 'vacated'].includes(this.status);
});

// Get years remaining until expiration
publicRecordSchema.virtual('yearsUntilExpiration').get(function() {
  if (this.isExpired) return 0;
  
  const diffTime = this.expiresFromRecord - new Date();
  const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
  return diffYears;
});

// Static method to get active public records
publicRecordSchema.statics.getActiveRecords = async function(profileId) {
  return this.find({
    profileId,
    expiresFromRecord: { $gt: new Date() },
    status: { $nin: ['discharged', 'dismissed', 'satisfied', 'vacated'] }
  }).sort({ filedDate: -1 });
};

// Determine impact severity of public record
publicRecordSchema.virtual('impactSeverity').get(function() {
  if (this.isExpired || this.isResolved) return 'none';
  
  switch (this.recordType) {
    case 'bankruptcy':
      return 'severe';
    case 'foreclosure':
      return 'high';
    case 'tax_lien':
    case 'judgment':
      return 'medium';
    default:
      return 'low';
  }
});

const PublicRecord = mongoose.model('PublicRecord', publicRecordSchema);

module.exports = PublicRecord;