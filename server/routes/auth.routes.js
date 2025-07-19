// server/routes/auth.routes.js
const express = require('express');
const { 
  login, 
  getMe, 
  updateProfile, 
  createPassword, 
  forgotPassword, 
  resetPasswordHandler, 
  changePassword 
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validator.middleware');

const router = express.Router();

// Public routes
router.post('/login', validate(schemas.login), login);
router.post('/create-password', validate(schemas.createPassword), createPassword);
router.post('/forgot-password', validate(schemas.resetPassword), forgotPassword);
router.post('/reset-password', validate(schemas.createPassword), resetPasswordHandler);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;