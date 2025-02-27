// backend/src/controllers/user.controller.js
const User = require('../models/User');
const { createError } = require('../utils/error');

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(createError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = async (req, res, next) => {
  try {
    // Check if user is trying to update password
    if (req.body.passwordHash || req.body.password) {
      return next(createError('This route is not for password updates. Please use /api/auth/password', 400));
    }

    // Filter out fields that shouldn't be updated
    const filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'phoneNumber',
      'address',
      'employmentInfo'
    );

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    // Implement pagination, filtering, and sorting
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = User.find();

    // Apply filters if provided
    if (req.query.userType) {
      query = query.find({ userType: req.query.userType });
    }

    if (req.query.search) {
      query = query.find({
        $or: [
          { firstName: { $regex: req.query.search, $options: 'i' } },
          { lastName: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // Apply pagination
    query = query.skip(skip).limit(limit);

    // Execute query
    const users = await query;
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      results: users.length,
      pagination: {
        page,
        pages: Math.ceil(totalUsers / limit),
        count: totalUsers
      },
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Filter out fields that shouldn't be updated
    const filteredBody = filterObj(
      req.body,
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'userType',
      'address',
      'employmentInfo'
    );

    const user = await User.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return next(createError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(createError('User not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users by type
// @route   GET /api/users/type/:userType
// @access  Private/Admin
exports.getUsersByType = async (req, res, next) => {
  try {
    const { userType } = req.params;
    
    // Validate user type
    if (!['admin', 'consumer', 'lender'].includes(userType)) {
      return next(createError('Invalid user type', 400));
    }

    // Implement pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const users = await User.find({ userType })
      .skip(skip)
      .limit(limit);
      
    const totalUsers = await User.countDocuments({ userType });

    res.status(200).json({
      status: 'success',
      results: users.length,
      pagination: {
        page,
        pages: Math.ceil(totalUsers / limit),
        count: totalUsers
      },
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user growth statistics
// @route   GET /api/users/stats/user-growth
// @access  Private/Admin
exports.getUserGrowthStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user type distribution statistics
// @route   GET /api/users/stats/user-types
// @access  Private/Admin
exports.getUserTypeDistribution = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Utility function to filter request body for allowed fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};