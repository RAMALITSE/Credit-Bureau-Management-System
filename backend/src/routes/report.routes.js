// backend/src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, restrictTo } = require('../middleware/auth');

// Protected routes - all users need to be authenticated
router.use(protect);

// Consumer routes - generate and access own reports
router.get('/my-reports', restrictTo('consumer'), reportController.getMyReports);
router.post('/generate', restrictTo('consumer'), reportController.generateReport);
router.get('/my-reports/:id', restrictTo('consumer'), reportController.getMyReportById);

// Lender routes - request reports with consent
router.post('/request', restrictTo('lender'), reportController.requestReport);
router.get('/lender/:accessToken', restrictTo('lender'), reportController.getReportByAccessToken);

// Admin routes
router.use('/admin', restrictTo('admin'));
router.get('/admin', reportController.getAllReports);
router.get('/admin/:id', reportController.getReportById);

module.exports = router;