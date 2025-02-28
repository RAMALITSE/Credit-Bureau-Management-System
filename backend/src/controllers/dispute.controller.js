// backend/src/controllers/dispute.controller.js
const Dispute = require('../models/Dispute');
const CreditAccount = require('../models/CreditAccount');
const { createError } = require('../utils/error');

// @desc    Get all disputes for current user
// @route   GET /api/disputes/my-disputes
// @access  Private/Consumer
exports.getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ userId: req.user.id })
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

// @desc    Get a specific dispute by ID
// @route   GET /api/disputes/my-disputes/:id
// @access  Private/Consumer
exports.getMyDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!dispute) {
      return next(createError('Dispute not found or does not belong to you', 404));
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

// @desc    Create a new dispute
// @route   POST /api/disputes/account/:accountId
// @access  Private/Consumer
exports.createDispute = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { disputeReason, description, affectedItems, supportingDocuments } = req.body;
    
    // Check if account exists
    const account = await CreditAccount.findById(accountId);
    if (!account) {
      return next(createError('Account not found', 404));
    }
    
    // Create dispute
    const dispute = await Dispute.create({
      userId: req.user.id,
      accountId,
      lenderId: account.lenderId,
      disputeReason,
      description,
      affectedItems,
      supportingDocuments: supportingDocuments || [],
      status: 'pending',
      history: [
        {
          action: 'created',
          actionBy: req.user.id,
          actionByType: 'consumer',
          timestamp: new Date(),
          notes: 'Dispute created'
        }
      ]
    });
    
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

// @desc    Update a dispute
// @route   PUT /api/disputes/my-disputes/:id
// @access  Private/Consumer
exports.updateDispute = async (req, res, next) => {
  try {
    // Check if dispute exists and belongs to user
    const existingDispute = await Dispute.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!existingDispute) {
      return next(createError('Dispute not found or does not belong to you', 404));
    }
    
    // Check if dispute status allows updates
    if (existingDispute.status !== 'pending' && existingDispute.status !== 'in_review') {
      return next(createError(`Cannot update dispute with status ${existingDispute.status}`, 400));
    }
    
    // Update fields
    const { description, supportingDocuments, affectedItems } = req.body;
    const updateData = {};
    
    if (description) updateData.description = description;
    if (supportingDocuments) updateData.supportingDocuments = supportingDocuments;
    if (affectedItems) updateData.affectedItems = affectedItems;
    
    // Add history entry
    const historyEntry = {
      action: 'updated',
      actionBy: req.user.id,
      actionByType: 'consumer',
      timestamp: new Date(),
      notes: 'Dispute updated by consumer'
    };
    
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        $push: { history: historyEntry }
      },
      { new: true, runValidators: true }
    );
    
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

// @desc    Get all disputes for lender
// @route   GET /api/disputes/lender
// @access  Private/Lender
exports.getLenderDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ lenderId: req.user.id })
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

// @desc    Get a specific dispute by ID (lender)
// @route   GET /api/disputes/lender/:id
// @access  Private/Lender
exports.getLenderDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findOne({
      _id: req.params.id,
      lenderId: req.user.id
    });
    
    if (!dispute) {
      return next(createError('Dispute not found or does not belong to your organization', 404));
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

// @desc    Respond to a dispute (lender)
// @route   POST /api/disputes/lender/:id/respond
// @access  Private/Lender
exports.respondToDispute = async (req, res, next) => {
  try {
    // Check if dispute exists and belongs to lender
    const dispute = await Dispute.findOne({
      _id: req.params.id,
      lenderId: req.user.id
    });
    
    if (!dispute) {
      return next(createError('Dispute not found or does not belong to your organization', 404));
    }
    
    // Check if dispute status allows response
    if (dispute.status !== 'pending' && dispute.status !== 'in_review') {
      return next(createError(`Cannot respond to dispute with status ${dispute.status}`, 400));
    }
    
    const { response } = req.body;
    
    // Add response and update status
    const historyEntry = {
      action: 'responded',
      actionBy: req.user.id,
      actionByType: 'lender',
      timestamp: new Date(),
      notes: response
    };
    
    const updatedDispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        lenderResponse: response,
        status: 'in_review',
        $push: { history: historyEntry }
      },
      { new: true, runValidators: true }
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
    
    if (req.query.userId) {
      query = query.find({ userId: req.query.userId });
    }
    
    if (req.query.lenderId) {
      query = query.find({ lenderId: req.query.lenderId });
    }
    
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
// @route   PUT /api/disputes/admin/:id/resolve
// @access  Private/Admin
exports.resolveDispute = async (req, res, next) => {
  try {
    const { resolution, status, affectedItems } = req.body;
    
    // Find dispute
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return next(createError('Dispute not found', 404));
    }
    
    // Update dispute
    const historyEntry = {
      action: 'resolved',
      actionBy: req.user.id,
      actionByType: 'admin',
      timestamp: new Date(),
      notes: resolution
    };
    
    const updatedDispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        adminResolution: resolution,
        resolvedAt: new Date(),
        status,
        affectedItems,
        $push: { history: historyEntry }
      },
      { new: true, runValidators: true }
    );
    
    // If dispute is resolved and in favor of consumer, update account accordingly
    if (status === 'resolved' && affectedItems) {
      // This would be implemented based on the specific business logic requirements
      // For example, updating account balances, payment history, etc.
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

// @desc    Delete a dispute (admin)
// @route   DELETE /api/disputes/admin/:id
// @access  Private/Admin
exports.deleteDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findByIdAndDelete(req.params.id);
    
    if (!dispute) {
      return next(createError('Dispute not found', 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dispute statistics
// @route   GET /api/disputes/stats
// @access  Private/Admin
exports.getDisputeStats = async (req, res, next) => {
  try {
    // Get counts by status
    const statusCounts = await Dispute.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total disputes
    const totalDisputes = statusCounts.reduce((sum, status) => sum + status.count, 0);
    
    // Count of open disputes (pending + in_review)
    const openDisputes = statusCounts
      .filter(status => status._id === 'pending' || status._id === 'in_review')
      .reduce((sum, status) => sum + status.count, 0);
    
    // Count of resolved disputes
    const resolvedDisputes = statusCounts
      .find(status => status._id === 'resolved')?.count || 0;
    
    // Count of rejected disputes
    const rejectedDisputes = statusCounts
      .find(status => status._id === 'rejected')?.count || 0;
    
    // Get recent disputes
    const recentDisputes = await Dispute.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    // We'll still include the detailed stats as well
    const detailedStats = await Dispute.aggregate([
      {
        $facet: {
          // Status distribution
          statusDistribution: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          // Dispute reason distribution
          reasonDistribution: [
            {
              $group: {
                _id: '$disputeReason',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          // Monthly dispute counts
          monthlyDisputes: [
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

    // Format the response to match what the frontend expects
    res.status(200).json({
      status: 'success',
      data: {
        // Return summary stats in the format the frontend expects
        totalDisputes,
        openDisputes,
        resolvedDisputes,
        rejectedDisputes,
        recentDisputes,
        // Also include the detailed stats
        stats: detailedStats[0]
      }
    });
  } catch (error) {
    next(error);
  }
};