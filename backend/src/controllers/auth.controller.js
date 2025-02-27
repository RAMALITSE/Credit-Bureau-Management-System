// backend/src/controllers/auth.controller.js
const User = require('../models/User');
const CreditProfile = require('../models/CreditProfile');
const { createError } = require('../utils/error');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      userType,
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      nationalId,
      address,
      employmentInfo
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(createError('User already exists with this email', 400));
    }

    const nationalIdExists = await User.findOne({ nationalId });
    if (nationalIdExists) {
      return next(createError('User already exists with this National ID', 400));
    }

    // Create new user
    const user = await User.create({
      userType,
      firstName,
      lastName,
      email,
      passwordHash: password,
      phoneNumber,
      dateOfBirth,
      nationalId,
      address,
      employmentInfo: userType === 'consumer' ? employmentInfo : undefined
    });

    // If consumer, create credit profile
    if (userType === 'consumer') {
      await CreditProfile.create({
        userId: user._id,
        nationalId: user.nationalId
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    // Return user data (excluding password)
    const userData = user.toObject();
    delete userData.passwordHash;

    res.status(201).json({
      status: 'success',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password input
    if (!email || !password) {
      return next(createError('Please provide email and password', 400));
    }

    // Find user and include password for verification
    const user = await User.findOne({ email }).select('+passwordHash');
    
    // Check if user exists
    if (!user) {
      return next(createError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(createError('Invalid credentials', 401));
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    // Return user data (excluding password)
    const userData = user.toObject();
    delete userData.passwordHash;

    res.status(200).json({
      status: 'success',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      address,
      employmentInfo
    } = req.body;

    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        phoneNumber,
        address,
        employmentInfo,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
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

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user with password
    const user = await User.findById(req.user.id).select('+passwordHash');

    if (!user) {
      return next(createError('User not found', 404));
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(createError('Current password is incorrect', 401));
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError('There is no user with that email address', 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Token expires in 10 minutes
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    
    await user.save({ validateBeforeSave: false });

    // In a real application, you would send an email with the reset token
    // For this assignment, we'll just return it in the response
    
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      resetToken // In production, you would NOT send this in the response
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(createError('Token is invalid or has expired', 400));
    }

    // Set new password
    user.passwordHash = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    // Generate new token
    const authToken = user.generateAuthToken();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
      token: authToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Hash the token to compare with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(createError('Token is invalid or has expired', 400));
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};