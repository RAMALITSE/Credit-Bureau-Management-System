// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { createError } = require('../utils/error');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return next(createError('You are not logged in. Please log in to get access.', 401));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(createError('The user belonging to this token no longer exists.', 401));
    }
    
    // Grant access to protected route
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError('Invalid token. Please log in again.', 401));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(createError('Your token has expired. Please log in again.', 401));
    }
    
    next(error);
  }
};

/**
 * Middleware to restrict access to specific user types
 * @param {...string} roles - Roles that are allowed to access the route
 * @returns {Function} - Express middleware function
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return next(createError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
};