// server/services/automation.service.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const Applicant = require('../models/Applicant');
const Interviewer = require('../models/Interviewer');
const Communication = require('../models/Communication');
const { sendEmail } = require('./email.service');
const { APPLICATION_STATUS, INTERVIEWER_STATUS } = require('../config/constants');
const { logEvent, logError } = require('../middleware/logger.middleware');

// Store active jobs
const activeJobs = {};

// Initialize all automation jobs
const initializeAutomationJobs = () => {
  // Process communications queue - every 5 minutes
  activeJobs.processCommunicationQueue = cron.schedule('*/5 * * * *', async () => {
    await processCommunicationQueue();
  });

  // Update interviewer metrics - daily at midnight
  activeJobs.updateInterviewerMetrics = cron.schedule('0 0 * * *', async () => {
    await updateInterviewerMetrics();
  });

  // Check and end probation periods - daily at 1 AM
  activeJobs.checkProbationPeriods = cron.schedule('0 1 * * *', async () => {
    await checkProbationPeriods();
  });

  // Send reminders for applicants stuck in workflow - daily at 10 AM
  activeJobs.sendWorkflowReminders = cron.schedule('0 10 * * *', async () => {
    await sendWorkflowReminders();
  });

  // Clean up old communications - weekly on Sunday at 2 AM
  activeJobs.cleanupOldCommunications = cron.schedule('0 2 * * 0', async () => {
    await cleanupOldCommunications();
  });

  logEvent('automation_jobs_initialized', {
    jobCount: Object.keys(activeJobs).length
  });

  return activeJobs;
};

// Process pending communications
const processCommunicationQueue = async () => {
  try {
    // Find queued communications
    const queuedCommunications = await Communication.find({
      status: 'Queued'
    }).limit(50);

    if (queuedCommunications.length === 0) {
      return;
    }

    logEvent('processing_communication_queue', {
      count: queuedCommunications.length
    });

    // Process each communication
    for (const comm of queuedCommunications) {
      if (comm.communicationType === 'Email') {
        // Re-send email
        try {
          const transporter = createTransporter();
          
          const result = await transporter.sendMail({
            from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
            to: comm.recipientEmail,
            subject: comm.subject,
            html: comm.content
          });

          // Update status
          comm.status = result.accepted.length > 0 ? 'Sent' : 'Failed';
          comm.statusLog.push({
            status: comm.status,
            timestamp: new Date()
          });
          
          if (comm.status === 'Sent') {
            comm.sentAt = new Date();
          }
          
          await comm.save();
        } catch (error) {
          comm.status = 'Failed';
          comm.statusLog.push({
            status: 'Failed',
            timestamp: new Date(),
            details: error.message
          });
          await comm.save();
          
          logError('queued_email_failed', error, {
            communicationId: comm._id,
            recipientEmail: comm.recipientEmail
          });
        }
      }
      // Handle other communication types if needed
    }
  } catch (error) {
    logError('process_communication_queue_failed', error);
  }
};

// Update all interviewer metrics
const updateInterviewerMetrics = async () => {
  try {
    // Get all active interviewers
    const interviewers = await Interviewer.find({
      status: { $in: ['On Probation', 'Active'] }
    });

    logEvent('updating_interviewer_metrics', {
      interviewerCount: interviewers.length
    });

    for (const interviewer of interviewers) {
      // Logic to calculate and update metrics would go here
      // This would typically involve fetching data from other collections
      // such as interviews completed, ratings received, etc.
      
      // For this example, we'll just update the lastUpdated timestamp
      interviewer.updatedAt = new Date();
      await interviewer.save();
    }
  } catch (error) {
    logError('update_interviewer_metrics_failed', error);
  }
};

// Check and process probation periods
const checkProbationPeriods = async () => {
  try {
    // Find interviewers whose probation period has ended
    const interviewersEndingProbation = await Interviewer.find({
      status: 'On Probation',
      probationEndDate: { $lte: new Date() }
    });

    logEvent('checking_probation_periods', {
      interviewerCount: interviewersEndingProbation.length
    });

    for (const interviewer of interviewersEndingProbation) {
      // Check if they meet criteria to move out of probation
      if (interviewer.metrics.interviewsCompleted >= 5 && 
          interviewer.metrics.averageRating >= 3.5) {
        // Promote to active
        interviewer.status = 'Active';
        await interviewer.save();
        
        // Notify the interviewer (implementation would depend on your notification system)
        // This is just a placeholder
        sendEmail({
          recipient: interviewer._id,
          recipientModel: 'Interviewer',
          recipientEmail: (await User.findById(interviewer.user)).email,
          templateName: 'probationComplete',
          subject: 'Congratulations! You are now an Active Interviewer',
          templateData: {
            firstName: interviewer.firstName,
            portalLink: process.env.CLIENT_URL
          },
          relatedTo: 'System Notification',
          isAutomated: true
        });
      }
      // If they don't meet criteria, they remain on probation
    }
  } catch (error) {
    logError('check_probation_periods_failed', error);
  }
};

// Send reminders for applicants stuck in workflow
const sendWorkflowReminders = async () => {
  try {
    // Find applicants who have been in the same status for too long
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 3); // 3 days ago
    
    // Using aggregation to find the latest status change for each applicant
    const stuckApplicants = await Applicant.aggregate([
      // Unwind the status history array
      { $unwind: '$statusHistory' },
      // Sort by applicant ID and timestamp (latest last)
      { $sort: { _id: 1, 'statusHistory.timestamp': -1 } },
      // Group by applicant ID and take the first (latest) status
      { 
        $group: {
          _id: '$_id',
          fullName: { $first: '$fullName' },
          email: { $first: '$email' },
          status: { $first: '$status' },
          latestStatusTimestamp: { $first: '$statusHistory.timestamp' }
        }
      },
      // Filter where the latest status change is older than the cutoff
      {
        $match: {
          latestStatusTimestamp: { $lt: cutoffDate },
          // Exclude terminal statuses
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

    logEvent('sending_workflow_reminders', {
      applicantCount: stuckApplicants.length
    });

    // For each stuck applicant, send a reminder to admin
    for (const applicant of stuckApplicants) {
      // Implementation would depend on your admin notification system
      // This is just a placeholder
      sendEmail({
        // You would need to determine the appropriate admin recipient
        recipient: applicant._id,
        recipientModel: 'Applicant',
        recipientEmail: 'admin@nxtwave.in',
        templateName: 'workflowReminder',
        subject: 'Applicant Reminder: Action Required',
        templateData: {
          applicantName: applicant.fullName,
          applicantEmail: applicant.email,
          status: applicant.status,
          daysInStatus: Math.floor((new Date() - new Date(applicant.latestStatusTimestamp)) / (1000 * 60 * 60 * 24)),
          adminPanelLink: `${process.env.CLIENT_URL}/admin/applicants/${applicant._id}`
        },
        relatedTo: 'System Notification',
        isAutomated: true
      });
    }
  } catch (error) {
    logError('send_workflow_reminders_failed', error);
  }
};

// Clean up old communications
const cleanupOldCommunications = async () => {
  try {
    // Set date threshold (e.g., 90 days ago)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 90);
    
    const result = await Communication.deleteMany({
      createdAt: { $lt: thresholdDate },
      status: { $in: ['Sent', 'Delivered', 'Read', 'Failed'] }
    });
    
    logEvent('cleaned_old_communications', {
      deletedCount: result.deletedCount,
      thresholdDate
    });
  } catch (error) {
    logError('cleanup_old_communications_failed', error);
  }
};

// Stop all jobs
const stopAllJobs = () => {
  Object.values(activeJobs).forEach(job => job.stop());
  logEvent('automation_jobs_stopped', {
    jobCount: Object.keys(activeJobs).length
  });
};

// Manually trigger a specific job
const triggerJob = async (jobName) => {
  try {
    switch (jobName) {
      case 'processCommunicationQueue':
        await processCommunicationQueue();
        break;
      case 'updateInterviewerMetrics':
        await updateInterviewerMetrics();
        break;
      case 'checkProbationPeriods':
        await checkProbationPeriods();
        break;
      case 'sendWorkflowReminders':
        await sendWorkflowReminders();
        break;
      case 'cleanupOldCommunications':
        await cleanupOldCommunications();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
    
    logEvent('job_manually_triggered', { jobName });
    return true;
  } catch (error) {
    logError('manual_job_trigger_failed', error, { jobName });
    throw error;
  }
};

module.exports = {
  initializeAutomationJobs,
  stopAllJobs,
  triggerJob,
  processCommunicationQueue,
  updateInterviewerMetrics,
  checkProbationPeriods,
  sendWorkflowReminders,
  cleanupOldCommunications
};
