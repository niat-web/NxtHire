const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  // Singleton document identifier
  key: {
    type: String,
    default: 'global',
    unique: true,
  },

  // ── EMAIL NOTIFICATIONS ────────────────────────────────────────────────────

  // Applicant emails
  emailApplicationConfirmation: { type: Boolean, default: true },
  emailSkillAssessmentInvitation: { type: Boolean, default: true },
  emailProfileRejection: { type: Boolean, default: true },
  emailGuidelinesInvitation: { type: Boolean, default: true },
  emailAccountCreation: { type: Boolean, default: true },

  // Admin emails
  emailNewApplicantNotification: { type: Boolean, default: true },
  emailWorkflowReminder: { type: Boolean, default: true },

  // Interviewer emails
  emailBookingRequestNotification: { type: Boolean, default: true },
  emailProbationComplete: { type: Boolean, default: true },
  emailNewInterviewerWelcome: { type: Boolean, default: true },
  emailPaymentConfirmation: { type: Boolean, default: true },
  emailInvoiceMail: { type: Boolean, default: true },
  emailPaymentReceivedConfirmation: { type: Boolean, default: true },
  emailInterviewCancelled: { type: Boolean, default: true },

  // Student emails
  emailStudentBookingInvitation: { type: Boolean, default: true },
  emailStudentBookingReminder: { type: Boolean, default: true },

  // Bulk/Custom emails
  emailCustomBulkEmail: { type: Boolean, default: true },

  // Password reset (critical - always on but trackable)
  emailPasswordReset: { type: Boolean, default: true },

  // ── WHATSAPP NOTIFICATIONS ─────────────────────────────────────────────────

  whatsappInterviewerWelcome: { type: Boolean, default: true },

  // ── PUSH NOTIFICATIONS ─────────────────────────────────────────────────────

  pushBookingRequest: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);
