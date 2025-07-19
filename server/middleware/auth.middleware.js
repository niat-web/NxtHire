// server/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Protect routes - check if authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (!req.user.isActive) {
        res.status(401);
        throw new Error('User account is inactive');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin only middleware
const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized, admin only');
  }
  next();
});

// Interviewer only middleware
const interviewerOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'interviewer') {
    res.status(403);
    throw new Error('Not authorized, interviewer only');
  }
  next();
});

module.exports = { protect, adminOnly, interviewerOnly };