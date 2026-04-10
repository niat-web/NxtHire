// server/routes/applicant.routes.js
const express = require('express');
const { 
  submitApplication, 
  submitSkillAssessment, 
  submitGuidelines, 
  checkApplicationStatus 
} = require('../controllers/applicant.controller');
const { validate, schemas } = require('../middleware/validator.middleware');
const rateLimit = require('express-rate-limit');

const statusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const router = express.Router();

// Public routes
router.post('/apply', validate(schemas.initialApplication), submitApplication);
router.post('/:id/skill-assessment', validate(schemas.skillAssessment), submitSkillAssessment);
router.post('/:id/guidelines', validate(schemas.guidelinesQuestionnaire), submitGuidelines);
router.get('/status/:id', statusLimiter, checkApplicationStatus);

module.exports = router;
