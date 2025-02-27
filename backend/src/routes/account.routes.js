// backend/src/routes/account.routes.js
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { validateAccountCreate, validatePaymentAdd } = require('../validators/account.validator');

// Protected routes - all users need to be authenticated
router.use(protect);

// Consumer routes - view own accounts
router.get('/my-accounts', restrictTo('consumer'), accountController.getMyAccounts);
router.get('/my-accounts/:id', restrictTo('consumer'), accountController.getMyAccountById);

// Lender routes - manage accounts they've created
router.use('/lender', restrictTo('lender'));
router.route('/lender')
  .get(accountController.getLenderAccounts)
  .post(validateAccountCreate, accountController.createAccount);

router.route('/lender/:id')
  .get(accountController.getLenderAccountById)
  .put(accountController.updateAccount)
  .delete(accountController.deleteAccount);

// Add payment to account
router.post('/lender/:id/payment', validatePaymentAdd, accountController.addPayment);

// Admin routes
router.use('/admin', restrictTo('admin'));
router.get('/admin', accountController.getAllAccounts);
router.get('/admin/:id', accountController.getAccountById);
router.put('/admin/:id', accountController.adminUpdateAccount);

// Get analytics for accounts
router.get('/stats/account-types', accountController.getAccountTypeStats);
router.get('/stats/payment-history', accountController.getPaymentHistoryStats);

module.exports = router;