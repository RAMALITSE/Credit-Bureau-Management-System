// backend/src/controllers/report.controller.js
const Report = require('../models/Report');
const CreditProfile = require('../models/CreditProfile');
const CreditAccount = require('../models/CreditAccount');
const Inquiry = require('../models/Inquiry');
const PublicRecord = require('../models/PublicRecord');
const Collection = require('../models/Collection');
const crypto = require('crypto');
const { createError } = require('../utils/error');

// @desc    Get all reports for current user
// @route   GET /api/reports/my-reports
// @access  Private/Consumer
exports.getMyReports = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find all reports for this profile
    const reports = await Report.find({ profileId: profile._id })
      .sort({ generatedAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: {
        reports
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a new credit report
// @route   POST /api/reports/generate
// @access  Private/Consumer
exports.generateReport = async (req, res, next) => {
  try {
    // Get the report type
    const { reportType = 'full' } = req.body;
    
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find user to get personal information
    const user = await User.findById(req.user.id);
    
    // Gather data for the report
    const accounts = await CreditAccount.find({ profileId: profile._id });
    const inquiries = await Inquiry.find({ 
      profileId: profile._id,
      inquiryType: 'hard'
    }).sort({ inquiryDate: -1 }).limit(reportType === 'summary' ? 5 : 25);
    
    const publicRecords = await PublicRecord.find({ profileId: profile._id });
    const collections = await Collection.find({ profileId: profile._id });
    
    // Create report data snapshot
    const reportData = {
      personalInfo: {
        name: `${user.firstName} ${user.lastName}`,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        nationalId: user.nationalId
      },
      creditScore: profile.creditScore,
      scoreCategory: CreditProfile.getCreditScoreCategory(profile.creditScore),
      accounts: accounts.map(account => ({
        lenderName: account.lenderName,
        accountType: account.accountType,
        accountStatus: account.status,
        openDate: account.openDate,
        lastReportDate: account.lastReportDate,
        currentBalance: account.currentBalance,
        paymentHistory: reportType === 'full' ? account.paymentHistory : account.paymentHistory.slice(0, 6)
      })),
      inquiries: inquiries.map(inquiry => ({
        inquiringEntity: inquiry.inquiringEntity.name,
        inquiryType: inquiry.inquiryType,
        inquiryPurpose: inquiry.inquiryPurpose,
        inquiryDate: inquiry.inquiryDate
      })),
      publicRecords: publicRecords.map(record => ({
        recordType: record.recordType,
        courtName: record.courtName,
        filedDate: record.filedDate,
        status: record.status,
        liabilityAmount: record.liabilityAmount
      })),
      collections: collections.map(collection => ({
        collectionAgency: collection.collectionAgency,
        originalCreditor: collection.originalCreditor,
        originalAmount: collection.originalAmount,
        currentAmount: collection.currentAmount,
        collectionDate: collection.collectionDate,
        status: collection.status
      }))
    };
    
    // Generate access token
    const accessToken = crypto.randomBytes(20).toString('hex');
    
    // Create the report
    const report = await Report.create({
      profileId: profile._id,
      requestedBy: req.user.id,
      generatedAt: new Date(),
      reportType,
      reportFormat: 'json', // Default format
      reportData,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
      accessToken,
      accessLog: [
        {
          userId: req.user.id,
          accessedAt: new Date(),
          ipAddress: req.ip
        }
      ]
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific report by ID
// @route   GET /api/reports/my-reports/:id
// @access  Private/Consumer
exports.getMyReportById = async (req, res, next) => {
  try {
    // Find user's credit profile
    const profile = await CreditProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Find the specific report and ensure it belongs to this user's profile
    const report = await Report.findOne({ 
      _id: req.params.id,
      profileId: profile._id
    });
    
    if (!report) {
      return next(createError('Report not found or does not belong to your profile', 404));
    }
    
    // Record access
    report.accessLog.push({
      userId: req.user.id,
      accessedAt: new Date(),
      ipAddress: req.ip
    });
    
    await report.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a report for a consumer (lender)
// @route   POST /api/reports/request
// @access  Private/Lender
exports.requestReport = async (req, res, next) => {
  try {
    const { profileId, reportType = 'summary' } = req.body;
    
    // Check if profile exists
    const profile = await CreditProfile.findById(profileId);
    if (!profile) {
      return next(createError('Credit profile not found', 404));
    }
    
    // Check if profile is frozen
    if (profile.status === 'frozen') {
      return next(createError('This credit profile is frozen and cannot be accessed', 403));
    }
    
    // Create an inquiry record
    await Inquiry.create({
      profileId: profile._id,
      inquiringEntity: {
        id: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      inquiryType: 'hard',
      inquiryPurpose: 'credit_check',
      inquiryDate: new Date(),
      expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years expiry
    });
    
    // Find user to get personal information
    const user = await User.findById(profile.userId);
    
    // Gather data for the report
    const accounts = await CreditAccount.find({ profileId: profile._id });
    const inquiries = await Inquiry.find({ 
      profileId: profile._id,
      inquiryType: 'hard'
    }).sort({ inquiryDate: -1 }).limit(5);
    
    const publicRecords = await PublicRecord.find({ profileId: profile._id });
    const collections = await Collection.find({ profileId: profile._id });
    
    // Create report data snapshot
    const reportData = {
      personalInfo: {
        name: `${user.firstName} ${user.lastName}`,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        nationalId: user.nationalId
      },
      creditScore: profile.creditScore,
      scoreCategory: CreditProfile.getCreditScoreCategory(profile.creditScore),
      accounts: accounts.map(account => ({
        lenderName: account.lenderName,
        accountType: account.accountType,
        accountStatus: account.status,
        openDate: account.openDate,
        lastReportDate: account.lastReportDate,
        currentBalance: account.currentBalance,
        paymentHistory: account.paymentHistory.slice(0, 6) // Limited history for lenders
      })),
      inquiries: inquiries.map(inquiry => ({
        inquiringEntity: inquiry.inquiringEntity.name,
        inquiryType: inquiry.inquiryType,
        inquiryPurpose: inquiry.inquiryPurpose,
        inquiryDate: inquiry.inquiryDate
      })),
      publicRecords: publicRecords.map(record => ({
        recordType: record.recordType,
        courtName: record.courtName,
        filedDate: record.filedDate,
        status: record.status,
        liabilityAmount: record.liabilityAmount
      })),
      collections: collections.map(collection => ({
        collectionAgency: collection.collectionAgency,
        originalCreditor: collection.originalCreditor,
        originalAmount: collection.originalAmount,
        currentAmount: collection.currentAmount,
        collectionDate: collection.collectionDate,
        status: collection.status
      }))
    };
    
    // Generate access token
    const accessToken = crypto.randomBytes(20).toString('hex');
    
    // Create the report
    const report = await Report.create({
      profileId: profile._id,
      requestedBy: req.user.id,
      generatedAt: new Date(),
      reportType,
      reportFormat: 'json',
      reportData,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
      accessToken,
      accessLog: [
        {
          userId: req.user.id,
          accessedAt: new Date(),
          ipAddress: req.ip
        }
      ]
    });
    
    // Recalculate credit score with new inquiry
    const allInquiries = await Inquiry.find({ profileId: profile._id });
    await profile.recalculateScore(accounts, allInquiries, publicRecords);
    
    res.status(201).json({
      status: 'success',
      data: {
        report,
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get report by access token (lender)
// @route   GET /api/reports/lender/:accessToken
// @access  Private/Lender
exports.getReportByAccessToken = async (req, res, next) => {
  try {
    const { accessToken } = req.params;
    
    // Find report with this access token
    const report = await Report.findOne({ accessToken });
    
    if (!report) {
      return next(createError('Report not found or access token is invalid', 404));
    }
    
    // Check if report has expired
    if (report.expiresAt < new Date()) {
      return next(createError('Report has expired', 401));
    }
    
    // Record access
    report.accessLog.push({
      userId: req.user.id,
      accessedAt: new Date(),
      ipAddress: req.ip
    });
    
    await report.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (admin)
// @route   GET /api/reports/admin
// @access  Private/Admin
exports.getAllReports = async (req, res, next) => {
  try {
    // Implement pagination, filtering, and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = Report.find();
    
    // Apply filters if provided
    if (req.query.reportType) {
      query = query.find({ reportType: req.query.reportType });
    }
    
    if (req.query.profileId) {
      query = query.find({ profileId: req.query.profileId });
    }
    
    if (req.query.requestedBy) {
      query = query.find({ requestedBy: req.query.requestedBy });
    }
    
    if (req.query.startDate) {
      query = query.find({ generatedAt: { $gte: new Date(req.query.startDate) } });
    }
    
    if (req.query.endDate) {
      query = query.find({ generatedAt: { $lte: new Date(req.query.endDate) } });
    }
    
    // Apply sorting
    const sortBy = req.query.sortBy || 'generatedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrder });
    
    // Apply pagination
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const reports = await query;
    const totalReports = await Report.countDocuments();
    
    res.status(200).json({
      status: 'success',
      results: reports.length,
      pagination: {
        page,
        pages: Math.ceil(totalReports / limit),
        count: totalReports
      },
      data: {
        reports
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get report by ID (admin)
// @route   GET /api/reports/admin/:id
// @access  Private/Admin
exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return next(createError('Report not found', 404));
    }
    
    // Record access
    report.accessLog.push({
      userId: req.user.id,
      accessedAt: new Date(),
      ipAddress: req.ip
    });
    
    await report.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        report
      }
    });
  } catch (error) {
    next(error);
  }
};