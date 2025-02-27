// backend/src/controllers/account.controller.js
const CreditAccount = require('../models/CreditAccount');
const CreditProfile = require('../models/CreditProfile');
const User = require('../models/User');
const { createError } = require('../utils/error');

// @desc    Get all my accounts (consumer)
// @route   GET /api/accounts/my-accounts
// @access  Private/Consumer
exports.getMyAccounts = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find all accounts linked to this profile
    const accounts = await CreditAccount.find({ profileId: profile._id });
    
    res.status(200).json({
      status: 'success',
      results: accounts.length,
      data: {
        accounts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific account by ID (consumer)
// @route   GET /api/accounts/my-accounts/:id
// @access  Private/Consumer
exports.getMyAccountById = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find the specific account and ensure it belongs to this user
    const account = await CreditAccount.findOne({ 
      _id: req.params.id,
      profileId: profile._id
    });
    
    if (!account) {
      return next(createError('Account not found or does not belong to you', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        account
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all accounts created by lender
// @route   GET /api/accounts/lender
// @access  Private/Lender
exports.getLenderAccounts = async (req, res, next) => {
  try {
    // Implement pagination, filtering, and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = CreditAccount.find({ lenderId: req.user.id });
    
    // Apply filters if provided
    if (req.query.accountType) {
      query = query.find({ accountType: req.query.accountType });
    }
    
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }
    
    if (req.query.minBalance) {
      query = query.find({ currentBalance: { $gte: parseFloat(req.query.minBalance) } });
    }
    
    if (req.query.maxBalance) {
      query = query.find({ currentBalance: { $lte: parseFloat(req.query.maxBalance) } });
    }
    
    // Apply sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrder });
    
    // Apply pagination
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const accounts = await query;
    const totalAccounts = await CreditAccount.countDocuments({ lenderId: req.user.id });
    
    res.status(200).json({
      status: 'success',
      results: accounts.length,
      pagination: {
        page,
        pages: Math.ceil(totalAccounts / limit),
        count: totalAccounts
      },
      data: {
        accounts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific account created by lender
// @route   GET /api/accounts/lender/:id
// @access  Private/Lender
exports.getLenderAccountById = async (req, res, next) => {
  try {
    const account = await CreditAccount.findOne({
      _id: req.params.id,
      lenderId: req.user.id
    });
    
    if (!account) {
      return next(createError('Account not found or does not belong to you', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        account
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new account
// @route   POST /api/accounts/lender
// @access  Private/Lender
exports.createAccount = async (req, res, next) => {
  try {
    const {
      profileId,
      accountType,
      accountNumber,
      openDate,
      creditLimit,
      currentBalance,
      originalAmount
    } = req.body;
    
    // Check if profile exists
    const profile = await CreditProfile.findById(profileId);
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Get lender name
    const lender = await User.findById(req.user.id);
    
    // Create new account
    const account = await CreditAccount.create({
      profileId,
      accountType,
      lenderId: req.user.id,
      lenderName: `${lender.firstName} ${lender.lastName}`,
      accountNumber,
      openDate,
      creditLimit: accountType === 'credit_card' ? creditLimit : undefined,
      currentBalance,
      originalAmount: ['loan', 'mortgage', 'auto_loan', 'student_loan'].includes(accountType) ? originalAmount : undefined,
      paymentHistory: [], // Start with empty payment history
      status: 'current',
      lastReportDate: new Date()
    });
    
    // Trigger credit score recalculation
    const accounts = await CreditAccount.find({ profileId: profile._id });
    await profile.recalculateScore(accounts, [], []);
    
    res.status(201).json({
      status: 'success',
      data: {
        account
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an account
// @route   PUT /api/accounts/lender/:id
// @access  Private/Lender
exports.updateAccount = async (req, res, next) => {
  try {
    // Check if account exists and belongs to this lender
    const existingAccount = await CreditAccount.findOne({
      _id: req.params.id,
      lenderId: req.user.id
    });
    
    if (!existingAccount) {
      return next(createError('Account not found or does not belong to you', 404));
    }
    
    // Filter allowed update fields
    const allowedFields = ['currentBalance', 'creditLimit', 'status', 'closeDate'];
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    // Update the account
    const account = await CreditAccount.findByIdAndUpdate(
      req.params.id,
      {
        ...filteredBody,
        lastReportDate: new Date()
      },
      { new: true, runValidators: true }
    );
    
    // Trigger credit score recalculation
    const profile = await CreditProfile.findById(existingAccount.profileId);
    const accounts = await CreditAccount.find({ profileId: profile._id });
    await profile.recalculateScore(accounts, [], []);
    
    res.status(200).json({
      status: 'success',
      data: {
        account
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an account
// @route   DELETE /api/accounts/lender/:id
// @access  Private/Lender
exports.deleteAccount = async (req, res, next) => {
  try {
    // Check if account exists and belongs to this lender
    const existingAccount = await CreditAccount.findOne({
      _id: req.params.id,
      lenderId: req.user.id
    });
    
    if (!existingAccount) {
      return next(createError('Account not found or does not belong to you', 404));
    }
    
    // Store profileId for recalculation later
    const profileId = existingAccount.profileId;
    
    // Delete the account
    await CreditAccount.findByIdAndDelete(req.params.id);
    
    // Trigger credit score recalculation
    const profile = await CreditProfile.findById(profileId);
    const accounts = await CreditAccount.find({ profileId });
    await profile.recalculateScore(accounts, [], []);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a payment to an account
// @route   POST /api/accounts/lender/:id/payment
// @access  Private/Lender
exports.addPayment = async (req, res, next) => {
  try {
    // Check if account exists and belongs to this lender
    const account = await CreditAccount.findOne({
      _id: req.params.id,
      lenderId: req.user.id
    });
    
    if (!account) {
      return next(createError('Account not found or does not belong to you', 404));
    }
    
    const {
      dueDate,
      amountDue,
      amountPaid,
      datePaid,
      status
    } = req.body;
    
    // Add payment to history
    account.paymentHistory.push({
      dueDate,
      amountDue,
      amountPaid,
      datePaid,
      status,
      reportedAt: new Date()
    });
    
    // Update current balance if payment was made
    if (amountPaid > 0) {
      // For loans, reduce the balance by amount paid
      if (['loan', 'mortgage', 'auto_loan', 'student_loan'].includes(account.accountType)) {
        account.currentBalance = Math.max(0, account.currentBalance - amountPaid);
      }
      
      // For credit cards, adjust based on payment type
      if (account.accountType === 'credit_card') {
        // Reduce balance by amount paid
        account.currentBalance = Math.max(0, account.currentBalance - amountPaid);
      }
    }
    
    // Update last report date
    account.lastReportDate = new Date();
    
    // Save the updated account
    await account.save();
    
    // Trigger credit score recalculation
    const profile = await CreditProfile.findById(account.profileId);
    const accounts = await CreditAccount.find({ profileId: profile._id });
    await profile.recalculateScore(accounts, [], []);
    
    res.status(200).json({
      status: 'success',
      data: {
        account
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all accounts (admin)
// @route   GET /api/accounts/admin
// @access  Private/Admin
exports.getAllAccounts = async (req, res, next) => {
  try {
    // Implement pagination, filtering, and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = CreditAccount.find();
    
    // Apply filters if provided
    if (req.query.accountType) {
      query = query.find({ accountType: req.query.accountType });
    }
    
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }
    
    if (req.query.lenderId) {
      query = query.find({ lenderId: req.query.lenderId });
    }
    
    if (req.query.profileId) {
      query = query.find({ profileId: req.query.profileId });
    }
    
    // Apply sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrder });
    
    // Apply pagination
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const accounts = await query;
    const totalAccounts = await CreditAccount.countDocuments();
    
    res.status(200).json({
      status: 'success',
      results: accounts.length,
      pagination: {
        page,
        pages: Math.ceil(totalAccounts / limit),
        count: totalAccounts
      },
      data: {
        accounts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get account by ID (admin)
// @route   GET /api/accounts/admin/:id
// @access  Private/Admin
exports.getAccountById = async (req, res, next) => {
  try {
    const account = await CreditAccount.findById(req.params.id);
    
    if (!account) {
      return next(createError('Account not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        account
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update account (admin)
// @route   PUT /api/accounts/admin/:id
// @access  Private/Admin
exports.adminUpdateAccount = async (req, res, next) => {
  try {
    // Admin can update more fields than lender
    const allowedFields = [
      'accountType',
      'lenderId',
      'lenderName',
      'accountNumber',
      'openDate',
      'closeDate',
      'creditLimit',
      'currentBalance',
      'originalAmount',
      'status'
    ];
    
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    // Update the account
    const account = await CreditAccount.findByIdAndUpdate(
      req.params.id,
      {
        ...filteredBody,
        lastReportDate: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!account) {
      return next(createError('Account not found', 404));
    }
    
    // Trigger credit score recalculation
    const profile = await CreditProfile.findById(account.profileId);
    const accounts = await CreditAccount.find({ profileId: profile._id });
    await profile.recalculateScore(accounts, [], []);
    
    res.status(200).json({
      status: 'success',
      data: {
        account
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get account type statistics
// @route   GET /api/accounts/stats/account-types
// @access  Private/Admin
exports.getAccountTypeStats = async (req, res, next) => {
  try {
    const stats = await CreditAccount.aggregate([
      {
        $group: {
          _id: '$accountType',
          count: { $sum: 1 },
          totalBalance: { $sum: '$currentBalance' },
          avgBalance: { $avg: '$currentBalance' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history statistics
// @route   GET /api/accounts/stats/payment-history
// @access  Private/Admin
exports.getPaymentHistoryStats = async (req, res, next) => {
  try {
    // Get all accounts
    const accounts = await CreditAccount.find();
    
    // Analyze payment history
    let totalPayments = 0;
    let onTimePayments = 0;
    let latePayments = 0;
    let defaultedPayments = 0;
    
    accounts.forEach(account => {
      account.paymentHistory.forEach(payment => {
        totalPayments++;
        
        if (payment.status === 'on_time') {
          onTimePayments++;
        } else if (payment.status === 'default') {
          defaultedPayments++;
        } else {
          latePayments++;
        }
      });
    });
    
    const paymentStats = {
      totalPayments,
      onTimePayments,
      latePayments,
      defaultedPayments,
      onTimePercentage: totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 0,
      latePercentage: totalPayments > 0 ? (latePayments / totalPayments) * 100 : 0,
      defaultPercentage: totalPayments > 0 ? (defaultedPayments / totalPayments) * 100 : 0
    };
    
    // Get payment status distribution over time (by month)
    const monthlyStats = await CreditAccount.aggregate([
      { $unwind: '$paymentHistory' },
      {
        $group: {
          _id: {
            year: { $year: '$paymentHistory.dueDate' },
            month: { $month: '$paymentHistory.dueDate' },
            status: '$paymentHistory.status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        paymentStats,
        monthlyStats
      }
    });
  } catch (error) {
    next(error);
  }
};