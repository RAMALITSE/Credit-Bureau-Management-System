// backend/src/routes/dispute.routes.js
const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/dispute.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { validateDisputeCreate } = require('../validators/dispute.validator');

// Protected routes - all users need to be authenticated
router.use(protect);

// Consumer routes - manage disputes
router.route('/')
  .get(restrictTo('consumer'), disputeController.getMyDisputes)
  .post(restrictTo('consumer'), validateDisputeCreate, disputeController.createDispute);

router.route('/:id')
  .get(restrictTo('consumer'), disputeController.getMyDisputeById)
  .put(restrictTo('consumer'), disputeController.updateDispute)
  .delete(restrictTo('consumer'), disputeController.cancelDispute);

// Lender routes - view disputes on accounts they manage
router.get('/lender', restrictTo('lender'), disputeController.getLenderDisputes);
router.route('/lender/:id')
  .get(restrictTo('lender'), disputeController.getLenderDisputeById)
  .put(restrictTo('lender'), disputeController.respondToDispute);

// Admin routes
router.use('/admin', restrictTo('admin'));
router.get('/admin', disputeController.getAllDisputes);
router.get('/admin/:id', disputeController.getDisputeById);
router.put('/admin/:id', disputeController.resolveDispute);

// Get dispute statistics (admin only)
router.get('/stats/dispute-types', restrictTo('admin'), disputeController.getDisputeTypeStats);
router.get('/stats/resolution-times', restrictTo('admin'), disputeController.getResolutionTimeStats);

module.exports = router;