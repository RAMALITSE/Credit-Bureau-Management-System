// backend/src/routes/dispute.routes.js
const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/dispute.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { validateDisputeCreate, validateDisputeUpdate, validateLenderResponse, validateDisputeResolution } = require('../validators/dispute.validator');

// Protected routes - all users need to be authenticated
router.use(protect);

// Consumer routes
router.get('/my-disputes', restrictTo('consumer'), disputeController.getMyDisputes);
router.get('/my-disputes/:id', restrictTo('consumer'), disputeController.getMyDisputeById);
router.post('/account/:accountId', restrictTo('consumer'), validateDisputeCreate, disputeController.createDispute);
router.put('/my-disputes/:id', restrictTo('consumer'), validateDisputeUpdate, disputeController.updateDispute);

// Lender routes
router.get('/lender', restrictTo('lender'), disputeController.getLenderDisputes);
router.get('/lender/:id', restrictTo('lender'), disputeController.getLenderDisputeById);
router.post('/lender/:id/respond', restrictTo('lender'), validateLenderResponse, disputeController.respondToDispute);

// Admin routes
router.get('/admin', restrictTo('admin'), disputeController.getAllDisputes);
router.get('/admin/:id', restrictTo('admin'), disputeController.getDisputeById);
router.put('/admin/:id/resolve', restrictTo('admin'), validateDisputeResolution, disputeController.resolveDispute);
router.delete('/admin/:id', restrictTo('admin'), disputeController.deleteDispute);

// Stats route - for admin dashboard
router.get('/stats', restrictTo('admin'), disputeController.getDisputeStats);

module.exports = router;