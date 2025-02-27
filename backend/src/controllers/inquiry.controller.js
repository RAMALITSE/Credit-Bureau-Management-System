// backend/src/controllers/inquiry.controller.js
const Inquiry = require('../models/Inquiry');
const CreditProfile = require('../models/CreditProfile');
const CreditAccount = require('../models/CreditAccount');
const PublicRecord = require('../models/PublicRecord');
const { createError } = require('../utils/error');

// @desc    Get all inquiries for current user's profile
// @route   GET /api/inquiries/my-inquiries
// @access  Private/Consumer
exports.getMyInquiries = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find all inquiries for this profile
    const inquiries = await Inquiry.find({ profileId: profile._id })
      .sort({ inquiryDate: -1 });
    
    res.status(200).json({
      status: 'success',
      results: inquiries.length,
      data: {
        inquiries
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific inquiry by ID for current user
// @route   GET /api/inquiries/my-inquiries/:id
// @access  Private/Consumer
exports.getMyInquiryById = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find the specific inquiry and ensure it belongs to this user's profile
    const inquiry = await Inquiry.findOne({ 
      _id: req.params.id,
      profileId: profile._id
    });
    
    if (!inquiry) {
      return next(createError('Inquiry not found or does not belong to your profile', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        inquiry
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inquiries made by current lender
// @route   GET /api/inquiries/lender
// @access  Private/Lender
exports.getLenderInquiries = async (req, res, next) => {
  try {
    // Implement pagination, filtering, and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build query for inquiries made by this lender
    let query = Inquiry.find({ 'inquiringEntity.id': req.user.id });
    
    // Apply filters if provided
    if (req.query.inquiryType) {
      query = query.find({ inquiryType: req.query.inquiryType });
    }
    
    if (req.query.inquiryPurpose) {
      query = query.find({ inquiryPurpose: req.query.inquiryPurpose });
    }
    
    if (req.query.startDate) {
      query = query.find({ inquiryDate: { $gte: new Date(req.query.startDate) } });
    }
    
    if (req.query.endDate) {
      query = query.find({ inquiryDate: { $lte: new Date(req.query.endDate) } });
    }
    
    // Apply sorting
    const sortBy = req.query.sortBy || 'inquiryDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrder });
    
    // Apply pagination
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const inquiries = await query;
    const totalInquiries = await Inquiry.countDocuments({ 'inquiringEntity.id': req.user.id });
    
    res.status(200).json({
      status: 'success',
      results: inquiries.length,
      pagination: {
        page,
        pages: Math.ceil(totalInquiries / limit),
        count: totalInquiries
      },
      data: {
        inquiries
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new inquiry
// @route   POST /api/inquiries/lender
// @access  Private/Lender
exports.createInquiry = async (req, res, next) => {
  try {
    const { profileId, inquiryType, inquiryPurpose } = req.body;
    
    // Check if profile exists
    const profile = await CreditProfile.findById(profileId);
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Check if profile is frozen
    if (profile.status === 'frozen') {
      return next(createError('This credit profile is frozen and cannot be accessed', 403));
    }
    
    // Create the inquiry
    const inquiry = await Inquiry.create({
      profileId,
      inquiringEntity: {
        id: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      inquiryType,
      inquiryPurpose,
      inquiryDate: new Date(),
      expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years expiry
    });
    
    // If it's a hard inquiry, trigger score recalculation
    if (inquiryType === 'hard') {
      const accounts = await CreditAccount.find({ profileId });
      const inquiries = await Inquiry.find({ profileId });
      const publicRecords = await PublicRecord.find({ profileId });
      
      await profile.recalculateScore(accounts, inquiries, publicRecords);
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        inquiry
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific inquiry by ID (lender)
// @route   GET /api/inquiries/lender/:id
// @access  Private/Lender
exports.getLenderInquiryById = async (req, res, next) => {
  try {
    // Find the inquiry and ensure it was made by this lender
    const inquiry = await Inquiry.findOne({ 
      _id: req.params.id,
      'inquiringEntity.id': req.user.id
    });
    
    if (!inquiry) {
      return next(createError('Inquiry not found or does not belong to you', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        inquiry
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inquiries (admin)
// @route   GET /api/inquiries/admin
// @access  Private/Admin
exports.getAllInquiries = async (req, res, next) => {
  try {
    // Implement pagination, filtering, and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = Inquiry.find();
    
    // Apply filters if provided
    if (req.query.inquiryType) {
      query = query.find({ inquiryType: req.query.inquiryType });
    }
    
    if (req.query.inquiryPurpose) {
      query = query.find({ inquiryPurpose: req.query.inquiryPurpose });
    }
    
    if (req.query.profileId) {
      query = query.find({ profileId: req.query.profileId });
    }
    
    if (req.query.lenderId) {
      query = query.find({ 'inquiringEntity.id': req.query.lenderId });
    }
    
    // Apply sorting
    const sortBy = req.query.sortBy || 'inquiryDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrder });
    
    // Apply pagination
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const inquiries = await query;
    const totalInquiries = await Inquiry.countDocuments();
    
    res.status(200).json({
      status: 'success',
      results: inquiries.length,
      pagination: {
        page,
        pages: Math.ceil(totalInquiries / limit),
        count: totalInquiries
      },
      data: {
        inquiries
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inquiry by ID (admin)
// @route   GET /api/inquiries/admin/:id
// @access  Private/Admin
exports.getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return next(createError('Inquiry not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        inquiry
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an inquiry (admin)
// @route   DELETE /api/inquiries/admin/:id
// @access  Private/Admin
exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    
    if (!inquiry) {
      return next(createError('Inquiry not found', 404));
    }
    
    // If it was a hard inquiry, trigger score recalculation
    if (inquiry.inquiryType === 'hard') {
      const profile = await CreditProfile.findById(inquiry.profileId);
      const accounts = await CreditAccount.find({ profileId: inquiry.profileId });
      const inquiries = await Inquiry.find({ profileId: inquiry.profileId });
      const publicRecords = await PublicRecord.find({ profileId: inquiry.profileId });
      
      await profile.recalculateScore(accounts, inquiries, publicRecords);
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inquiry statistics
// @route   GET /api/inquiries/stats/inquiry-types
// @access  Private/Admin
exports.getInquiryStats = async (req, res, next) => {
  try {
    const stats = await Inquiry.aggregate([
      {
        $facet: {
          // Count by inquiry type
          byType: [
            { $group: { _id: '$inquiryType', count: { $sum: 1 } } }
          ],
          // Count by purpose
          byPurpose: [
            { $group: { _id: '$inquiryPurpose', count: { $sum: 1 } } }
          ],
          // Count by month
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: '$inquiryDate' },
                  month: { $month: '$inquiryDate' }
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