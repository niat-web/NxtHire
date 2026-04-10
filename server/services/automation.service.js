// server/services/automation.service.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const Applicant = require('../models/Applicant');
const Interviewer = require('../models/Interviewer');
const User = require('../models/User');
const Communication = require('../models/Communication');
const { sendEmail } = require('./email.service');
const { APPLICATION_STATUS, INTERVIEWER_STATUS } = require('../config/constants');
const { logEvent, logError } = require('../middleware/logger.middleware');
const axios = require('axios');

const activeJobs = {};

const initializeAutomationJobs = () => {
  activeJobs.processCommunicationQueue = cron.schedule('*/5 * * * *', async () => {
    await processCommunicationQueue();
  });

  activeJobs.updateInterviewerMetrics = cron.schedule('0 0 * * *', async () => {
    await updateInterviewerMetrics();
  });

  activeJobs.checkProbationPeriods = cron.schedule('0 1 * * *', async () => {
    await checkProbationPeriods();
  });

  activeJobs.sendWorkflowReminders = cron.schedule('0 10 * * *', async () => {
    await sendWorkflowReminders();
  });

  activeJobs.cleanupOldCommunications = cron.schedule('0 2 * * 0', async () => {
    await cleanupOldCommunications();
  });

  logEvent('automation_jobs_initialized', {
    jobCount: Object.keys(activeJobs).length,
    jobs: Object.keys(activeJobs)
  });
};

// Process queued communications using Brevo API (not Nodemailer)
const processCommunicationQueue = async () => {
  try {
    const queuedCommunications = await Communication.find({
      status: 'Queued'
    }).limit(50);

    if (queuedCommunications.length === 0) return;

    logEvent('processing_communication_queue', { count: queuedCommunications.length });

    for (const comm of queuedCommunications) {
      if (comm.communicationType === 'Email') {
        try {
          // Use Brevo API (consistent with email.service.js)
          const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: process.env.FROM_NAME || 'NxtWave', email: process.env.FROM_EMAIL },
            to: [{ email: comm.recipientEmail }],
            subject: comm.subject,
            htmlContent: comm.content
          }, {
            headers: {
              'api-key': process.env.BREVO_API_KEY,
              'Content-Type': 'application/json'
            }
          });

          comm.status = 'Sent';
          comm.statusLog.push({ status: 'Sent', timestamp: new Date() });
          comm.sentAt = new Date();
          await comm.save();
        } catch (error) {
          comm.status = 'Failed';
          comm.statusLog.push({ status: 'Failed', timestamp: new Date(), details: error.message });
          await comm.save();
          logError('queued_email_failed', error, { communicationId: comm._id, recipientEmail: comm.recipientEmail });
        }
      }
    }
  } catch (error) {
    logError('process_communication_queue_failed', error);
  }
};

const updateInterviewerMetrics = async () => {
  try {
    const interviewers = await Interviewer.find({
      status: { $in: ['On Probation', 'Active'] }
    });

    logEvent('updating_interviewer_metrics', { interviewerCount: interviewers.length });

    for (const interviewer of interviewers) {
      interviewer.updatedAt = new Date();
      await interviewer.save();
    }
  } catch (error) {
    logError('update_interviewer_metrics_failed', error);
  }
};

const checkProbationPeriods = async () => {
  try {
    const interviewersEndingProbation = await Interviewer.find({
      status: 'On Probation',
      probationEndDate: { $lte: new Date() }
    }).populate('user', 'email firstName lastName');

    logEvent('checking_probation_periods', { interviewerCount: interviewersEndingProbation.length });

    for (const interviewer of interviewersEndingProbation) {
      if (interviewer.metrics.interviewsCompleted >= 5 && interviewer.metrics.averageRating >= 3.5) {
        interviewer.status = 'Active';
        await interviewer.save();

        if (interviewer.user?.email) {
          try {
            await sendEmail({
              recipient: interviewer._id,
              recipientModel: 'Interviewer',
              recipientEmail: interviewer.user.email,
              templateName: 'probationComplete',
              subject: 'Congratulations! You are now an Active Interviewer',
              templateData: {
                firstName: interviewer.user.firstName,
                portalLink: process.env.CLIENT_URL
              },
              relatedTo: 'System Notification',
              isAutomated: true
            });
          } catch (emailErr) {
            logError('probation_email_failed', emailErr, { interviewerId: interviewer._id });
          }
        }
      }
    }
  } catch (error) {
    logError('check_probation_periods_failed', error);
  }
};

const sendWorkflowReminders = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 3);

    const stuckApplicants = await Applicant.aggregate([
      { $unwind: '$statusHistory' },
      { $sort: { _id: 1, 'statusHistory.timestamp': -1 } },
      {
        $group: {
          _id: '$_id',
          fullName: { $first: '$fullName' },
          email: { $first: '$email' },
          status: { $first: '$status' },
          latestStatusTimestamp: { $first: '$statusHistory.timestamp' }
        }
      },
      {
        $match: {
          latestStatusTimestamp: { $lt: cutoffDate },
          status: {
            $nin: [
              APPLICATION_STATUS.PROFILE_REJECTED,
              APPLICATION_STATUS.GUIDELINES_FAILED,
              APPLICATION_STATUS.ONBOARDED,
              APPLICATION_STATUS.ACTIVE_INTERVIEWER
            ]
          }
        }
      }
    ]);

    logEvent('sending_workflow_reminders', { applicantCount: stuckApplicants.length });

    const adminEmail = process.env.FROM_EMAIL || 'admin@nxtwave.com';

    for (const applicant of stuckApplicants) {
      try {
        await sendEmail({
          recipient: applicant._id,
          recipientModel: 'Applicant',
          recipientEmail: adminEmail,
          templateName: 'newApplicantNotification',
          subject: `Reminder: ${applicant.fullName} needs attention (${applicant.status})`,
          templateData: {
            fullName: applicant.fullName,
            email: applicant.email,
            phoneNumber: '',
            linkedinProfileUrl: '',
            sourcingChannel: '',
            additionalComments: `Stuck in "${applicant.status}" for ${Math.floor((new Date() - new Date(applicant.latestStatusTimestamp)) / (1000 * 60 * 60 * 24))} days`,
            applicationId: applicant._id.toString(),
            reviewLink: `${process.env.CLIENT_URL}/admin/hiring/applicants`,
            submittedAt: new Date().toLocaleDateString('en-IN')
          },
          relatedTo: 'Workflow Reminder',
          isAutomated: true
        });
      } catch (emailErr) {
        logError('workflow_reminder_email_failed', emailErr, { applicantId: applicant._id });
      }
    }
  } catch (error) {
    logError('send_workflow_reminders_failed', error);
  }
};

const cleanupOldCommunications = async () => {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 90);

    const result = await Communication.deleteMany({
      createdAt: { $lt: thresholdDate },
      status: { $in: ['Sent', 'Delivered', 'Read', 'Failed'] }
    });

    logEvent('cleaned_old_communications', { deletedCount: result.deletedCount, thresholdDate });
  } catch (error) {
    logError('cleanup_old_communications_failed', error);
  }
};

const stopAllJobs = () => {
  Object.values(activeJobs).forEach(job => job.stop());
  logEvent('automation_jobs_stopped', { jobCount: Object.keys(activeJobs).length });
};

const triggerJob = async (jobName) => {
  try {
    const jobs = { processCommunicationQueue, updateInterviewerMetrics, checkProbationPeriods, sendWorkflowReminders, cleanupOldCommunications };
    if (!jobs[jobName]) throw new Error(`Unknown job: ${jobName}`);
    await jobs[jobName]();
    logEvent('job_manually_triggered', { jobName });
    return true;
  } catch (error) {
    logError('manual_job_trigger_failed', error, { jobName });
    throw error;
  }
};

module.exports = {
  initializeAutomationJobs, stopAllJobs, triggerJob,
  processCommunicationQueue, updateInterviewerMetrics, checkProbationPeriods,
  sendWorkflowReminders, cleanupOldCommunications
};
