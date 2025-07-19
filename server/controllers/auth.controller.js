// server/controllers/auth.controller.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Interviewer = require('../models/Interviewer');
const crypto = require('crypto');
const {
  generateToken,
  createPasswordResetToken,
  resetPassword
} = require('../services/auth.service');
const {
  sendPasswordResetEmail
} = require('../services/email.service');
const { logEvent, logError } = require('../middleware/logger.middleware');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    res.status(401);
    throw new Error('Your account is inactive. Please contact support.');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Update last login time
  user.lastLogin = Date.now();
  await user.save();

  logEvent('user_login', {
    userId: user._id,
    email: user.email,
    role: user.role
  });

  res.json({
    success: true,
    token: user.getSignedJwtToken(),
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  // Get role-specific data if needed
  let roleData = null;
  if (user.role === 'interviewer') {
    roleData = await Interviewer.findOne({ user: user._id })
      .select('status paymentTier metrics profileCompleteness primaryDomain');
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      whatsappNumber: user.whatsappNumber,
      role: user.role,
      lastLogin: user.lastLogin,
      roleData
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    whatsappNumber
  } = req.body;

  const user = await User.findById(req.user.id);

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber;

  await user.save();

  logEvent('profile_updated', {
    userId: user._id,
    email: user.email
  });

  res.json({
    success: true,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      whatsappNumber: user.whatsappNumber,
      role: user.role
    }
  });
});

// @desc    Create password (for new interviewers)
// @route   POST /api/auth/create-password
// @access  Public
const createPassword = asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  // Verify passwords match
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  // Hash the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with matching token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  // Set new password and clear reset fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  await user.save();

  logEvent('password_created', {
    userId: user._id,
    email: user.email
  });

  res.json({
    success: true,
    message: 'Password set successfully. You can now log in.'
  });
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Don't reveal if user exists or not for security
  if (!user) {
    res.json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.'
    });
    return;
  }

  // Generate reset token
  const resetToken = await createPasswordResetToken(email);

  // Send reset email
  await sendPasswordResetEmail(user, resetToken);

  res.json({
    success: true,
    message: 'If an account exists with that email, a reset link has been sent.'
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPasswordHandler = asyncHandler(async (req, res) => {
    const { token, password, confirmPassword } = req.body;
  
    // Verify passwords match
    if (password !== confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match');
    }
  
    // Reset password
    const success = await resetPassword(token, password);
  
    if (success) {
      res.json({
        success: true,
        message: 'Password reset successful. You can now log in with your new password.'
      });
    } else {
      res.status(400);
      throw new Error('Password reset failed');
    }
  });
  
  // @desc    Change password
  // @route   PUT /api/auth/change-password
  // @access  Private
  const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
  
    // Verify passwords match
    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error('New passwords do not match');
    }
  
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
  
    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }
  
    // Update password
    user.password = newPassword;
    await user.save();
  
    logEvent('password_changed', {
      userId: user._id,
      email: user.email
    });
  
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  });
  
  module.exports = {
    login,
    getMe,
    updateProfile,
    createPassword,
    forgotPassword,
    resetPasswordHandler,
    changePassword
  };