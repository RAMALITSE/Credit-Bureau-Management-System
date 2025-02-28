// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { createError } = require('../utils/error');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie (for web clients)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // Check if token exists
    if (!token) {
      return next(createError('You are not logged in. Please log in to access this resource.', 401));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(createError('The user associated with this token no longer exists.', 401));
    }
    
    // Add user to request object
    req.user = {
      id: user._id,
      email: user.email,
      userType: user.userType
    };
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(createError('Invalid token. Please log in again.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(createError('Your token has expired. Please log in again.', 401));
    }
    next(err);
  }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user has required role
    if (!roles.includes(req.user.userType)) {
      return next(createError(`You do not have permission to perform this action. Required role: ${roles.join(' or ')}`, 403));
    }
    
    next();
  };
};