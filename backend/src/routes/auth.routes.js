// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin, validatePasswordChange } = require('../validators/auth.validator');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);
router.put('/profile', protect, authController.updateProfile);
router.put('/password', protect, validatePasswordChange, authController.changePassword);
router.get('/logout', protect, authController.logout);

module.exports = router;