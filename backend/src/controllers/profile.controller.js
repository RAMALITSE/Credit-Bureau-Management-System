// backend/src/controllers/profile.controller.js
const CreditProfile = require('../models/CreditProfile');
const CreditAccount = require('../models/CreditAccount');
const Inquiry = require('../models/Inquiry');
const PublicRecord = require('../models/PublicRecord');
const { createError } = require('../utils/error');

// @desc    Get credit profile for current user
// @route   GET /api/profiles/me
// @access  Private/Consumer
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Recalculate credit score for current user
// @route   POST /api/profiles/recalculate
// @access  Private/Consumer
exports.recalculateScore = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    // Get all financial data needed for score calculation
    const accounts = await CreditAccount.find({ profileId: profile._id });
    const inquiries = await Inquiry.find({ profileId: profile._id });
    const publicRecords = await PublicRecord.find({ profileId: profile._id });

    // Recalculate score
    const updatedProfile = await profile.recalculateScore(accounts, inquiries, publicRecords);

    res.status(200).json({
      status: 'success',
      data: {
        profile: updatedProfile,
        scoreCategory: CreditProfile.getCreditScoreCategory(updatedProfile.creditScore)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get credit score history
// @route   GET /api/profiles/score-history
// @access  Private/Consumer
exports.getScoreHistory = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    // Get optional time period filters
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Filter history based on dates if provided
    let scoreHistory = profile.scoreHistory;
    
    if (startDate) {
      scoreHistory = scoreHistory.filter(item => 
        new Date(item.calculatedAt) >= startDate
      );
    }
    
    if (endDate) {
      scoreHistory = scoreHistory.filter(item => 
        new Date(item.calculatedAt) <= endDate
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        scoreHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set fraud alert on profile
// @route   POST /api/profiles/fraud-alert
// @access  Private/Consumer
exports.setFraudAlert = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findOneAndUpdate(
      { userId: req.user.id },
      { 
        fraudAlert: true,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove fraud alert from profile
// @route   DELETE /api/profiles/fraud-alert
// @access  Private/Consumer
exports.removeFraudAlert = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findOneAndUpdate(
      { userId: req.user.id },
      { 
        fraudAlert: false,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Freeze credit profile
// @route   POST /api/profiles/freeze
// @access  Private/Consumer
exports.freezeProfile = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findOneAndUpdate(
      { userId: req.user.id },
      { 
        status: 'frozen',
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfreeze credit profile
// @route   POST /api/profiles/unfreeze
// @access  Private/Consumer
exports.unfreezeProfile = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findOneAndUpdate(
      { userId: req.user.id },
      { 
        status: 'active',
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get profile by ID
// @route   GET /api/profiles/id/:id
// @access  Private/Admin/Lender
exports.getProfileById = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findById(req.params.id);

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    // Create inquiry record for lender access
    if (req.user.userType === 'lender') {
      await Inquiry.create({
        profileId: profile._id,
        inquiringEntity: {
          id: req.user.id,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        inquiryType: 'hard',
        inquiryPurpose: req.query.purpose || 'credit_check',
        inquiryDate: new Date(),
        expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years expiry
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get profile by national ID
// @route   GET /api/profiles/national-id/:nationalId
// @access  Private/Admin/Lender
exports.getProfileByNationalId = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findOne({ nationalId: req.params.nationalId });

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    // Create inquiry record for lender access
    if (req.user.userType === 'lender') {
      await Inquiry.create({
        profileId: profile._id,
        inquiringEntity: {
          id: req.user.id,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        inquiryType: 'hard',
        inquiryPurpose: req.query.purpose || 'credit_check',
        inquiryDate: new Date(),
        expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years expiry
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all profiles
// @route   GET /api/profiles
// @access  Private/Admin
exports.getAllProfiles = async (req, res, next) => {
  try {
    // Implement pagination, filtering, and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = CreditProfile.find();

    // Apply filters if provided
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    if (req.query.minScore) {
      query = query.find({ creditScore: { $gte: parseInt(req.query.minScore, 10) } });
    }

    if (req.query.maxScore) {
      query = query.find({ creditScore: { $lte: parseInt(req.query.maxScore, 10) } });
    }

    if (req.query.fraudAlert) {
      query = query.find({ fraudAlert: req.query.fraudAlert === 'true' });
    }

    // Apply pagination
    query = query.skip(skip).limit(limit);

    // Execute query
    const profiles = await query;
    const totalProfiles = await CreditProfile.countDocuments();

    res.status(200).json({
      status: 'success',
      results: profiles.length,
      pagination: {
        page,
        pages: Math.ceil(totalProfiles / limit),
        count: totalProfiles
      },
      data: {
        profiles
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/profiles/:id
// @access  Private/Admin
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['status', 'fraudAlert', 'creditScore'];
    
    // Filter out fields that shouldn't be updated
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    // Add lastUpdated timestamp
    filteredBody.lastUpdated = new Date();

    // Update profile
    const profile = await CreditProfile.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get credit score statistics
// @route   GET /api/profiles/stats/scores
// @access  Private/Admin
exports.getCreditScoreStats = async (req, res, next) => {
  try {
    const stats = await CreditProfile.aggregate([
      {
        $facet: {
          // Average score
          averageScore: [
            { $group: { _id: null, avg: { $avg: '$creditScore' } } }
          ],
          // Score distribution
          scoreDistribution: [
            {
              $bucket: {
                groupBy: '$creditScore',
                boundaries: [300, 500, 600, 670, 740, 800, 851],
                default: 'Other',
                output: { count: { $sum: 1 } }
              }
            }
          ],
          // Score ranges with categories
          scoreCategories: [
            {
              $project: {
                scoreCategory: {
                  $switch: {
                    branches: [
                      { case: { $gte: ['$creditScore', 800] }, then: 'Excellent' },
                      { case: { $gte: ['$creditScore', 740] }, then: 'Very Good' },
                      { case: { $gte: ['$creditScore', 670] }, then: 'Good' },
                      { case: { $gte: ['$creditScore', 580] }, then: 'Fair' }
                    ],
                    default: 'Poor'
                  }
                }
              }
            },
            { $group: { _id: '$scoreCategory', count: { $sum: 1 } } },
            { $sort: { '_id': 1 } }
          ],
          // Score trend over time (by month)
          scoreTrend: [
            { $unwind: '$scoreHistory' },
            {
              $group: {
                _id: {
                  year: { $year: '$scoreHistory.calculatedAt' },
                  month: { $month: '$scoreHistory.calculatedAt' }
                },
                averageScore: { $avg: '$scoreHistory.score' }
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

// @desc    Get profile status statistics
// @route   GET /api/profiles/stats/status
// @access  Private/Admin
exports.getProfileStatusStats = async (req, res, next) => {
  try {
    const statusStats = await CreditProfile.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const fraudAlertStats = await CreditProfile.aggregate([
      {
        $group: {
          _id: '$fraudAlert',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to more readable format
    const formattedFraudStats = fraudAlertStats.reduce((acc, curr) => {
      acc[curr._id ? 'withAlert' : 'withoutAlert'] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: {
        statusDistribution: statusStats,
        fraudAlertDistribution: formattedFraudStats
      }
    });
  } catch (error) {
    next(error);
  }
};