// backend/src/models/CreditAccount.js
const mongoose = require('mongoose');
const { encryptField, decryptField } = require('../utils/encryption'); // You'll create this utility

// Payment History Schema - embedded in CreditAccount
const paymentHistorySchema = new mongoose.Schema({
  dueDate: {
    type: Date,
    required: true
  },
  amountDue: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  datePaid: {
    type: Date
  },
  status: {
    type: String,
    enum: ['on_time', 'late_30', 'late_60', 'late_90', 'default'],
    required: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  }
});

// Credit Account Schema
const creditAccountSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditProfile',
    required: true
  },
  accountType: {
    type: String,
    enum: ['loan', 'credit_card', 'mortgage', 'auto_loan', 'student_loan', 'utility'],
    required: true
  },
  lenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lenderName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    get: decryptField,
    set: encryptField
  },
  openDate: {
    type: Date,
    required: true
  },
  closeDate: {
    type: Date
  },
  creditLimit: {
    type: Number,
    required: function() {
      return this.accountType === 'credit_card';
    },
    min: 0
  },
  currentBalance: {
    type: Number,
    required: true,
    min: 0
  },
  originalAmount: {
    type: Number,
    required: function() {
      return ['loan', 'mortgage', 'auto_loan', 'student_loan'].includes(this.accountType);
    },
    min: 0
  },
  paymentHistory: [paymentHistorySchema],
  status: {
    type: String,
    enum: ['current', 'closed', 'delinquent', 'default', 'collection'],
    default: 'current'
  },
  lastReportDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { getters: true }
});

// Create indexes
creditAccountSchema.index({ profileId: 1 });
creditAccountSchema.index({ lenderId: 1 });
creditAccountSchema.index({ status: 1 });

// Calculate account age in months
creditAccountSchema.virtual('accountAge').get(function() {
  const endDate = this.closeDate || new Date();
  const diffTime = Math.abs(endDate - this.openDate);
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return diffMonths;
});

// Calculate payment reliability percentage
creditAccountSchema.virtual('paymentReliability').get(function() {
  if (this.paymentHistory.length === 0) return 100;
  
  const totalPayments = this.paymentHistory.length;
  const onTimePayments = this.paymentHistory.filter(payment => 
    payment.status === 'on_time').length;
    
  return Math.round((onTimePayments / totalPayments) * 100);
});

// Update account status based on payment history
creditAccountSchema.pre('save', function(next) {
  if (this.paymentHistory.length > 0) {
    const latestPayment = this.paymentHistory[this.paymentHistory.length - 1];
    
    if (latestPayment.status === 'default') {
      this.status = 'default';
    } else if (latestPayment.status === 'late_90') {
      this.status = 'delinquent';
    } else if (this.closeDate && this.closeDate <= new Date()) {
      this.status = 'closed';
    } else {
      this.status = 'current';
    }
    
    this.lastReportDate = new Date();
  }
  
  next();
});

// Add a payment to history
creditAccountSchema.methods.addPayment = async function(paymentData) {
  this.paymentHistory.push(paymentData);
  return await this.save();
};

// Get utilization ratio for credit cards
creditAccountSchema.methods.getUtilizationRatio = function() {
  if (this.accountType !== 'credit_card' || !this.creditLimit || this.creditLimit === 0) {
    return 0;
  }
  
  return Number((this.currentBalance / this.creditLimit).toFixed(2));
};

const CreditAccount = mongoose.model('CreditAccount', creditAccountSchema);

module.exports = CreditAccount;