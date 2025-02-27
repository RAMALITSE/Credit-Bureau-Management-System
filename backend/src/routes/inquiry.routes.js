// backend/src/routes/inquiry.routes.js
const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { validateInquiryCreate } = require('../validators/inquiry.validator');

// Protected routes - all users need to be authenticated
router.use(protect);

// Consumer routes - view own inquiries
router.get('/my-inquiries', restrictTo('consumer'), inquiryController.getMyInquiries);
router.get('/my-inquiries/:id', restrictTo('consumer'), inquiryController.getMyInquiryById);

// Lender routes - manage inquiries they've made
router.get('/lender', restrictTo('lender'), inquiryController.getLenderInquiries);
router.post('/lender', restrictTo('lender'), validateInquiryCreate, inquiryController.createInquiry);
router.get('/lender/:id', restrictTo('lender'), inquiryController.getLenderInquiryById);

// Admin routes
router.get('/admin', restrictTo('admin'), inquiryController.getAllInquiries);
router.get('/admin/:id', restrictTo('admin'), inquiryController.getInquiryById);
router.delete('/admin/:id', restrictTo('admin'), inquiryController.deleteInquiry);

// Get inquiry statistics (admin only)
router.get('/stats/inquiry-types', restrictTo('admin'), inquiryController.getInquiryStats);

module.exports = router;