// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { validateUserUpdate } = require('../validators/user.validator');

// Protected routes - all users need to be authenticated
router.use(protect);

// All users can access their own profile
router.get('/me', userController.getMe);
router.put('/me', validateUserUpdate, userController.updateMe);

// Admin-only routes
router.use(restrictTo('admin'));

// Get users by type - place this BEFORE the /:id route to prevent conflicts
router.get('/type/:userType', userController.getUsersByType);

// Get all users and stats - admin only
router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);



// Get, update, delete specific user - admin only
router.route('/:id')
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

// Analytics and statistics - admin only
router.get('/stats/user-growth', userController.getUserGrowthStats);
router.get('/stats/user-types', userController.getUserTypeDistribution);

module.exports = router;