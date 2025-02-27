// backend/src/models/Report.js
const mongoose = require('mongoose');

// Access Log Schema - embedded in Report
const accessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  }
});

// Report Schema
const reportSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditProfile',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  reportType: {
    type: String,
    enum: ['full', 'summary', 'specialized'],
    default: 'full'
  },
  reportFormat: {
    type: String,
    enum: ['pdf', 'json', 'html'],
    default: 'json'
  },
  reportData: {
    type: Object,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  accessToken: {
    type: String,
    required: true,
    unique: true
  },
  accessLog: [accessLogSchema]
}, {
  timestamps: true
});

// Create indexes
reportSchema.index({ profileId: 1 });
reportSchema.index({ requestedBy: 1 });
reportSchema.index({ accessToken: 1 }, { unique: true });

// Check if report is expired
reportSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Get days until expiration
reportSchema.virtual('daysUntilExpiration').get(function() {
  if (this.isExpired) return 0;
  
  const diffTime = this.expiresAt - new Date();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Get number of times accessed
reportSchema.virtual('accessCount').get(function() {
  return this.accessLog.length;
});

// Static method to get recently generated reports
reportSchema.statics.getRecentReports = async function(profileId, limit = 5) {
  return this.find({ profileId })
    .sort({ generatedAt: -1 })
    .limit(limit);
};

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;