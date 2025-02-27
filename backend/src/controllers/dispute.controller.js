// backend/src/controllers/dispute.controller.js
const Dispute = require('../models/Dispute');
const CreditProfile = require('../models/CreditProfile');
const CreditAccount = require('../models/CreditAccount');
const Inquiry = require('../models/Inquiry');
const PublicRecord = require('../models/PublicRecord');
const { createError } = require('../utils/error');

// @desc    Get all disputes for current user
// @route   GET /api/disputes
// @access  Private/Consumer
exports.getMyDisputes = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find all disputes for this profile
    const disputes = await Dispute.find({ profileId: profile._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: disputes.length,
      data: {
        disputes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new dispute
// @route   POST /api/disputes
// @access  Private/Consumer
exports.createDispute = async (req, res, next) => {
  try {
    const {
      accountId,
      disputeReason,
      description,
      supportingDocuments,
      affectedItems
    } = req.body;
    
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Check if account exists and belongs to this profile
    const account = await CreditAccount.findOne({ 
      _id: accountId,
      profileId: profile._id
    });
    
    if (!account) {
      return next(createError('Account not found or does not belong to your profile', 404));
    }
    
    // Create the dispute
    const dispute = await Dispute.create({
      profileId: profile._id,
      accountId,
      initiatedBy: req.user.id,
      disputeReason,
      description,
      supportingDocuments: supportingDocuments || [],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      affectedItems: affectedItems || []
    });
    
    // Update profile status
    await CreditProfile.findByIdAndUpdate(
      profile._id,
      { 
        status: 'disputed',
        lastUpdated: new Date()
      }
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        dispute
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific dispute by ID for current user
// @route   GET /api/disputes/:id
// @access  Private/Consumer
exports.getMyDisputeById = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find the specific dispute and ensure it belongs to this user's profile
    const dispute = await Dispute.findOne({ 
      _id: req.params.id,
      profileId: profile._id
    });
    
    if (!dispute) {
      return next(createError('Dispute not found or does not belong to your profile', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        dispute
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a dispute
// @route   PUT /api/disputes/:id
// @access  Private/Consumer
exports.updateDispute = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find the specific dispute and ensure it belongs to this user's profile
    const dispute = await Dispute.findOne({ 
      _id: req.params.id,
      profileId: profile._id
    });
    
    if (!dispute) {
      return next(createError('Dispute not found or does not belong to your profile', 404));
    }
    
    // Check if dispute can be updated (only if it's pending)
    if (dispute.status !== 'pending') {
      return next(createError(`Dispute cannot be updated because it is already ${dispute.status}`, 400));
    }
    
    // Update allowed fields
    const {
      description,
      supportingDocuments,
      affectedItems
    } = req.body;
    
    const updatedDispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        description: description || dispute.description,
        supportingDocuments: supportingDocuments || dispute.supportingDocuments,
        affectedItems: affectedItems || dispute.affectedItems,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        dispute: updatedDispute
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a dispute
// @route   DELETE /api/disputes/:id
// @access  Private/Consumer
exports.cancelDispute = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find the specific dispute and ensure it belongs to this user's profile
    const dispute = await Dispute.findOne({ 
      _id: req.params.id,
      profileId: profile._id
    });
    
    if (!dispute) {
      return next(createError('Dispute not found or does not belong to your profile', 404));
    }
    
    // Check if dispute can be canceled (only if it's pending)
    if (dispute.status !== 'pending') {
      return next(createError(`Dispute cannot be canceled because it is already ${dispute.status}`, 400));
    }
    
    // Update dispute status to canceled
    await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status: 'canceled',
        updatedAt: new Date(),
        resolvedAt: new Date(),
        resolution: 'Canceled by consumer'
      }
    );
    
    // Check if there are any other active disputes for this profile
    const activeDisputes = await Dispute.find({
      profileId: profile._id,
      status: { $in: ['pending', 'investigating'] }
    });
    
    // If no active disputes, update profile status back to active
    if (activeDisputes.length === 0) {
      await CreditProfile.findByIdAndUpdate(
        profile._id,
        { 
          status: 'active',
          lastUpdated: new Date()
        }
      );
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all disputes for lender's accounts
// @route   GET /api/disputes/lender
// @access  Private/Lender
exports.getLenderDisputes = async (req, res, next) => {
  try {
    // Find all accounts owned by this lender
    const accounts = await CreditAccount.find({ lenderId: req.user.id });
    
    if (accounts.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          disputes: []
        }
      });
    }
    
    // Get all account IDs
    const accountIds = accounts.map(account => account._id);
    
    // Find all disputes for these accounts
    const disputes = await Dispute.find({ accountId: { $in: accountIds } })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: disputes.length,
      data: {
        disputes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific dispute by ID for lender
// @route   GET /api/disputes/lender/:id
// @access  Private/Lender
exports.getLenderDisputeById = async (req, res, next) => {
  try {
    // Find the dispute
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return next(createError('Dispute not found', 404));
    }
    
    // Check if account belongs to this lender
    const account = await CreditAccount.findOne({
      _id: dispute.accountId,
      lenderId: req.user.id
    });
    
    if (!account) {
      return next(createError('This dispute does not involve your account', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        dispute
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to a dispute
// @route   PUT /api/disputes/lender/:id
// @access  Private/Lender
exports.respondToDispute = async (req, res, next) => {
  try {
    // Find the dispute
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return next(createError('Dispute not found', 404));
    }
    
    // Check if account belongs to this lender
    const account = await CreditAccount.findOne({
      _id: dispute.accountId,
      lenderId: req.user.id
    });
    
    if (!account) {
      return next(createError('This dispute does not involve your account', 403));
    }
    
    // Check if dispute is in a state that can be responded to
    if (dispute.status !== 'pending' && dispute.status !== 'investigating') {
      return next(createError(`Cannot respond to a dispute that is ${dispute.status}`, 400));
    }
    
    const { response, resolution } = req.body;
    
    // Update the dispute
    const updatedDispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        lenderResponse: response,
        status: 'investigating',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        dispute: updatedDispute
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all disputes (admin)
// @route   GET /api/disputes/admin
// @access  Private/Admin
exports.getAllDisputes = async (req, res, next) => {
  try {
    // Implement pagination, filtering, and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = Dispute.find();
    
    // Apply filters if provided
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }
    
    if (req.query.disputeReason) {
      query = query.find({ disputeReason: req.query.disputeReason });
    }
    
    if (req.query.profileId) {
      query = query.find({ profileId: req.query.profileId });
    }
    
    if (req.query.accountId) {
      query = query.find({ accountId: req.query.accountId });
    }
    
    // Apply sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrder });
    
    // Apply pagination
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const disputes = await query;
    const totalDisputes = await Dispute.countDocuments();
    
    res.status(200).json({
      status: 'success',
      results: disputes.length,
      pagination: {
        page,
        pages: Math.ceil(totalDisputes / limit),
        count: totalDisputes
      },
      data: {
        disputes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dispute by ID (admin)
// @route   GET /api/disputes/admin/:id
// @access  Private/Admin
exports.getDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return next(createError('Dispute not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        dispute
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve a dispute (admin)
// @route   PUT /api/disputes/admin/:id
// @access  Private/Admin
exports.resolveDispute = async (req, res, next) => {
  try {
    const { resolution, status, affectedItems } = req.body;
    
    // Validate resolution status
    if (!['resolved', 'rejected'].includes(status)) {
      return next(createError('Status must be either resolved or rejected', 400));
    }
    
    // Find the dispute
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return next(createError('Dispute not found', 404));
    }
    
    // Update the dispute
    const updatedDispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution,
        resolvedAt: new Date(),
        updatedAt: new Date(),
        affectedItems: affectedItems || dispute.affectedItems.map(item => ({
          ...item,
          resolved: true
        }))
      },
      { new: true }
    );
    
    // Update profile status if this was the last active dispute
    const profile = await CreditProfile.findById(dispute.profileId);
    
    const activeDisputes = await Dispute.find({
      profileId: profile._id,
      status: { $in: ['pending', 'investigating'] },
      _id: { $ne: dispute._id } // Exclude current dispute
    });
    
    if (activeDisputes.length === 0) {
      await CreditProfile.findByIdAndUpdate(
        profile._id,
        { 
          status: 'active',
          lastUpdated: new Date()
        }
      );
    }
    
    // If dispute was resolved and affected account data, update the account
    if (status === 'resolved' && affectedItems && affectedItems.length > 0) {
      // In a real system, you would update the affected account fields here
      // This is a simplified example
      await CreditAccount.findByIdAndUpdate(
        dispute.accountId,
        { 
          lastReportDate: new Date()
        }
      );
      
      // Recalculate credit score
      const accounts = await CreditAccount.find({ profileId: profile._id });
      const inquiries = await Inquiry.find({ profileId: profile._id });
      const publicRecords = await PublicRecord.find({ profileId: profile._id });
      
      await profile.recalculateScore(accounts, inquiries, publicRecords);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        dispute: updatedDispute
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dispute type statistics
// @route   GET /api/disputes/stats/dispute-types
// @access  Private/Admin
exports.getDisputeTypeStats = async (req, res, next) => {
  try {
    const stats = await Dispute.aggregate([
      {
        $facet: {
          // Count by dispute reason
          byReason: [
            { $group: { _id: '$disputeReason', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          // Count by status
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          // Count by month
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
          ]
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        stats: stats[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dispute resolution time statistics
// @route   GET /api/disputes/stats/resolution-times
// @access  Private/Admin
exports.getResolutionTimeStats = async (req, res, next) => {
  try {
    const stats = await Dispute.aggregate([
      {
        // Only include resolved disputes
        $match: {
          status: { $in: ['resolved', 'rejected'] },
          resolvedAt: { $exists: true }
        }
      },
      {
        // Calculate resolution time in days
        $project: {
          resolutionTimeInDays: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert ms to days
            ]
          },
          status: 1,
          disputeReason: 1
        }
      },
      {
        $facet: {
          // Average resolution time
          averageResolutionTime: [
            {
              $group: {
                _id: null,
                avgDays: { $avg: '$resolutionTimeInDays' }
              }
            }
          ],
          // Resolution time by dispute reason
          byReason: [
            {
              $group: {
                _id: '$disputeReason',
                avgDays: { $avg: '$resolutionTimeInDays' },
                count: { $sum: 1 }
              }
            },
            { $sort: { avgDays: 1 } }
          ],
          // Resolution time by status
          byStatus: [
            {
              $group: {
                _id: '$status',
                avgDays: { $avg: '$resolutionTimeInDays' },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        stats: stats[0]
      }
    });
  } catch (error) {
    next(error);
  }
};