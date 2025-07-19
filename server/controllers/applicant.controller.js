// server/controllers/applicant.controller.js
const asyncHandler = require('express-async-handler');
const Applicant = require('../models/Applicant');
const SkillAssessment = require('../models/SkillAssessment');
const Guidelines = require('../models/Guidelines');
const User = require('../models/User');
const Interviewer = require('../models/Interviewer');
const { APPLICATION_STATUS, GUIDELINES_QUESTIONS } = require('../config/constants');
const { registerUser } = require('../services/auth.service');
const { sendEmail, sendAccountCreationEmail } = require('../services/email.service');
const { sendWelcomeWhatsApp } = require('../services/whatsapp.service');
const { logEvent, logError } = require('../middleware/logger.middleware');
const crypto = require('crypto');

// @desc    Submit initial application
// @route   POST /api/applicant/apply
// @access  Public
const submitApplication = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    whatsappNumber,
    linkedinProfileUrl,
    interestedInJoining,
    sourcingChannel,
    additionalComments
  } = req.body;

  // Check if applicant with this email already exists
  const existingApplicant = await Applicant.findOne({ email });
  if (existingApplicant) {
    res.status(400);
    throw new Error('An application with this email already exists');
  }

  // Create new applicant
  const applicant = await Applicant.create({
    fullName,
    email,
    phoneNumber,
    whatsappNumber,
    linkedinProfileUrl,
    interestedInJoining,
    sourcingChannel,
    additionalComments,
    status: APPLICATION_STATUS.SUBMITTED,
    statusHistory: [
      {
        status: APPLICATION_STATUS.SUBMITTED,
        timestamp: Date.now()
      }
    ]
  });

  // Send confirmation email
  await sendEmail({
    recipient: applicant._id,
    recipientModel: 'Applicant',
    recipientEmail: email,
    templateName: 'applicationConfirmation',
    subject: 'Application Received - NxtWave Interviewer Program',
    templateData: {
      name: fullName,
      applicationId: applicant._id.toString()
    },
    relatedTo: 'Application Confirmation',
    isAutomated: true
  });

  logEvent('application_submitted', {
    applicantId: applicant._id,
    email: applicant.email
  });

  res.status(201).json({
    success: true,
    data: {
      id: applicant._id,
      status: applicant.status,
      message: 'Application submitted successfully'
    }
  });
});

// @desc    Submit skill assessment
// @route   POST /api/applicant/:id/skill-assessment
// @access  Public
const submitSkillAssessment = asyncHandler(async (req, res) => {
  const {
    currentEmployer,
    jobTitle,
    yearsOfExperience,
    technicalSkills,
    otherSkills
  } = req.body;

  // Find applicant
  const applicant = await Applicant.findById(req.params.id);
  if (!applicant) {
    res.status(404);
    throw new Error('Applicant not found');
  }

  // Verify applicant is at the correct stage
  if (applicant.status !== APPLICATION_STATUS.PROFILE_APPROVED &&
      applicant.status !== APPLICATION_STATUS.SKILLS_ASSESSMENT_SENT) {
    res.status(400);
    throw new Error('Applicant is not at the skill assessment stage');
  }

  // Create skill assessment
  const skillAssessment = await SkillAssessment.create({
    applicant: applicant._id,
    currentEmployer,
    jobTitle,
    yearsOfExperience,
    technicalSkills: technicalSkills || [],
    otherSkills
  });

  // Update applicant status
  applicant.status = APPLICATION_STATUS.SKILLS_ASSESSMENT_COMPLETED;
  await applicant.save();

  logEvent('skill_assessment_submitted', {
    applicantId: applicant._id,
    skillAssessmentId: skillAssessment._id,
    domain: skillAssessment.autoCategorizedDomain
  });

  res.status(201).json({
    success: true,
    data: {
      id: skillAssessment._id,
      domain: skillAssessment.autoCategorizedDomain,
      message: 'Skill assessment submitted successfully'
    }
  });
});

// @desc    Submit guidelines questionnaire
// @route   POST /api/applicant/:id/guidelines
// @access  Public
const submitGuidelines = asyncHandler(async (req, res) => {
    const { answers, completionTime } = req.body;
  
    // Find applicant
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      res.status(404);
      throw new Error('Applicant not found');
    }
  
    // Verify applicant is at the correct stage
    if (applicant.status !== APPLICATION_STATUS.GUIDELINES_SENT) {
      res.status(400);
      throw new Error('Applicant is not at the guidelines stage');
    }
  
    // Process answers and check against correct answers
    const processedAnswers = answers.map(answer => {
      const question = GUIDELINES_QUESTIONS.find(q => q.id === answer.questionNumber);
      return {
        questionNumber: answer.questionNumber,
        selectedOption: answer.selectedOption,
        isCorrect: question ? question.correctAnswer === answer.selectedOption : false
      };
    });
  
    // Calculate score
    const correctAnswers = processedAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / processedAnswers.length) * 100);
    const passed = score >= 80;
  
    // Create guidelines submission
    const guidelines = await Guidelines.create({
      applicant: applicant._id,
      answers: processedAnswers,
      score,
      passed,
      completionTime
    });
  
    // Update applicant status to 'Guidelines Reviewed' so admin can take action
    applicant.status = APPLICATION_STATUS.GUIDELINES_REVIEWED;
    await applicant.save();
  
    logEvent('guidelines_submitted_for_review', {
      applicantId: applicant._id,
      guidelinesId: guidelines._id,
      score,
      passed
    });
  
    res.json({
      success: true,
      message: 'Guidelines submitted successfully. Your submission is now under review.'
    });
});
  
// @desc    Check application status and get public details
// @route   GET /api/applicant/status/:id
// @access  Public
const checkApplicationStatus = asyncHandler(async (req, res) => {
  const applicant = await Applicant.findById(req.params.id);
  
  if (!applicant) {
    res.status(404);
    throw new Error('Application not found');
  }

  // --- MODIFICATION START ---
  // Return more details for the form pre-fill
  res.json({
    success: true,
    data: {
      id: applicant._id,
      status: applicant.status,
      submittedAt: applicant.createdAt,
      lastUpdated: applicant.updatedAt,
      // Add necessary fields for the form
      fullName: applicant.fullName,
      email: applicant.email,
      phoneNumber: applicant.phoneNumber,
      linkedinProfileUrl: applicant.linkedinProfileUrl,
    }
  });
  // --- MODIFICATION END ---
});

module.exports = {
  submitApplication,
  submitSkillAssessment,
  submitGuidelines,
  checkApplicationStatus
};