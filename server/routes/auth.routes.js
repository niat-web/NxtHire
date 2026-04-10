// server/routes/auth.routes.js
const express = require('express');
const {
  login,
  googleLogin,
  getMe,
  updateProfile,
  createPassword,
  forgotPassword,
  resetPasswordHandler,
  changePassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validator.middleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

// Public routes (rate-limited)
router.post('/login', authLimiter, validate(schemas.login), login);
router.post('/google', authLimiter, googleLogin);
router.post('/create-password', authLimiter, validate(schemas.createPassword), createPassword);
router.post('/forgot-password', authLimiter, validate(schemas.resetPassword), forgotPassword);
router.post('/reset-password', authLimiter, validate(schemas.createPassword), resetPasswordHandler);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;