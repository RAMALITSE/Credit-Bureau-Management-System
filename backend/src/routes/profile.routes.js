// backend/src/routes/profile.routes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { protect, restrictTo } = require('../middleware/auth');

// Protected routes - all users need to be authenticated
router.use(protect);

// Consumer routes
router.get('/me', restrictTo('consumer'), profileController.getMyProfile);
router.post('/recalculate', restrictTo('consumer'), profileController.recalculateScore);
router.get('/score-history', restrictTo('consumer'), profileController.getScoreHistory);
router.post('/fraud-alert', restrictTo('consumer'), profileController.setFraudAlert);
router.delete('/fraud-alert', restrictTo('consumer'), profileController.removeFraudAlert);
router.post('/freeze', restrictTo('consumer'), profileController.freezeProfile);
router.post('/unfreeze', restrictTo('consumer'), profileController.unfreezeProfile);

// Stats routes (more specific routes before generic ones)
router.get('/stats/scores', restrictTo('admin'), profileController.getCreditScoreStats);
router.get('/stats/status', restrictTo('admin'), profileController.getProfileStatusStats);

// ID and National ID routes
router.get('/id/:id', restrictTo('admin', 'lender'), profileController.getProfileById);
router.get('/national-id/:nationalId', restrictTo('admin', 'lender'), profileController.getProfileByNationalId);

// Generic routes last
router.get('/', restrictTo('admin'), profileController.getAllProfiles);
router.put('/:id', restrictTo('admin'), profileController.updateProfile);

module.exports = router;