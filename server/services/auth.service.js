// server/services/auth.service.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Interviewer = require('../models/Interviewer');
const { logEvent, logError } = require('../middleware/logger.middleware');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Register new user (admin or interviewer)
const registerUser = async (userData, role = 'interviewer') => {
  try {
    // Create user with the given role
    const user = await User.create({
      ...userData,
      role
    });

    // Create role-specific record
    if (role === 'admin') {
      await Admin.create({
        user: user._id,
        department: userData.department || 'HR',
        permissions: userData.permissions || {
          manageApplicants: true,
          manageInterviewers: true,
          manageCommunications: true,
          viewReports: true,
          systemSettings: false
        }
      });
    }

    // Note: Interviewer records are created separately during onboarding

    logEvent('user_registration', {
      userId: user._id,
      role,
      email: user.email
    });

    return user;
  } catch (error) {
    logError('user_registration_failed', error, { email: userData.email, role });
    throw error;
  }
};

// Generate password reset token
const createPasswordResetToken = async (email) => {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Set expire (10 minutes)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    await user.save();
    
    logEvent('password_reset_requested', {
      userId: user._id,
      email: user.email
    });
    
    return resetToken;
  } catch (error) {
    logError('password_reset_token_failed', error, { email });
    throw error;
  }
};

// Reset password using token
const resetPassword = async (token, newPassword) => {
  try {
    // Hash the received token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
      
    // Find user with matching token and token not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      throw new Error('Invalid or expired token');
    }
    
    // Set new password and clear reset fields
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
    
    logEvent('password_reset_successful', {
      userId: user._id,
      email: user.email
    });
    
    return true;
  } catch (error) {
    logError('password_reset_failed', error);
    throw error;
  }
};

// Create initial admin user if none exists
const createInitialAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        phoneNumber: '0000000000',
        role: 'admin'
      };
      
      const admin = await registerUser(adminData, 'admin');
      
      console.log(`Initial admin created: ${admin.email}`.green);
      return admin;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to create initial admin:'.red, error);
    throw error;
  }
};

module.exports = {
  generateToken,
  registerUser,
  createPasswordResetToken,
  resetPassword,
  createInitialAdmin
};
