// backend/src/models/CreditProfile.js
const mongoose = require('mongoose');

// Score History Schema - embedded in CreditProfile
const scoreHistorySchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: 300,
    max: 850
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
});

// Credit Profile Schema
const creditProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  nationalId: {
    type: String,
    required: true,
    unique: true
  },
  creditScore: {
    type: Number,
    default: 700,
    min: 300, // Standard credit score range
    max: 850
  },
  scoreHistory: [scoreHistorySchema],
  status: {
    type: String,
    enum: ['active', 'frozen', 'disputed'],
    default: 'active'
  },
  fraudAlert: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
creditProfileSchema.index({ userId: 1 }, { unique: true });
creditProfileSchema.index({ nationalId: 1 }, { unique: true });
creditProfileSchema.index({ creditScore: 1 });

// Add score to history when credit score changes
creditProfileSchema.pre('save', function(next) {
  if (this.isModified('creditScore')) {
    this.scoreHistory.push({
      score: this.creditScore,
      calculatedAt: new Date()
    });
    this.lastUpdated = new Date();
  }
  next();
});

// Method to recalculate credit score
creditProfileSchema.methods.recalculateScore = async function(accounts, inquiries, publicRecords) {
  // This is a simplified scoring model - real credit bureaus use complex proprietary algorithms
  
  // Base score - starts at 700
  let score = 700;
  
  // Payment history (35%)
  if (accounts && accounts.length > 0) {
    const latePayments = accounts.reduce((count, account) => {
      const latePmts = account.paymentHistory.filter(payment => 
        payment.status.includes('late') || payment.status === 'default').length;
      return count + latePmts;
    }, 0);
    
    // Deduct for late payments
    score -= latePayments * 15;
  }
  
  // Credit utilization (30%)
  if (accounts && accounts.length > 0) {
    const creditAccounts = accounts.filter(account => 
      account.accountType === 'credit_card' && account.status !== 'closed');
      
    if (creditAccounts.length > 0) {
      const totalLimit = creditAccounts.reduce((sum, account) => sum + account.creditLimit, 0);
      const totalBalance = creditAccounts.reduce((sum, account) => sum + account.currentBalance, 0);
      
      const utilizationRatio = totalBalance / totalLimit;
      
      // Utilization scoring
      if (utilizationRatio < 0.1) score += 50;
      else if (utilizationRatio < 0.3) score += 30;
      else if (utilizationRatio < 0.5) score += 0;
      else if (utilizationRatio < 0.7) score -= 30;
      else score -= 50;
    }
  }
  
  // Length of credit history (15%)
  if (accounts && accounts.length > 0) {
    const oldestAccount = accounts.reduce((oldest, account) => {
      return account.openDate < oldest ? account.openDate : oldest;
    }, new Date());
    
    const historyYears = (new Date() - oldestAccount) / (1000 * 60 * 60 * 24 * 365);
    
    if (historyYears > 7) score += 40;
    else if (historyYears > 5) score += 30;
    else if (historyYears > 3) score += 20;
    else if (historyYears > 1) score += 10;
  }
  
  // Hard inquiries (10%)
  if (inquiries && inquiries.length > 0) {
    const recentInquiries = inquiries.filter(inquiry => {
      const monthsAgo = (new Date() - inquiry.inquiryDate) / (1000 * 60 * 60 * 24 * 30);
      return inquiry.inquiryType === 'hard' && monthsAgo <= 12;
    });
    
    // Deduct for recent inquiries
    score -= recentInquiries.length * 5;
  }
  
  // Public records (severe impact)
  if (publicRecords && publicRecords.length > 0) {
    const bankruptcies = publicRecords.filter(record => 
      record.recordType === 'bankruptcy' && record.status !== 'discharged');
      
    // Major deduction for bankruptcies
    score -= bankruptcies.length * 100;
  }
  
  // Ensure score stays within range
  score = Math.min(850, Math.max(300, score));
  
  // Update profile
  this.creditScore = score;
  return await this.save();
};

// Static method to get credit score category
creditProfileSchema.statics.getCreditScoreCategory = function(score) {
  if (score >= 800) return 'Excellent';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
};

const CreditProfile = mongoose.model('CreditProfile', creditProfileSchema);

module.exports = CreditProfile;