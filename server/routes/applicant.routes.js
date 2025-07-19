// server/routes/applicant.routes.js
const express = require('express');
const { 
  submitApplication, 
  submitSkillAssessment, 
  submitGuidelines, 
  checkApplicationStatus 
} = require('../controllers/applicant.controller');
const { validate, schemas } = require('../middleware/validator.middleware');

const router = express.Router();

// Public routes
router.post('/apply', validate(schemas.initialApplication), submitApplication);
router.post('/:id/skill-assessment', validate(schemas.skillAssessment), submitSkillAssessment);
router.post('/:id/guidelines', validate(schemas.guidelinesQuestionnaire), submitGuidelines);
router.get('/status/:id', checkApplicationStatus);

module.exports = router;
