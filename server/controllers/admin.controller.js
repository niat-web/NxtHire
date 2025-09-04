// server/controllers/admin.controller.js
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose'); // Import mongoose for transactions
const { startOfWeek, endOfWeek, startOfDay, endOfDay, startOfMonth, endOfMonth } = require('date-fns');
const Applicant = require('../models/Applicant');
const SkillAssessment = require('../models/SkillAssessment');
const Interviewer = require('../models/Interviewer');
const User = require('../models/User');
const Guidelines = require('../models/Guidelines');
const InterviewBooking = require("../models/InterviewBooking");
const MainSheetEntry = require('../models/MainSheetEntry');
const PublicBooking = require('../models/PublicBooking');
const StudentBooking = require('../models/StudentBooking');
const Domain = require('../models/Domain');
const EvaluationSheet = require('../models/EvaluationSheet');
const Counter = require('../models/Counter');
const PaymentConfirmation = require('../models/PaymentConfirmation');
const jwt = require('jsonwebtoken');
const PayoutSheet = require('../models/PayoutSheet');
const CustomEmailTemplate = require('../models/CustomEmailTemplate');
const { APPLICATION_STATUS, INTERVIEWER_STATUS, EMAIL_TEMPLATES, DOMAINS } = require("../config/constants");
const { sendEmail, sendAccountCreationEmail, sendNewInterviewerWelcomeEmail, sendStudentBookingInvitationEmail } = require('../services/email.service');
const { sendNotificationToInterviewer } = require('../services/push.service');
const { sendWelcomeWhatsApp } = require('../services/whatsapp.service');
const { logEvent } = require('../middleware/logger.middleware');
const crypto = require('crypto');
const { registerUser } = require('../services/auth.service');
const excel = require('exceljs');
const { createCalendarEvent, fetchRecentCalendarEvents } = require('../services/google.service');
const { formatDate } = require('../../client/src/utils/formatters');

// Helper to get the next sequence number for Interview ID
async function getNextSequenceValue(sequenceName) {
    const sequenceDocument = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );
    return sequenceDocument.sequence_value;
}


// --- ADDITIONS START: Bulk Upload Feature ---

// @desc    Bulk upload Main Sheet entries from CSV/XLSX
// @route   POST /api/admin/main-sheet/bulk-upload
// @access  Private/Admin
const bulkUploadMainSheetEntries = asyncHandler(async (req, res) => {
    const entries = req.body;
    const { _id: adminId } = req.user;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
        res.status(400);
        throw new Error('No entries provided for upload.');
    }

    const allInterviewers = await Interviewer.find().populate('user', 'firstName lastName');
    const interviewerNameMap = new Map();
    allInterviewers.forEach(interviewer => {
        if (interviewer.user && interviewer.user.firstName) {
            const firstName = (interviewer.user.firstName || '').toLowerCase().trim();
            const lastName = (interviewer.user.lastName || '').toLowerCase().trim();
            const fullName = `${firstName} ${lastName}`.trim();
            if (fullName) {
                interviewerNameMap.set(fullName, interviewer._id);
            }
        }
    });

    const findInterviewerId = (name) => {
        if (!name) return null;
        const normalizedName = String(name).toLowerCase().trim();
        if (interviewerNameMap.has(normalizedName)) {
            return interviewerNameMap.get(normalizedName);
        }
        for (const [key, value] of interviewerNameMap.entries()) {
            if (key.includes(normalizedName) || normalizedName.includes(key)) {
                return value;
            }
        }
        return null;
    };

    const results = { created: 0, errors: [] };
    const bulkOps = [];

    for (const [index, entry] of entries.entries()) {
        const {
            candidateName,
            mailId,
            interviewDate, // <-- Destructure the date field
            interviewerName,
            'Interviewer Name': interviewerNameAlt1,
            Interviewer: interviewerNameAlt2,
            ...rest
        } = entry;

        if (!candidateName || !mailId) {
            results.errors.push({ row: index + 2, message: 'Missing required fields: candidateName or mailId' });
            continue; // Skip this entry
        }

        const providedInterviewerName = interviewerName || interviewerNameAlt1 || interviewerNameAlt2;
        const interviewerId = findInterviewerId(providedInterviewerName);

        // --- NEW DATE PARSING LOGIC START ---
        let parsedDate = null;
        if (interviewDate) {
            // XLSX can pass dates as strings or Excel's serial numbers
            let dateValue = new Date(interviewDate);
            if (typeof interviewDate === 'number' && interviewDate > 25569) {
                // Handle Excel date serial numbers (epoch starts on a different day)
                dateValue = new Date(Math.round((interviewDate - 25569) * 86400 * 1000));
            }
            
            // Final check to ensure it's a valid date and not the 1970 epoch
            if (!isNaN(dateValue.getTime()) && dateValue.getFullYear() > 1970) {
                 parsedDate = dateValue;
            }
        }
        // --- NEW DATE PARSING LOGIC END ---
        
        if (providedInterviewerName && !interviewerId) {
             results.errors.push({ row: index + 2, message: `Interviewer '${providedInterviewerName}' not found.` });
        }

        bulkOps.push({
            insertOne: {
                document: {
                    ...rest,
                    candidateName,
                    mailId,
                    interviewDate: parsedDate, // <-- Use the parsed date
                    interviewer: interviewerId,
                    createdBy: adminId,
                    updatedBy: adminId,
                }
            }
        });
    }

    if (bulkOps.length > 0) {
        const result = await MainSheetEntry.bulkWrite(bulkOps, { ordered: false });
        results.created = result.insertedCount;
    }

    logEvent('main_sheet_bulk_uploaded', { ...results, adminId });

    if (results.errors.length > 0) {
        return res.status(207).json({
            success: true,
            message: `Processed with some issues. Created: ${results.created}. See errors for details.`,
            data: results
        });
    }

    res.status(201).json({ success: true, message: `${results.created} entries created successfully.`, data: results });
});

// @desc    Bulk upload Interviewers from CSV/XLSX
// @route   POST /api/admin/interviewers/bulk-upload
// @access  Private/Admin
const bulkUploadInterviewers = asyncHandler(async (req, res) => {
    const interviewersData = req.body;
    const { _id: adminId } = req.user;

    if (!interviewersData || !Array.isArray(interviewersData) || interviewersData.length === 0) {
        res.status(400);
        throw new Error('No interviewer data provided for upload.');
    }

    // --- NEW VALIDATION LOGIC ---
    const validEntries = [];
    const failedEntries = [];

    // Pre-fetch existing emails for efficient checking
    const existingEmails = new Set((await User.find({}, 'email')).map(u => u.email));
    // Keep track of emails in the current CSV to detect duplicates within the file
    const emailsInCsv = new Set();

    for (const [index, data] of interviewersData.entries()) {
        const rowNumber = index + 2; // CSVs are usually 1-indexed with a header row
        const errors = [];
        const email = (data.email || '').trim().toLowerCase();

        // 1. Check for required fields
        if (!email) errors.push({ field: 'email', message: 'Email is required but missing.' });
        if (!data.firstName) errors.push({ field: 'firstName', message: 'firstName is required but missing.' });
        if (!data.phoneNumber) errors.push({ field: 'phoneNumber', message: 'phoneNumber is required but missing.' });
        if (!data.domains) errors.push({ field: 'domains', message: 'domains column is required but missing.' });
        if (!data.temporaryPassword) errors.push({ field: 'temporaryPassword', message: 'temporaryPassword is required but missing.' });

        // 2. Check email format and uniqueness
        if (email) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.push({ field: 'email', message: `Invalid email format: "${data.email}"` });
            }
            if (existingEmails.has(email)) {
                errors.push({ field: 'email', message: 'Email already exists in the database.' });
            }
            if (emailsInCsv.has(email)) {
                errors.push({ field: 'email', message: 'Email is duplicated within this import file.' });
            }
        }
        emailsInCsv.add(email);
        
        // 3. Check LinkedIn URL format
        if (data.linkedinProfileUrl && !data.linkedinProfileUrl.startsWith('http')) {
            errors.push({ field: 'linkedinProfileUrl', message: 'URL must start with http:// or https://' });
        }
        
        // 4. Validate and parse domains
        const validDomains = DOMAINS;
        let processedDomains = [];
        if (typeof data.domains === 'string') {
            processedDomains = data.domains.split(',').map(d => d.trim().toUpperCase()).filter(Boolean);
            const invalidDomains = processedDomains.filter(d => !validDomains.includes(d));
            if (invalidDomains.length > 0) {
                errors.push({ field: 'domains', message: `Contains invalid domains: ${invalidDomains.join(', ')}.` });
            }
        } else {
             errors.push({ field: 'domains', message: 'Domains field must be a comma-separated string.' });
        }

        if (errors.length > 0) {
            failedEntries.push({ rowNumber, data, errors });
        } else {
            validEntries.push({ ...data, domains: processedDomains });
        }
    }
    // --- END NEW VALIDATION LOGIC ---

    // Now, process only the valid entries
    const results = { created: 0, errors: [] };

    for (const data of validEntries) {
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const { email, firstName, lastName, phoneNumber, temporaryPassword, domains } = data;
                
                // Applicant and User creation remains the same
                const applicant = await Applicant.create([{
                    fullName: `${firstName} ${lastName || ''}`.trim(), email, phoneNumber,
                    linkedinProfileUrl: data.linkedinProfileUrl || 'N/A (Bulk Import)', 
                    sourcingChannel: 'Other', status: APPLICATION_STATUS.ONBOARDED,
                }], { session });

                const newUser = await User.create([{
                    email, password: temporaryPassword, firstName, lastName: lastName || '',
                    phoneNumber, whatsappNumber: data.whatsappNumber || phoneNumber,
                    role: 'interviewer'
                }], { session });

                // Interviewer payload construction remains similar
                const interviewerPayload = {
                    ...data,
                    user: newUser[0]._id,
                    applicant: applicant[0]._id,
                    domains: domains,
                    primaryDomain: domains[0] || 'Other',
                    payoutId: data.payoutId || data['Payout Ids'], 
                    bankDetails: {
                        accountName: data['bankDetails.accountName'],
                        accountNumber: data['bankDetails.accountNumber'],
                        bankName: data['bankDetails.bankName'],
                        ifscCode: data['bankDetails.ifscCode'],
                    }
                };
                
                await Interviewer.create([interviewerPayload], { session });
                results.created++;
            });
        } catch (error) {
            // Even with validation, a transaction could fail (e.g., db connection drop)
            // We add this back to the failed list for the log.
            failedEntries.push({ 
                rowNumber: 'N/A', 
                data: data, 
                errors: [{ field: 'Database', message: `Transaction failed: ${error.message}` }]
            });
        } finally {
            session.endSession();
        }
    }
    
    logEvent('interviewers_bulk_uploaded_v2', {
        created: results.created,
        failed: failedEntries.length,
        adminId: req.user._id,
    });
    
    // Sort failed entries by row number for a clean log file
    failedEntries.sort((a, b) => a.rowNumber - b.rowNumber);

    res.status(207).json({ // 207 Multi-Status is perfect for partial success
        success: true, 
        message: `Process completed. Created: ${results.created}, Failed: ${failedEntries.length}.`,
        data: {
            created: results.created,
            skipped: 0, // We are no longer just "skipping", we are reporting failure.
            failedEntries: failedEntries
        }
    });
});
// --- ADDITIONS END ---

// --- MODIFICATION START ---
// @desc    Send a welcome/account creation email manually
// @route   POST /api/admin/interviewers/:id/send-welcome-email
// @access  Private/Admin
const sendWelcomeEmail = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findById(req.params.id).populate('user');

    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer not found.');
    }

    if (interviewer.welcomeEmailSentAt) {
        res.status(400);
        throw new Error('A welcome email has already been sent to this interviewer.');
    }
    
    const user = interviewer.user;
    if (!user) {
        res.status(404);
        throw new Error('Associated user account not found.');
    }
    
    const applicant = await Applicant.findById(interviewer.applicant);
    if (!applicant) {
         // This is an edge case, but good to handle
         res.status(404);
         throw new Error('Associated applicant record not found.');
    }

    // Generate a secure one-time-use token for password creation
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();
    
    // Send the account creation email with the setup link
    await sendAccountCreationEmail(user, resetToken, applicant);

    // Mark the email as sent
    interviewer.welcomeEmailSentAt = new Date();
    await interviewer.save();
    
    logEvent('welcome_email_sent_manually', { interviewerId: interviewer._id, adminId: req.user._id });
    
    res.json({ success: true, message: 'Welcome email sent successfully.' });
});
// --- MODIFICATION END ---

// --- Custom Email Feature Controllers ---
// @desc    Create a custom email template
// @route   POST /api/admin/custom-email-templates
// @access  Private/Admin
const createCustomEmailTemplate = asyncHandler(async (req, res) => {
    const { name, subject, body } = req.body;
    if (!name || !subject || !body) {
        res.status(400);
        throw new Error('Template name, subject, and body are required.');
    }

    const templateExists = await CustomEmailTemplate.findOne({ name });
    if (templateExists) {
        res.status(400);
        throw new Error('A template with this name already exists.');
    }

    const template = await CustomEmailTemplate.create({
        name,
        subject,
        body,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });
    
    logEvent('custom_template_created', { templateId: template._id, name, adminId: req.user._id });
    res.status(201).json({ success: true, data: template });
});

// @desc    Get all custom email templates
// @route   GET /api/admin/custom-email-templates
// @access  Private/Admin
const getCustomEmailTemplates = asyncHandler(async (req, res) => {
    const templates = await CustomEmailTemplate.find().sort({ name: 1 });
    res.json({ success: true, data: templates });
});

// @desc    Get a single custom email template
// @route   GET /api/admin/custom-email-templates/:id
// @access  Private/Admin
const getCustomEmailTemplateById = asyncHandler(async (req, res) => {
    const template = await CustomEmailTemplate.findById(req.params.id);
    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }
    res.json({ success: true, data: template });
});

// @desc    Update a custom email template
// @route   PUT /api/admin/custom-email-templates/:id
// @access  Private/Admin
const updateCustomEmailTemplate = asyncHandler(async (req, res) => {
    const { name, subject, body } = req.body;
    const template = await CustomEmailTemplate.findById(req.params.id);

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }
    
    // Check if new name conflicts with an existing one
    if (name && name !== template.name) {
        const templateExists = await CustomEmailTemplate.findOne({ name });
        if (templateExists) {
            res.status(400);
            throw new Error('A template with this name already exists.');
        }
    }

    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.body = body || template.body;
    template.updatedBy = req.user._id;

    const updatedTemplate = await template.save();
    logEvent('custom_template_updated', { templateId: updatedTemplate._id, name, adminId: req.user._id });
    res.json({ success: true, data: updatedTemplate });
});

// @desc    Delete a custom email template
// @route   DELETE /api/admin/custom-email-templates/:id
// @access  Private/Admin
const deleteCustomEmailTemplate = asyncHandler(async (req, res) => {
    const template = await CustomEmailTemplate.findById(req.params.id);
    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }
    await template.deleteOne();
    logEvent('custom_template_deleted', { templateId: req.params.id, adminId: req.user._id });
    res.json({ success: true, message: 'Template deleted successfully' });
});

// @desc    Send bulk custom emails from a template and CSV data
// @route   POST /api/admin/custom-email/send
// @access  Private/Admin
const sendBulkCustomEmail = asyncHandler(async (req, res) => {
    const { templateId, recipients } = req.body;

    if (!templateId || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
        res.status(400);
        throw new Error('Template ID and a list of recipients are required.');
    }
    
    const template = await CustomEmailTemplate.findById(templateId);
    if (!template) {
        res.status(404);
        throw new Error('Email template not found.');
    }
    
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const recipientData of recipients) {
        const recipientEmail = recipientData.Email || recipientData.email; // Handle case variations

        if (!recipientEmail) {
            emailsFailed++;
            continue;
        }

        try {
            // Replace placeholders in subject and body
            let finalSubject = template.subject;
            let finalBody = template.body;

            for (const key in recipientData) {
                const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
                finalSubject = finalSubject.replace(placeholder, recipientData[key] || '');
                finalBody = finalBody.replace(placeholder, recipientData[key] || '');
            }
            
            await sendEmail({
                recipient: null, // No specific model for custom lists
                recipientModel: 'Custom',
                recipientEmail: recipientEmail,
                templateName: null, // We provide the HTML body directly
                subject: finalSubject,
                templateData: {}, // Not needed as we pre-render
                htmlBody: finalBody, // Pass pre-rendered HTML
                relatedTo: `Custom Bulk Send - ${template.name}`,
                sentBy: req.user._id,
                isAutomated: false
            });

            emailsSent++;

        } catch (error) {
            emailsFailed++;
            console.error(`Failed to send email to ${recipientEmail}:`, error);
        }
    }
    
    logEvent('custom_bulk_email_sent', {
        templateId: template._id,
        sent: emailsSent,
        failed: emailsFailed,
        total: recipients.length,
        adminId: req.user._id,
    });
    
    res.json({
        success: true,
        message: `Email sending process completed. Sent: ${emailsSent}, Failed: ${emailsFailed}.`
    });
});

const createInterviewBooking = asyncHandler(async (req, res) => {
    const { bookingDate, interviewerIds } = req.body;
    if (!bookingDate || !interviewerIds || interviewerIds.length === 0) {
        res.status(400);
        throw new Error('Booking date and at least one interviewer are required.');
    }
    const booking = await InterviewBooking.create({
        bookingDate,
        interviewers: interviewerIds.map(id => ({ interviewer: id, status: 'Pending' })),
        createdBy: req.user._id,
    });

    const interviewersToNotify = await Interviewer.find({ _id: { $in: interviewerIds } }).populate("user", "email firstName");

    const formattedDate = new Date(bookingDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    for (const interviewer of interviewersToNotify) {
        if (interviewer.user && interviewer.user.email) {
            // Send Email
            await sendEmail({
                recipient: interviewer._id,
                recipientModel: 'Interviewer',
                recipientEmail: interviewer.user.email,
                templateName: EMAIL_TEMPLATES.BOOKING_REQUEST_NOTIFICATION,
                subject: 'New Interview Availability Request from NxtWave',
                templateData: {
                    name: interviewer.user.firstName,
                    date: formattedDate,
                    portalLink: `${process.env.CLIENT_URL}/interviewer/availability`,
                },
                relatedTo: "Interviewer Booking",
                sentBy: req.user._id,
                isAutomated: true,
            });

            // Send Push Notification
            await sendNotificationToInterviewer(interviewer._id, {
                title: 'New Interview Request',
                body: `You have a new availability request for ${formattedDate}.`,
                icon: `${process.env.CLIENT_URL}/logo.svg`, 
                data: {
                    url: '/interviewer/availability'
                }
            });
        }
    }

    logEvent('interview_booking_created', { bookingId: booking._id, adminId: req.user._id, notifiedCount: interviewersToNotify.length });
    res.status(201).json({ success: true, data: booking });
});

const refreshRecordingLinks = asyncHandler(async (req, res) => {
    const googleEvents = await fetchRecentCalendarEvents();
    if (!googleEvents || googleEvents.length === 0) {
        return res.json({ success: true, message: "No recent calendar events found to sync." });
    }

    const recordingsMap = new Map();
    for (const event of googleEvents) {
        if (event.hangoutLink && Array.isArray(event.attachments)) {
            const recording = event.attachments.find(
                att => att.mimeType && att.mimeType.startsWith('video/')
            );
            
            if (recording && recording.fileUrl) {
                recordingsMap.set(event.hangoutLink, recording.fileUrl);
            }
        }
    }
    
    if (recordingsMap.size === 0) {
        return res.json({ success: true, message: "Found calendar events, but no new recordings were identified." });
    }

    const entriesToUpdate = await MainSheetEntry.find({
        meetingLink: { $in: [...recordingsMap.keys()] },
        $or: [
            { recordingLink: { $exists: false } },
            { recordingLink: '' }
        ]
    });

    if (entriesToUpdate.length === 0) {
        return res.json({ success: true, message: "All existing recording links are already up to date." });
    }

    const bulkOps = entriesToUpdate.map(entry => {
        const recordingLink = recordingsMap.get(entry.meetingLink);
        if (recordingLink) {
            return {
                updateOne: {
                    filter: { _id: entry._id },
                    update: { $set: { recordingLink: recordingLink, updatedBy: req.user._id } }
                }
            };
        }
        return null;
    }).filter(Boolean);

    let updatedCount = 0;
    if (bulkOps.length > 0) {
        const result = await MainSheetEntry.bulkWrite(bulkOps);
        updatedCount = result.modifiedCount;
        logEvent('recording_links_refreshed', { count: updatedCount, adminId: req.user._id });
    }

    res.json({ success: true, message: `${updatedCount} recording link(s) updated successfully.` });
});

const getEvaluationDataForAdmin = asyncHandler(async (req, res) => {
    // --- MODIFICATION START: Accept new filter parameters ---
    const { domain, search, interviewStatus, interviewDate } = req.query;
    // --- MODIFICATION END ---
    if (!domain) {
        return res.json({ success: true, data: { evaluationSheet: null, interviews: [] } });
    }

    const domainDoc = await Domain.findOne({ name: domain });
    if (!domainDoc) {
        res.status(404);
        throw new Error('Domain not found.');
    }

    const evaluationSheet = await EvaluationSheet.findOne({ domain: domainDoc._id });
    
    const query = { techStack: domain };
    
    // --- MODIFICATION START: Add all filters to the query ---
    if (interviewStatus) {
        query.interviewStatus = interviewStatus;
    }
    if (interviewDate) {
        const date = new Date(interviewDate);
        if (!isNaN(date)) {
            query.interviewDate = {
                $gte: startOfDay(date),
                $lte: endOfDay(date)
            };
        }
    }
    // --- MODIFICATION END ---
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
            { candidateName: searchRegex },
            { mailId: searchRegex },
            { uid: searchRegex },
            { interviewId: searchRegex },
        ];
    }
    
    const interviews = await MainSheetEntry.find(query)
        .sort({ interviewDate: -1 })
        .limit(1000); 

    res.json({ success: true, data: { evaluationSheet, interviews } });
});

const getDashboardStats = asyncHandler(async (req, res) => {
    const { period = 'all_time' } = req.query;

    let startDate;
    const now = new Date();
    switch (period) {
        case 'daily': startDate = new Date(now.setHours(0, 0, 0, 0)); break;
        case 'weekly': startDate = new Date(); startDate.setDate(now.getDate() - 7); break;
        case 'monthly': startDate = new Date(); startDate.setMonth(now.getMonth() - 1); break;
        default: startDate = null;
    }

    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

    const [ 
        totalApplicants, 
        pendingReviews, 
        activeInterviewers, 
        platformEarningsData,
        pendingLinkedInReviews,
        pendingSkillsReview,
        pendingGuidelinesReview,
        probationInterviewers
    ] = await Promise.all([
        Applicant.countDocuments(dateFilter),
        Applicant.countDocuments({ status: { $in: [APPLICATION_STATUS.SUBMITTED, APPLICATION_STATUS.UNDER_REVIEW, APPLICATION_STATUS.SKILLS_ASSESSMENT_COMPLETED, APPLICATION_STATUS.GUIDELINES_REVIEWED] } }),
        Interviewer.countDocuments({ status: INTERVIEWER_STATUS.ACTIVE }),
        MainSheetEntry.aggregate([
          { $match: { interviewStatus: 'Completed', interviewer: { $exists: true, $ne: null } } },
          {
              $lookup: {
                  from: 'interviewers',
                  localField: 'interviewer',
                  foreignField: '_id',
                  as: 'interviewerInfo'
              }
          },
          { $unwind: '$interviewerInfo' },
          {
              $addFields: {
                  cleanedAmountStr: {
                      $replaceAll: {
                          input: { $ifNull: ["$interviewerInfo.paymentAmount", "0"] },
                          find: "₹",
                          replacement: ""
                      }
                  }
              }
          },
          {
              $project: {
                  numericAmount: { $convert: { input: "$cleanedAmountStr", to: "int", onError: 0, onNull: 0 } }
              }
          },
          {
              $group: {
                  _id: null,
                  total: { $sum: "$numericAmount" }
              }
          }
        ]),
        Applicant.countDocuments({ status: APPLICATION_STATUS.SUBMITTED }),
        SkillAssessment.countDocuments({ status: 'Pending' }),
        Applicant.countDocuments({ status: APPLICATION_STATUS.GUIDELINES_REVIEWED }),
        Interviewer.countDocuments({ status: INTERVIEWER_STATUS.PROBATION })
    ]);

    const totalPlatformEarnings = platformEarningsData[0]?.total || 0;

    res.json({
        success: true,
        data: { 
            totalApplicants, 
            pendingReviews, 
            activeInterviewers, 
            totalPlatformEarnings,
            pendingLinkedInReviews,
            pendingSkillsReview,
            pendingGuidelinesReview,
            probationInterviewers
        }
    });
});

const generateAndGetPayoutSheet = asyncHandler(async (req, res) => {
    const { search, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Start and end dates are required for the payout period.' });
    }

    const monthYear = new Date(startDate).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const matchStage = {
        interviewStatus: 'Completed',
        interviewer: { $exists: true, $ne: null },
        interviewDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    const earningsPipeline = [
        { $match: matchStage },
        { $lookup: { from: 'interviewers', localField: 'interviewer', foreignField: '_id', as: 'interviewerInfo' }},
        { $unwind: '$interviewerInfo' },
        { $addFields: { paymentAmountNum: { $toInt: { $replaceAll: { input: { $ifNull: ["$interviewerInfo.paymentAmount", "0"] }, find: "₹", replacement: "" }}}}},
        { $group: { _id: '$interviewerInfo._id', totalAmount: { $sum: '$paymentAmountNum' }}}
    ];

    const earningsData = await MainSheetEntry.aggregate(earningsPipeline);

    const bulkOps = earningsData.map(data => ({
        updateOne: {
            filter: { interviewer: data._id, monthYear: monthYear },
            update: {
                $set: {
                    points: data.totalAmount,
                    activityDatetime: new Date(),
                    pointsVestingDatetime: new Date(),
                },
                $setOnInsert: {
                    interviewer: data._id,
                    monthYear: monthYear
                }
            },
            upsert: true
        }
    }));
    if (bulkOps.length > 0) await PayoutSheet.bulkWrite(bulkOps);
    
    const payoutQuery = { monthYear: monthYear };
    const payoutPipeline = [
        { $match: payoutQuery },
        { $lookup: { from: 'interviewers', localField: 'interviewer', foreignField: '_id', as: 'interviewerInfo' }},
        { $unwind: '$interviewerInfo' }
    ];

    if (search) {
        payoutPipeline.push({
            $match: { 'interviewerInfo.interviewerId': { $regex: search, $options: 'i' } }
        });
    }

    payoutPipeline.push({
        $project: {
            _id: 1,
            interviewer: { _id: '$interviewerInfo._id', interviewerId: '$interviewerInfo.interviewerId' },
            associationName: 1,
            activityName: 1,
            activityReferenceId: 1,
            activityDatetime: 1,
            points: 1,
            pointsVestingDatetime: 1
        }
    });

    const payoutSheet = await PayoutSheet.aggregate(payoutPipeline);

    res.json({ success: true, data: { payoutSheet, month: monthYear } });
});

const getPaymentRequests = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const matchStage = { interviewStatus: 'Completed' };
    if (startDate && endDate) {
        matchStage.interviewDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const pipeline = [
        { $match: matchStage },
        { $lookup: { from: 'interviewers', localField: 'interviewer', foreignField: '_id', as: 'interviewerInfo' }},
        { $unwind: '$interviewerInfo' },
        { $lookup: { from: 'users', localField: 'interviewerInfo.user', foreignField: '_id', as: 'userInfo' }},
        { $unwind: '$userInfo' },
        { $addFields: { paymentAmountNum: { $toInt: { $replaceAll: { input: { $ifNull: ["$interviewerInfo.paymentAmount", "0"] }, find: "₹", replacement: "" }}}}},
        { $group: {
            _id: '$interviewerInfo._id',
            fullName: { $first: { $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"] }},
            email: { $first: '$userInfo.email'},
            interviewerId: { $first: '$interviewerInfo.interviewerId' },
            mobileNumber: { $first: '$userInfo.phoneNumber' },
            paymentAmount: { $first: '$interviewerInfo.paymentAmount' },
            companyType: { $first: '$interviewerInfo.companyType' },
            interviewsCompleted: { $sum: 1 },
            totalAmount: { $sum: '$paymentAmountNum' }
        }},
        {
            $lookup: {
                from: 'paymentconfirmations',
                let: {
                    interviewerId: '$_id',
                    periodStart: new Date(startDate), 
                    periodEnd: new Date(endDate)
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$interviewer", "$$interviewerId"] },
                                    { $eq: ["$startDate", "$$periodStart"] },
                                    { $eq: ["$endDate", "$$periodEnd"] }
                                ]
                            }
                        }
                    },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 }
                ],
                as: 'confirmation'
            }
        },
        { $unwind: { path: '$confirmation', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1, fullName: 1, email: 1, interviewerId: 1, mobileNumber: 1,
                paymentAmount: 1, companyType: 1, interviewsCompleted: 1, totalAmount: 1,
                emailSentStatus: { $cond: { if: { $ifNull: ["$confirmation._id", false] }, then: "Sent", else: "Not Sent" }},
                confirmationStatus: { $cond: { if: { $in: ["$confirmation.status", ["Confirmed", "Disputed"]] }, then: "$confirmation.status", else: "Pending" }},
                confirmationRemarks: { $ifNull: ["$confirmation.remarks", ""] },
                invoiceEmailSentStatus: { $ifNull: ["$confirmation.invoiceEmailSentStatus", "Not Sent"] },
                paymentReceivedStatus: { $ifNull: ["$confirmation.paymentReceivedStatus", "Pending"] },
                paymentReceivedRemarks: { $ifNull: ["$confirmation.paymentReceivedRemarks", ""] },
                paymentReceivedEmailSentAt: { $ifNull: ["$confirmation.paymentReceivedEmailSentAt", null] },
            }
        },
        { $sort: { totalAmount: -1 } }
    ];

    const results = await MainSheetEntry.aggregate(pipeline);
    res.json({ success: true, data: results });
});

const sendPaymentEmail = asyncHandler(async (req, res) => {
    const { interviewerId, email, name, monthYear, payPerInterview, interviewCount, totalAmount, startDate, endDate } = req.body;
    const existingConfirmation = await PaymentConfirmation.findOne({ interviewer: interviewerId, startDate: new Date(startDate), endDate: new Date(endDate), });

    if (existingConfirmation && existingConfirmation.status !== 'Email Sent') {
        res.status(400);
        throw new Error(`A confirmation for this period has already been ${existingConfirmation.status.toLowerCase()}.`);
    }

    const confirmation = existingConfirmation || new PaymentConfirmation({ interviewer: interviewerId, startDate: new Date(startDate), endDate: new Date(endDate), monthYear, totalAmount, interviewCount });
    confirmation.status = 'Email Sent';
    confirmation.tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = jwt.sign({ id: confirmation._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    confirmation.confirmationToken = token;
    
    await confirmation.save();
    const confirmationLink = `${process.env.CLIENT_URL}/payment-confirmation?token=${token}`;

    await sendEmail({
        recipient: interviewerId, recipientModel: 'Interviewer', recipientEmail: email,
        templateName: EMAIL_TEMPLATES.PAYMENT_CONFIRMATION, subject: `Interview Payment Confirmation – ${monthYear}`,
        templateData: { name, payPerInterview, interviewCount, totalAmount, startDate, endDate, confirmationLink },
        relatedTo: "Payment Request", sentBy: req.user._id, isAutomated: false
    });
    res.json({ success: true, message: `Email sent to ${name}`});
});

const sendInvoiceMail = asyncHandler(async (req, res) => {
    const { interviewerId, email, name, interviewCount, totalAmount, startDate, endDate } = req.body;
    const monthYear = new Date(startDate).toLocaleString('default', { month: 'long', year: 'numeric' });
    await PaymentConfirmation.findOneAndUpdate(
        { interviewer: interviewerId, startDate: new Date(startDate), endDate: new Date(endDate) },
        { $set: { invoiceEmailSentStatus: 'Sent', invoiceEmailSentAt: new Date() }},
        { upsert: true, new: true }
    );
    await sendEmail({
        recipient: interviewerId, recipientModel: 'Interviewer', recipientEmail: email, templateName: 'invoiceMail', subject: `Your NxtWave Interview Payment for ${monthYear}`,
        templateData: { name, interviewCount, totalAmount, startDate: formatDate(startDate), endDate: formatDate(endDate), redeemLink: "https://nxtrewards.ccbp.in/" },
        relatedTo: "Payment Invoice", sentBy: req.user._id, isAutomated: false
    });
    res.json({ success: true, message: `Invoice email sent to ${name}`});
});

const sendPaymentReceivedEmail = asyncHandler(async (req, res) => {
    const { interviewerId, email, name, startDate, endDate, totalAmount, interviewCount } = req.body;
    const monthYear = new Date(startDate).toLocaleString('default', { month: 'long', year: 'numeric' });
    let confirmation = await PaymentConfirmation.findOne({ interviewer: interviewerId, startDate: new Date(startDate), endDate: new Date(endDate) });

    if (!confirmation) {
        confirmation = new PaymentConfirmation({ interviewer: interviewerId, startDate: new Date(startDate), endDate: new Date(endDate), monthYear, totalAmount, interviewCount, });
    }
    const token = jwt.sign({ id: confirmation._id, purpose: 'payment_received' }, process.env.JWT_SECRET, { expiresIn: '14d' });
    confirmation.paymentReceivedConfirmationToken = token;
    confirmation.paymentReceivedTokenExpires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    confirmation.paymentReceivedEmailSentAt = new Date();
    await confirmation.save();
    const confirmationLink = `${process.env.CLIENT_URL}/confirm-payment-received?token=${token}`;
    await sendEmail({
        recipient: interviewerId, recipientModel: 'Interviewer', recipientEmail: email, templateName: 'paymentReceivedConfirmation', subject: `Action Required: Confirm Payment for ${monthYear}`,
        templateData: { name, monthYear, confirmationLink }, relatedTo: 'Payment Received Confirmation', sentBy: req.user._id,
    });
    res.json({ success: true, message: `Confirmation email sent to ${name}.` });
});

// --- (keep the rest of the file from getApplicants to the end of the module.exports) ---

const getApplicants = asyncHandler(async (req, res) => {
    const { status, domain, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    if (status) { if (status.includes(',')) { query.status = { $in: status.split(',').map(s => s.trim()) }; } else { query.status = status; } }
    if (search) { query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]; }
    if (domain) { const assessments = await SkillAssessment.find({ domains: domain }).select('applicant'); const applicantIds = assessments.map(sa => sa.applicant); query._id = { $in: applicantIds }; }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const totalDocs = await Applicant.countDocuments(query);
    const applicants = await Applicant.find(query).sort(sort).skip(skip).limit(parseInt(limit));
    const applicantDomains = {};
    if (applicants.length > 0) {
        const skills = await SkillAssessment.find({ applicant: { $in: applicants.map(a => a._id) } }).select('applicant domains');
        skills.forEach(skill => { applicantDomains[skill.applicant.toString()] = skill.domains || []; });
    }
    res.json({ success: true, data: { applicants: applicants.map(applicant => ({ ...applicant.toObject(), domain: applicantDomains[applicant._id.toString()]?.[0] || null, domains: applicantDomains[applicant._id.toString()] || [] })), page: parseInt(page), limit: parseInt(limit), totalDocs, totalPages: Math.ceil(totalDocs / parseInt(limit)) } });
});

const createApplicant = asyncHandler(async (req, res) => {
    const { fullName, email, phoneNumber, whatsappNumber, linkedinProfileUrl, interestedInJoining, sourcingChannel, status } = req.body;
    const existingApplicant = await Applicant.findOne({ email });
    if (existingApplicant) { res.status(400); throw new Error('An application with this email already exists'); }
    const applicant = await Applicant.create({ fullName, email, phoneNumber, whatsappNumber, linkedinProfileUrl, interestedInJoining, sourcingChannel, status: status || APPLICATION_STATUS.SUBMITTED });
    logEvent('applicant_created_by_admin', { applicantId: applicant._id, adminId: req.user._id });
    res.status(201).json({ success: true, data: applicant });
});

const updateApplicant = asyncHandler(async (req, res) => {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) { res.status(404); throw new Error('Applicant not found'); }
    const { fullName, email, phoneNumber, whatsappNumber, linkedinProfileUrl, interestedInJoining, sourcingChannel, status } = req.body;
    if (email && email !== applicant.email) {
        const existingApplicant = await Applicant.findOne({ email });
        if (existingApplicant) { res.status(400); throw new Error('An application with this email already exists'); }
        applicant.email = email;
    }
    applicant.fullName = fullName || applicant.fullName;
    applicant.phoneNumber = phoneNumber || applicant.phoneNumber;
    applicant.whatsappNumber = whatsappNumber || applicant.whatsappNumber;
    applicant.linkedinProfileUrl = linkedinProfileUrl || applicant.linkedinProfileUrl;
    if (interestedInJoining !== undefined) applicant.interestedInJoining = interestedInJoining;
    applicant.sourcingChannel = sourcingChannel || applicant.sourcingChannel;
    applicant.status = status || applicant.status;
    const updatedApplicant = await applicant.save();
    logEvent('applicant_updated', { applicantId: updatedApplicant._id, updatedBy: req.user._id });
    res.json({ success: true, data: updatedApplicant });
});

const deleteApplicant = asyncHandler(async (req, res) => {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) { res.status(404); throw new Error('Applicant not found'); }
    await applicant.deleteOne();
    logEvent('applicant_deleted', { applicantId: req.params.id, deletedBy: req.user._id });
    res.json({ success: true, message: 'Applicant deleted successfully' });
});

// @desc    Export Main Sheet entries to Excel
// @route   GET /api/admin/main-sheet/export
// @access  Private/Admin
const exportMainSheetEntries = asyncHandler(async (req, res) => {
    const { search, interviewStatus, interviewDate } = req.query;

    const query = {};
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
            { hiringName: searchRegex }, { techStack: searchRegex },
            { candidateName: searchRegex }, { mailId: searchRegex },
        ];
    }
    if (interviewStatus) query.interviewStatus = interviewStatus;
    if (interviewDate) {
        const date = new Date(interviewDate);
        if (!isNaN(date)) {
            query.interviewDate = { $gte: startOfDay(date), $lte: endOfDay(date) };
        }
    }

    const entries = await MainSheetEntry.find(query)
        .populate({
            path: 'interviewer',
            populate: { path: 'user', select: 'firstName lastName email' }
        })
        .sort({ interviewDate: -1 });

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Main Sheet');

    worksheet.columns = [
        { header: 'Hiring Name', key: 'hiringName', width: 20 },
        { header: 'Tech Stack', key: 'techStack', width: 20 },
        { header: 'Interview ID', key: 'interviewId', width: 20 },
        { header: 'UID', key: 'uid', width: 15 },
        { header: 'Candidate Name', key: 'candidateName', width: 30 },
        { header: 'Mobile Number', key: 'mobileNumber', width: 15 },
        { header: 'Mail ID', key: 'mailId', width: 30 },
        { header: 'Candidate Resume', key: 'candidateResume', width: 40 },
        { header: 'Meeting Link', key: 'meetingLink', width: 40 },
        { header: 'Recording Link', key: 'recordingLink', width: 40 },
        { header: 'Interview Date', key: 'interviewDate', width: 15 },
        { header: 'Interview Time', key: 'interviewTime', width: 15 },
        { header: 'Interview Duration', key: 'interviewDuration', width: 15 },
        { header: 'Interview Status', key: 'interviewStatus', width: 20 },
        { header: 'Remarks', key: 'remarks', width: 40 },
        { header: 'Interviewer Remarks', key: 'interviewerRemarks', width: 40 },
        { header: 'Interviewer', key: 'interviewerName', width: 30 },
        { header: 'Interviewer Mail', key: 'interviewerMail', width: 30 },
    ];
    
    worksheet.addRows(entries.map(entry => {
        return {
            ...entry.toObject(),
            interviewDate: entry.interviewDate ? new Date(entry.interviewDate).toISOString().split('T')[0] : '',
            interviewerName: entry.interviewer ? `${entry.interviewer.user.firstName} ${entry.interviewer.user.lastName}`.trim() : '',
            interviewerMail: entry.interviewer ? entry.interviewer.user.email : ''
        };
    }));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="MainSheet_${new Date().toISOString().slice(0,10)}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
});

const exportApplicants = asyncHandler(async (req, res) => {
    const { status, search } = req.query; const query = {};
    if (status) query.status = status; if (search) { query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]; }
    const applicants = await Applicant.find(query).sort({ createdAt: -1 });
    const workbook = new excel.Workbook(); const worksheet = workbook.addWorksheet('Applicants');
    worksheet.columns = [
        { header: 'Full Name', key: 'fullName', width: 30 }, { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone Number', key: 'phoneNumber', width: 20 }, { header: 'WhatsApp Number', key: 'whatsappNumber', width: 20 },
        { header: 'LinkedIn URL', key: 'linkedinProfileUrl', width: 40 }, { header: 'Interested', key: 'interestedInJoining', width: 15 },
        { header: 'Source', key: 'sourcingChannel', width: 15 }, { header: 'Status', key: 'status', width: 25 },
        { header: 'Applied On', key: 'createdAt', width: 20 },
    ];
    worksheet.addRows(applicants);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="applicants_${new Date().toISOString()}.xlsx"`);
    await workbook.xlsx.write(res); res.end();
});

const getInterviewers = asyncHandler(async (req, res) => {
    // --- MODIFICATION START ---
    const { search, status, domain, paymentTier, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Get the absolute total count before applying any filters
    const absoluteTotal = await Interviewer.countDocuments();
    // --- MODIFICATION END ---
    
    const query = {};

    if (status) {
        if (status.includes(',')) {
            query.status = { $in: status.split(',').map(s => s.trim()) };
        } else {
            query.status = status;
        }
    }
    
    if (paymentTier) query.paymentTier = paymentTier;
    if (domain) query.domains = domain;

    const pipeline = [];

    pipeline.push({
      $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' }
    });
    pipeline.push({ $unwind: '$userInfo' });

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { 'userInfo.firstName': searchRegex },
        { 'userInfo.lastName': searchRegex },
        { 'userInfo.email': searchRegex }
      ];
    }
    
    pipeline.push({ $match: query });
    
    // This count now represents the filtered total
    const countPipeline = [...pipeline, { $count: 'totalDocs' }];
    const totalResult = await Interviewer.aggregate(countPipeline);
    const totalDocs = totalResult[0]?.totalDocs || 0;
    
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    pipeline.push({ $sort: sort });
    
    pipeline.push({
      $project: {
          user: {
              _id: '$userInfo._id',
              firstName: '$userInfo.firstName',
              lastName: '$userInfo.lastName',
              email: '$userInfo.email',
              phoneNumber: '$userInfo.phoneNumber',
              whatsappNumber: '$userInfo.whatsappNumber'
          },
          _id: 1, 
          interviewerId: 1,
          payoutId: 1,
          status: 1, 
          domains: 1, 
          paymentTier: 1, 
          paymentAmount: 1,
          currentEmployer: 1,
          jobTitle: 1,
          yearsOfExperience: 1,
          companyType: 1,
          bankDetails: 1,
          welcomeEmailSentAt: 1,
          'metrics.interviewsCompleted': 1, 
          onboardingDate: 1, 
          createdAt: 1
      }
    });

    const interviewers = await Interviewer.aggregate(pipeline);

    // --- MODIFICATION START: Add 'absoluteTotal' to the response ---
    res.json({
        success: true,
        data: {
            interviewers,
            totalDocs, // This is the filtered count
            absoluteTotal // This is the total count of all interviewers
        }
    });
    // --- MODIFICATION END ---
});

const getInterviewerDetails = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findById(req.params.id).populate('user');
    if (!interviewer) { res.status(404); throw new Error('Interviewer not found'); }
    res.json({ success: true, data: interviewer });
});

const createInterviewer = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phoneNumber, whatsappNumber, ...interviewerData } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists.');
    }

    const applicant = await Applicant.create({
        fullName: lastName ? `${firstName} ${lastName}`.trim() : firstName,
        email,
        phoneNumber,
        whatsappNumber: whatsappNumber || phoneNumber,
        linkedinProfileUrl: 'https://linkedin.com/in/placeholder-admin-created',
        sourcingChannel: 'Other',
        status: APPLICATION_STATUS.ONBOARDED
    });

    const newUser = await User.create({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        whatsappNumber,
        role: 'interviewer'
    });
    
    const newInterviewer = await Interviewer.create({
        ...interviewerData,
        user: newUser._id,
        applicant: applicant._id,
    });
    
    logEvent('interviewer_created_by_admin', {
        interviewerId: newInterviewer._id,
        adminId: req.user._id
    });
    
    res.status(201).json({ success: true, data: newInterviewer });
});

const updateInterviewer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, ...interviewerData } = req.body;
    const interviewer = await Interviewer.findById(id).populate('user');
    if (!interviewer) { res.status(404); throw new Error('Interviewer not found'); }
    const user = interviewer.user;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) { res.status(400); throw new Error("Email is already in use."); }
        user.email = email;
    }
    await user.save();
    
    if (interviewerData.domains && interviewerData.domains.length > 0 && !interviewerData.primaryDomain) {
      interviewerData.primaryDomain = interviewerData.domains[0];
    }
    
    Object.assign(interviewer, interviewerData);
    const updatedInterviewer = await interviewer.save();
    res.json({ success: true, data: updatedInterviewer });
});

const deleteInterviewer = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findById(req.params.id);
    if (!interviewer) { res.status(404); throw new Error('Interviewer not found'); }
    await User.findByIdAndDelete(interviewer.user);
    await interviewer.deleteOne();
    res.json({ success: true, message: 'Interviewer and associated user deleted.' });
});

// --- ADDITION START: Bulk Delete Interviewers and their associated Users ---
const bulkDeleteInterviewers = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error('No interviewer IDs provided for deletion.');
    }

    // First, find the interviewers to get their associated user IDs
    const interviewersToDelete = await Interviewer.find({ _id: { $in: ids } }).select('user');
    if (!interviewersToDelete) {
        res.status(404);
        throw new Error('No interviewers found for the provided IDs.');
    }

    const userIdsToDelete = interviewersToDelete.map(i => i.user);

    // Perform deletions in parallel
    const [interviewerResult, userResult] = await Promise.all([
        Interviewer.deleteMany({ _id: { $in: ids } }),
        User.deleteMany({ _id: { $in: userIdsToDelete } })
    ]);

    logEvent('interviewers_bulk_deleted', {
        deletedCount: interviewerResult.deletedCount,
        associatedUsersDeleted: userResult.deletedCount,
        adminId: req.user._id
    });

    res.json({ success: true, message: `${interviewerResult.deletedCount} interviewer(s) and their user accounts deleted successfully.` });
});

const getApplicantDetails = asyncHandler(async (req, res) => {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) { res.status(404); throw new Error('Applicant not found'); }
    const skillAssessment = await SkillAssessment.findOne({ applicant: applicant._id });
    let interviewer = null;
    if (applicant.interviewer) {
        interviewer = await Interviewer.findById(applicant.interviewer).populate('user', 'email firstName lastName');
    }
    res.json({ success: true, data: { applicant, skillAssessment, interviewer } });
});

const updateApplicantStatus = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) { res.status(404); throw new Error('Applicant not found'); }
    applicant.status = status;
    if (notes) { applicant.reviewNotes = (applicant.reviewNotes || '') + `\n--- Status Update to '${status}' ---\n${notes}`; }
    await applicant.save();
    logEvent('applicant_status_updated', { applicantId: applicant._id, newStatus: status, updatedBy: req.user._id });
    res.json({ success: true, data: applicant, message: 'Applicant status updated successfully' });
});

const processLinkedInReview = asyncHandler(async (req, res) => {
    const { decision, notes, rejectionReason } = req.body;
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) { res.status(404); throw new Error('Applicant not found'); }
    if (applicant.status !== APPLICATION_STATUS.SUBMITTED && applicant.status !== APPLICATION_STATUS.UNDER_REVIEW) { res.status(400); throw new Error('Applicant is not at the LinkedIn review stage'); }
    if (decision === 'approve') {
        applicant.status = APPLICATION_STATUS.PROFILE_APPROVED;
        if (notes) applicant.reviewNotes = notes;
        await applicant.save();
        await sendEmail({ recipient: applicant._id, recipientModel: 'Applicant', recipientEmail: applicant.email, templateName: 'skillAssessmentInvitation', subject: 'Next Steps: Skills Details Form - NxtWave Interviewer Program', templateData: { name: applicant.fullName, skillAssessmentLink: `${process.env.CLIENT_URL}/skill-assessment/${applicant._id}` }, relatedTo: 'Skill Assessment', sentBy: req.user._id, isAutomated: false });
        applicant.status = APPLICATION_STATUS.SKILLS_ASSESSMENT_SENT;
        await applicant.save();
        logEvent('linkedin_review_approved', { applicantId: applicant._id, reviewedBy: req.user._id, email: applicant.email });
    } else if (decision === 'reject') {
        if (!rejectionReason) { res.status(400); throw new Error('Rejection reason is required'); }
        applicant.status = APPLICATION_STATUS.PROFILE_REJECTED;
        applicant.rejectionReason = rejectionReason;
        if (notes) applicant.reviewNotes = notes;
        await applicant.save();
        await sendEmail({ recipient: applicant._id, recipientModel: 'Applicant', recipientEmail: applicant.email, templateName: 'profileRejection', subject: 'Update on Your NxtWave Interviewer Application', templateData: { name: applicant.fullName, reason: rejectionReason }, relatedTo: 'LinkedIn Review', sentBy: req.user._id, isAutomated: false });
        logEvent('linkedin_review_rejected', { applicantId: applicant._id, reviewedBy: req.user._id, email: applicant.email, reason: rejectionReason });
    } else { res.status(400); throw new Error('Invalid decision'); }
    res.json({ success: true, data: { id: applicant._id, status: applicant.status, message: `Application ${decision === 'approve' ? 'approved' : 'rejected'} successfully` } });
});

const processSkillCategorization = asyncHandler(async (req, res) => {
    const { domains, notes } = req.body; 
    const skillAssessment = await SkillAssessment.findById(req.params.id);
    if (!skillAssessment) { 
        res.status(404); 
        throw new Error('Skill assessment not found'); 
    }
    skillAssessment.domains = domains; 
    skillAssessment.adminCategorized = true; 
    skillAssessment.categorizedBy = req.user._id; 
    skillAssessment.status = 'Reviewed';
    if (notes) skillAssessment.additionalNotes = notes;
    await skillAssessment.save();

    const applicant = await Applicant.findById(skillAssessment.applicant);
    if (!applicant) { 
        res.status(404); 
        throw new Error('Associated applicant not found'); 
    }

    applicant.status = APPLICATION_STATUS.GUIDELINES_SENT;
    await applicant.save();

    await sendEmail({
        recipient: applicant._id,
        recipientModel: 'Applicant',
        recipientEmail: applicant.email,
        templateName: 'guidelinesInvitation',
        subject: 'Final Step: Interview Guidelines - NxtWave Interviewer Program',
        templateData: { name: applicant.fullName, guidelinesLink: `${process.env.CLIENT_URL}/guidelines/${applicant._id}` },
        relatedTo: 'Guidelines',
        sentBy: req.user._id,
        isAutomated: false
    });
    logEvent('skill_assessment_categorized', { skillAssessmentId: skillAssessment._id, applicantId: applicant._id, categorizedBy: req.user._id, domains });
    res.json({ success: true, data: { id: skillAssessment._id, domains: skillAssessment.domains, applicantId: applicant._id, applicantStatus: applicant.status, message: 'Skill assessment categorized successfully' } });
});

const processGuidelinesReview = asyncHandler(async (req, res) => {
    const { decision, rejectionReason } = req.body;
    const guidelines = await Guidelines.findById(req.params.id);
    if (!guidelines) { res.status(404); throw new Error('Guidelines submission not found'); }
    const applicant = await Applicant.findById(guidelines.applicant);
    if (!applicant) { res.status(404); throw new Error('Associated applicant not found'); }
    if (decision === 'approve') {
      const skillAssessment = await SkillAssessment.findOne({ applicant: applicant._id });
      if (!skillAssessment) { res.status(404); throw new Error('Skill assessment not found for this applicant. Cannot onboard.'); }
      const userData = { firstName: applicant.fullName.split(' ')[0], lastName: applicant.fullName.split(' ').slice(1).join(' ') || applicant.fullName.split(' ')[0], email: applicant.email, password: crypto.randomBytes(10).toString('hex'), phoneNumber: applicant.phoneNumber, whatsappNumber: applicant.whatsappNumber, role: 'interviewer' };
      const user = await registerUser(userData, 'interviewer');
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();
      const interviewerSkills = (skillAssessment.technicalSkills || []).map(skill => ({ skill: skill.technology, proficiencyLevel: 'Advanced' }));
      const interviewer = await Interviewer.create({ user: user._id, applicant: applicant._id, currentEmployer: skillAssessment.currentEmployer, jobTitle: skillAssessment.jobTitle, yearsOfExperience: skillAssessment.yearsOfExperience, domains: skillAssessment.domains, primaryDomain: skillAssessment.domains[0] || 'Other', skills: interviewerSkills });
      applicant.status = APPLICATION_STATUS.ONBOARDED; applicant.interviewer = interviewer._id; await applicant.save();
      await sendAccountCreationEmail(user, resetToken, applicant);
       // --- CORRECTION START ---
      // Record that the welcome email was sent.
      // Interviewer.create() returns a single object here, not an array, so we use the 'interviewer' object directly.
      interviewer.welcomeEmailSentAt = new Date();
      await interviewer.save();
      // --- CORRECTION END ---
      
      if (applicant.whatsappNumber) { await sendWelcomeWhatsApp(user, applicant); }
      logEvent('applicant_onboarded_by_admin', { applicantId: applicant._id, interviewerId: interviewer._id, adminId: req.user._id });
    } else if (decision === 'reject') {
      applicant.status = APPLICATION_STATUS.GUIDELINES_FAILED;
      applicant.rejectionReason = rejectionReason || 'Failed to meet guidelines requirements.';
      await applicant.save();
      logEvent('guidelines_rejected_by_admin', { applicantId: applicant._id, adminId: req.user._id, reason: applicant.rejectionReason });
    } else { res.status(400); throw new Error('Invalid decision'); }
    res.json({ success: true, message: `Applicant has been successfully ${decision === 'approve' ? 'onboarded' : 'rejected'}.` });
});

const getSkillAssessments = asyncHandler(async (req, res) => {
    const { status, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc' } = req.query;
    let query = {}; if (status) query.status = status;
    const aggregationPipeline = [ { $lookup: { from: 'applicants', localField: 'applicant', foreignField: '_id', as: 'applicantInfo' } }, { $unwind: '$applicantInfo' } ];
    if (search) { query['applicantInfo.fullName'] = { $regex: search, $options: 'i' }; }
    aggregationPipeline.push({ $match: query });
    const totalDocs = (await SkillAssessment.aggregate(aggregationPipeline)).length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    aggregationPipeline.push( { $sort: sort }, { $skip: skip }, { $limit: parseInt(limit) }, { $project: { status: 1, currentEmployer: 1, jobTitle: 1, yearsOfExperience: 1, autoCategorizedDomain: 1, domains: 1, createdAt: 1, _id: 1, technicalSkills: 1, otherSkills: 1, applicant: { _id: '$applicantInfo._id', fullName: '$applicantInfo.fullName', email: '$applicantInfo.email', status: '$applicantInfo.status', phoneNumber: '$applicantInfo.phoneNumber', linkedinProfileUrl: '$applicantInfo.linkedinProfileUrl' } } } );
    const assessments = await SkillAssessment.aggregate(aggregationPipeline);
    res.json({ success: true, data: { assessments: assessments || [], page: parseInt(page), limit: parseInt(limit), totalDocs, totalPages: Math.ceil(totalDocs / parseInt(limit)) } });
});

const manualOnboard = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) { res.status(404); throw new Error('Applicant not found'); }
    const skillAssessment = await SkillAssessment.findOne({ applicant: applicant._id });
    if (!skillAssessment) { res.status(400); throw new Error('Cannot onboard: Skill assessment not found'); }
    const user = await User.findOne({ email: applicant.email });
    if(user){ res.status(400); throw new Error('User already exists'); }
    const tempPassword = crypto.randomBytes(10).toString('hex');
    const newUser = await User.create({ firstName: applicant.fullName.split(' ')[0], lastName: applicant.fullName.split(' ').slice(1).join(' ') || applicant.fullName.split(' ')[0], email: applicant.email, password: tempPassword, phoneNumber: applicant.phoneNumber, whatsappNumber: applicant.whatsappNumber, role: 'interviewer' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    newUser.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    newUser.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000;
    await newUser.save();
    const interviewer = await Interviewer.create({ user: newUser._id, applicant: applicant._id, currentEmployer: skillAssessment.currentEmployer, jobTitle: skillAssessment.jobTitle, yearsOfExperience: skillAssessment.yearsOfExperience, domains: skillAssessment.domains, primaryDomain: skillAssessment.domains[0] || 'Other', skills: skillAssessment.technicalSkills.map(skill => ({ skill: skill.skill, proficiencyLevel: skill.proficiencyLevel })) });
    applicant.status = APPLICATION_STATUS.ONBOARDED; applicant.interviewer = interviewer._id; applicant.reviewNotes = `Manually onboarded by admin. Reason: ${reason}`;
    await applicant.save();
    await sendAccountCreationEmail(newUser, resetToken, applicant);
    if (applicant.whatsappNumber) { await sendWelcomeWhatsApp(newUser, applicant); }
    logEvent('applicant_manually_onboarded', { applicantId: applicant._id, userId: newUser._id, interviewerId: interviewer._id, reason, adminId: req.user._id });
    res.json({ success: true, data: { id: applicant._id, status: applicant.status, interviewerId: interviewer._id, message: 'Applicant manually onboarded successfully' } });
});

const getGuidelinesSubmissions = asyncHandler(async (req, res) => {
    const { status, domain, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = [];
    query.push({ $lookup: { from: 'applicants', localField: 'applicant', foreignField: '_id', as: 'applicantInfo' } });
    query.push({ $unwind: '$applicantInfo' });
    query.push({ $lookup: { from: 'skillassessments', localField: 'applicant', foreignField: 'applicant', as: 'skillAssessmentInfo' } });
    query.push({ $unwind: { path: '$skillAssessmentInfo', preserveNullAndEmptyArrays: true } });
    const matchCriteria = {};
    if (status) matchCriteria.passed = status === 'passed';
    if (search) matchCriteria['applicantInfo.fullName'] = { $regex: search, $options: 'i' };
    if (domain) matchCriteria['skillAssessmentInfo.domains'] = domain;
    if (Object.keys(matchCriteria).length > 0) { query.push({ $match: matchCriteria }); }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    query.push({ $facet: { paginatedResults: [ { $sort: sort }, { $skip: skip }, { $limit: parseInt(limit) } ], totalCount: [ { $count: 'count' } ] } });
    const results = await Guidelines.aggregate(query);
    const guidelines = results[0].paginatedResults;
    const totalDocs = results[0].totalCount[0] ? results[0].totalCount[0].count : 0;
    const formattedGuidelines = guidelines.map(g => ({ _id: g._id, applicant: { _id: g.applicantInfo._id, fullName: g.applicantInfo.fullName, email: g.applicantInfo.email, }, applicantStatus: g.applicantInfo.status, domains: g.skillAssessmentInfo?.domains || [], score: g.score, passed: g.passed, completionTime: g.completionTime, createdAt: g.createdAt, answers: g.answers }));
    res.json({ success: true, data: { guidelines: formattedGuidelines, page: parseInt(page), limit: parseInt(limit), totalDocs, totalPages: Math.ceil(totalDocs / parseInt(limit)) } });
});

const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    if (search) { const searchRegex = { $regex: search, $options: 'i' }; query.$or = [ { 'firstName': searchRegex }, { 'lastName': searchRegex }, { 'email': searchRegex }, ]; }
    if (role) { query.role = role; }
    const totalDocs = await User.countDocuments(query);
    const skip = (page - 1) * limit;
    let sortKey = sortBy; if (sortBy === 'fullName') { sortKey = 'firstName'; } const sort = { [sortKey]: sortOrder === 'desc' ? -1 : 1 };
    const users = await User.find(query).sort(sort).skip(skip).limit(parseInt(limit));
    const usersWithDetails = users.map(user => ({ ...user.toObject(), fullName: `${user.firstName} ${user.lastName}` }));
    res.json({ success: true, data: { users: usersWithDetails, page: parseInt(page), limit: parseInt(limit), totalDocs, totalPages: Math.ceil(totalDocs / parseInt(limit)) } });
});

const createUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, role, isActive, phoneNumber } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) { res.status(400); throw new Error('User with this email already exists.'); }
    const user = await User.create({ firstName, lastName, email, password, role, isActive, phoneNumber });
    res.status(201).json({ success: true, data: user });
});

const getUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    const { firstName, lastName, email, role, isActive } = req.body;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) { res.status(400); throw new Error('Email already in use'); }
        user.email = email;
    }
    const updatedUser = await user.save();
    res.json({ success: true, data: updatedUser });
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    user.isActive = false;
    await user.save();
    res.json({ success: true, message: 'User has been deactivated' });
});

const getInterviewBookings = asyncHandler(async (req, res) => {
    const bookings = await InterviewBooking.find().populate({ path: 'interviewers.interviewer', populate: { path: 'user', select: 'firstName lastName' } }).populate('createdBy', 'firstName lastName').sort({ bookingDate: -1 });
    res.json({ success: true, data: bookings });
});

const getInterviewBookingDetails = asyncHandler(async (req, res) => {
    const booking = await InterviewBooking.findById(req.params.id)
        .populate({ 
            path: 'interviewers.interviewer', 
            populate: { path: 'user', select: 'firstName lastName email' }
        })
        .populate('createdBy', 'firstName lastName');

    if (!booking) {
        res.status(404);
        throw new Error('Interview booking not found.');
    }
    res.json({ success: true, data: booking });
});

const resetBookingSubmission = asyncHandler(async (req, res) => {
    const { bookingId, submissionId } = req.params;
    
    const booking = await InterviewBooking.findOneAndUpdate(
        { "_id": bookingId, "interviewers._id": submissionId },
        { 
            "$set": {
                "interviewers.$.status": "Pending",
                "interviewers.$.providedSlots": []
            }
        },
        { new: true }
    );

    if (!booking) {
        res.status(404);
        throw new Error("Booking or submission not found.");
    }

    logEvent('booking_submission_reset', { bookingId, submissionId, adminId: req.user._id });
    res.json({ success: true, message: "Interviewer's slot submission has been reset." });
});

const getBookingSlots = asyncHandler(async (req, res) => {
    const { search, date } = req.query;

    const pipeline = [
        { $unwind: '$interviewers' },
        { $match: { 'interviewers.status': 'Submitted' } },
        { $lookup: { from: 'interviewers', localField: 'interviewers.interviewer', foreignField: '_id', as: 'interviewerInfo' } },
        { $unwind: '$interviewerInfo' },
        { $lookup: { from: 'users', localField: 'interviewerInfo.user', foreignField: '_id', as: 'userInfo' } },
        { $unwind: '$userInfo' }
    ];
    
    const matchCriteria = {};
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        matchCriteria.bookingDate = { $gte: startOfDay, $lte: endOfDay };
    }
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        matchCriteria.$or = [
            { 'userInfo.email': searchRegex },
            { $expr: { $regexMatch: { input: { $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"] }, regex: search, options: "i" } } }
        ];
    }
    if (Object.keys(matchCriteria).length > 0) {
        pipeline.push({ $match: matchCriteria });
    }

    pipeline.push({ 
        $project: {
            submissionId: '$interviewers._id',
            bookingId: '$_id',
            interviewerId: '$interviewerInfo._id',
            fullName: { $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'] }, 
            email: '$userInfo.email',
            interviewDate: '$bookingDate', 
            timeSlots: '$interviewers.providedSlots'
        }
    });

    pipeline.push({ $sort: { interviewDate: -1, fullName: 1 } });
    
    const slots = await InterviewBooking.aggregate(pipeline);

    res.json({ success: true, data: slots });
});

const updateInterviewBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { bookingDate, interviewerIds } = req.body;

    const booking = await InterviewBooking.findById(id);
    if (!booking) {
        res.status(404);
        throw new Error('Interview booking not found.');
    }

    booking.bookingDate = bookingDate || booking.bookingDate;

    if (interviewerIds && Array.isArray(interviewerIds)) {
        const existingInterviewersMap = new Map(booking.interviewers.map(i => [i.interviewer.toString(), i.status]));
        booking.interviewers = interviewerIds.map(interviewerId => ({
            interviewer: interviewerId,
            status: existingInterviewersMap.get(interviewerId) || 'Pending'
        }));
    }

    const updatedBooking = await booking.save();
    logEvent('interview_booking_updated', { bookingId: updatedBooking._id, adminId: req.user._id });
    res.status(200).json({ success: true, data: updatedBooking });
});

const deleteInterviewBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await InterviewBooking.findById(id);

    if (!booking) {
        res.status(404);
        throw new Error('Interview booking not found.');
    }

    await booking.deleteOne();
    logEvent('interview_booking_deleted', { bookingId: id, adminId: req.user._id });
    res.status(200).json({ success: true, message: 'Interview booking deleted successfully.' });
});

const getMainSheetEntryById = asyncHandler(async (req, res) => {
    const entry = await MainSheetEntry.findById(req.params.id)
      .populate({
        path: 'interviewer',
        select: 'user',
        populate: {
            path: 'user',
            select: 'firstName lastName email'
        }
      })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!entry) {
        res.status(404);
        throw new Error('Entry not found');
    }
    res.json({ success: true, data: entry });
});

const getMainSheetEntries = asyncHandler(async (req, res) => {
    // Add sortBy and sortOrder to the destructuring
    const { search, page = 1, limit = 20, interviewStatus, interviewDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};

    // --- All your existing filter logic here remains the same ---
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
            { hiringName: searchRegex },
            { techStack: searchRegex },
            { candidateName: searchRegex },
            { mailId: searchRegex },
            { interviewStatus: searchRegex },
        ];
    }
     if (interviewStatus) {
         query.interviewStatus = interviewStatus;
     }
     if (interviewDate) {
         const date = new Date(interviewDate);
         if (!isNaN(date)) {
             query.interviewDate = {
                 $gte: startOfDay(date),
                 $lte: endOfDay(date)
             };
         }
     }
     // --- End of existing logic ---

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }; // Create a dynamic sort object

    const entries = await MainSheetEntry.find(query)
        .populate({
            path: 'interviewer',
            select: 'user',
            populate: {
                path: 'user',
                select: 'firstName lastName email'
            }
        })
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .sort(sort) // Use the dynamic sort object here
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
        
    const totalDocs = await MainSheetEntry.countDocuments(query);

    res.json({ 
        success: true, 
        data: {
            entries,
            page: parseInt(page),
            limit: parseInt(limit),
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
        }
    });
});

const bulkUpdateMainSheetEntries = asyncHandler(async (req, res) => {
    const entries = req.body;
    const { _id: adminId } = req.user;
    const results = { created: 0, updated: 0, errors: [] };

    for (const entry of entries) {
        try {
            entry.updatedBy = adminId;
            if (entry._id) {
                await MainSheetEntry.findByIdAndUpdate(entry._id, entry, { new: true, runValidators: true });
                results.updated++;
            } else {
                entry.createdBy = adminId;
                await MainSheetEntry.create(entry);
                results.created++;
            }
        } catch (error) {
            results.errors.push({ candidateName: entry.candidateName, error: error.message });
        }
    }

    logEvent('main_sheet_bulk_updated', { ...results, adminId });

    if (results.errors.length > 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Some entries failed to save.', 
            data: results 
        });
    }

    res.status(200).json({ success: true, message: 'Sheet updated successfully.', data: results });
});

const deleteMainSheetEntry = asyncHandler(async (req, res) => {
    const entry = await MainSheetEntry.findById(req.params.id);
    if (!entry) {
        res.status(404);
        throw new Error('Entry not found');
    }
    await entry.deleteOne();
    logEvent('main_sheet_entry_deleted', { entryId: req.params.id, adminId: req.user._id });
    res.json({ success: true, message: 'Entry deleted successfully' });
});

const bulkDeleteMainSheetEntries = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
        res.status(400);
        throw new Error('No entry IDs provided for deletion.');
    }
    const result = await MainSheetEntry.deleteMany({ _id: { $in: ids } });
    
    logEvent('main_sheet_bulk_deleted', { deletedCount: result.deletedCount, adminId: req.user._id });
    
    res.status(200).json({ success: true, message: `${result.deletedCount} entries deleted successfully.` });
});


const getUniqueHiringNames = asyncHandler(async (req, res) => {
    const names = await MainSheetEntry.distinct('hiringName');
    const filteredNames = names.filter(name => name && name.trim() !== '');
    res.json({ success: true, data: filteredNames });
});

const createPublicBooking = asyncHandler(async (req, res) => {
    const { selectedSlots } = req.body;
    const newPublicBooking = await PublicBooking.create({
        createdBy: req.user._id,
        interviewerSlots: selectedSlots.map(s => ({
            interviewer: s.interviewerId,
            date: s.date,
            timeSlots: s.slots.map(ts => ({
                startTime: ts.startTime,
                endTime: ts.endTime
            }))
        }))
    });
    res.status(201).json({ success: true, data: newPublicBooking });
});

const getPublicBookings = asyncHandler(async (req, res) => {
    const bookings = await PublicBooking.find().populate({
        path: 'interviewerSlots.interviewer',
        select: 'user',
        populate: { path: 'user', select: 'firstName lastName' }
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
});


const updatePublicBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { students } = req.body;
    const publicBooking = await PublicBooking.findById(id);
    if (!publicBooking) {
        res.status(404);
        throw new Error('Public booking not found.');
    }
    const existingEmailsSet = new Set(publicBooking.allowedStudents.map(s => s.email));
    const newStudents = students.filter(student => !existingEmailsSet.has(student.email.toLowerCase()));

    if (newStudents.length > 0) {
        for (const student of newStudents) {
            const sequenceNumber = await getNextSequenceValue('interviewId');
            student.interviewId = `INT-${String(sequenceNumber).padStart(4, '0')}`;
        }
        const entriesToCreate = newStudents.map(student => ({
            hiringName: student.hiringName,
            techStack: student.domain,
            interviewId: student.interviewId,
            uid: student.userId,
            candidateName: student.fullName,
            mobileNumber: student.mobileNumber,
            mailId: student.email,
            candidateResume: student.resumeLink,
            createdBy: req.user._id,
            updatedBy: req.user._id,
            // The interviewStatus will automatically default to 'Pending Student Booking'
        }));
    
        if (entriesToCreate.length > 0) {
            await MainSheetEntry.insertMany(entriesToCreate);
            logEvent('main_sheet_entries_pre_created', { count: entriesToCreate.length, adminId: req.user._id });
        }
        publicBooking.allowedStudents.push(...newStudents);
        
        for (const student of newStudents) {
            await sendStudentBookingInvitationEmail(student.email, id, publicBooking.publicId);
        }
        
        await publicBooking.save();
        logEvent('students_authorized_for_booking', { publicBookingId: id, count: newStudents.length, adminId: req.user._id, });
        res.json({ success: true, message: `${newStudents.length} new invitations sent successfully.`, data: publicBooking });
    } else {
        res.json({ success: true, message: 'No new unique emails to send. List is up to date.', data: publicBooking });
    }
});

const sendBookingReminders = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const publicBooking = await PublicBooking.findById(id);
    if (!publicBooking || publicBooking.status !== 'Active') {
        res.status(404);
        throw new Error('Active public booking link not found.');
    }
    const bookedStudents = await StudentBooking.find({ publicBooking: id }).select('studentEmail -_id').lean();
    const bookedEmails = new Set(bookedStudents.map(s => s.studentEmail));
    const studentsToRemind = publicBooking.allowedStudents.filter(student => !bookedEmails.has(student.email));

    if (studentsToRemind.length === 0) {
        return res.json({ success: true, message: "All authorized students have already booked their slots. No reminders sent." });
    }

    let remindersSent = 0;
    for (const student of studentsToRemind) {
        await sendEmail({
            recipient: publicBooking._id, recipientModel: 'PublicBooking', recipientEmail: student.email, templateName: EMAIL_TEMPLATES.STUDENT_BOOKING_REMINDER, subject: 'Reminder: Schedule Your NxtWave Interview',
            templateData: { bookingLink: `${process.env.CLIENT_URL}/book/${publicBooking.publicId}` }, relatedTo: 'Student Booking Reminder', sentBy: req.user._id, isAutomated: false
        });
        remindersSent++;
    }

    logEvent('booking_reminders_sent', { publicBookingId: id, count: remindersSent, adminId: req.user._id, });
    res.json({ success: true, message: `${remindersSent} reminder(s) have been sent successfully.` });
});

const getStudentPipeline = asyncHandler(async (req, res) => {
    const pipeline = [
        { $unwind: "$allowedStudents" },
        {
            $lookup: {
                from: "studentbookings", let: { student_email: "$allowedStudents.email", public_booking_id: "$_id" },
                pipeline: [
                    { $match: { $expr: { $and: [ { $eq: ["$studentEmail", "$$student_email"] }, { $eq: ["$publicBooking", "$$public_booking_id"] } ] } } },
                    { $lookup: { from: "interviewers", localField: "bookedInterviewer", foreignField: "_id", as: "interviewerInfo" } },
                    { $unwind: { path: "$interviewerInfo", preserveNullAndEmptyArrays: true } },
                    { $lookup: { from: "users", localField: "interviewerInfo.user", foreignField: "_id", as: "interviewerUserInfo" } },
                    { $unwind: { path: "$interviewerUserInfo", preserveNullAndEmptyArrays: true } }
                ],
                as: "bookingInfo"
            }
        },
        { $unwind: { path: "$bookingInfo", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: { $ifNull: ["$bookingInfo._id", "$allowedStudents.email"] },
                publicBookingId: "$publicId",
                interviewId: "$allowedStudents.interviewId", 
                hiringName: "$allowedStudents.hiringName",
                domain: { $ifNull: ["$bookingInfo.domain", "$allowedStudents.domain"] },
                userId: "$allowedStudents.userId",
                studentName: "$allowedStudents.fullName",
                studentEmail: "$allowedStudents.email",
                mobileNumber: "$allowedStudents.mobileNumber",
                resumeLink: "$allowedStudents.resumeLink",
                studentPhone: "$bookingInfo.studentPhone",
                bookedInterviewer: "$bookingInfo.interviewerInfo",
                interviewerEmail: "$bookingInfo.interviewerEmail",
                bookingDate: "$bookingInfo.bookingDate",
                bookedSlot: "$bookingInfo.bookedSlot",
                hostEmail: "$bookingInfo.hostEmail",
                eventTitle: "$bookingInfo.eventTitle",
                meetLink: "$bookingInfo.meetLink",
                createdAt: { $ifNull: ["$bookingInfo.createdAt", null] }
            }
        },
        { $sort: { bookingDate: -1, studentName: 1 } }
    ];

    const studentPipeline = await PublicBooking.aggregate(pipeline);
    
    for (let item of studentPipeline) {
        if (item.bookedInterviewer) {
            const user = await User.findById(item.bookedInterviewer.user).select('firstName lastName');
            if(user) { item.bookedInterviewer.user = user; }
        }
    }
    
    res.json({ success: true, data: studentPipeline });
});

const getPublicBookingDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await PublicBooking.findById(id).lean().populate('createdBy', 'firstName lastName');

    if (!booking) {
        res.status(404);
        throw new Error('Public booking details not found.');
    }
    const bookedStudents = await StudentBooking.find({ publicBooking: id }).select('studentEmail -_id').lean();
    const bookedEmails = new Set(bookedStudents.map(s => s.studentEmail));
    const trackedStudents = booking.allowedStudents.map(student => ({ ...student, status: bookedEmails.has(student.email) ? 'Submitted' : 'Not Submitted' }));
    booking.trackedEmails = trackedStudents;
    delete booking.allowedStudents;
    res.json({ success: true, data: booking });
});

const updateStudentBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    if (!updateData || Object.keys(updateData).length === 0) { res.status(400); throw new Error('Update data is required in the request body.'); }
    const booking = await StudentBooking.findById(id);
    if (!booking) { res.status(404); throw new Error('Student booking not found.'); }
    if (updateData.domain && updateData.domain !== booking.domain) {
        const domainDoc = await Domain.findOne({ name: updateData.domain });
        if (domainDoc && domainDoc.eventTitle) {
            updateData.eventTitle = `${domainDoc.eventTitle} || ${booking.studentName}`;
        } else {
            updateData.eventTitle = `${updateData.domain} Interview || ${booking.studentName}`;
        }
    }
    Object.assign(booking, updateData);
    const updatedBooking = await booking.save();
    res.json({ success: true, data: updatedBooking });
});

const getUniqueHostEmails = asyncHandler(async (req, res) => {
    const emails = await StudentBooking.distinct('hostEmail');
    const filteredEmails = emails.filter(email => email && email.trim() !== '');
    res.json({ success: true, data: filteredEmails });
});

const generateMeetLink = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await StudentBooking.findById(id).populate({ path: 'bookedInterviewer', populate: { path: 'user', select: 'email' }});
    if (!booking) { res.status(404); throw new Error('Booking not found.'); }

    const { studentEmail, interviewerEmail, hostEmail, eventTitle, bookingDate, bookedSlot } = booking;
    const attendees = [studentEmail, interviewerEmail, hostEmail].filter(Boolean);
    if (attendees.length < 2) { res.status(400); throw new Error('At least two attendees (student, interviewer, or host) must have a valid email.'); }

    // --- THIS IS THE CORRECTED CODE BLOCK ---
    const date = new Date(bookingDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    // --- END CORRECTION ---

    const startDateTime = `${formattedDate}T${bookedSlot.startTime}:00`;
    const endDateTime = `${formattedDate}T${bookedSlot.endTime}:00`;

    const eventData = { 
        summary: eventTitle || `Technical Interview: ${booking.studentName}`, 
        description: `Interview for ${booking.studentName} with our technical interviewer.`, 
        start: { dateTime: startDateTime }, 
        end: { dateTime: endDateTime }, 
        attendees, 
    };

    const googleEvent = await createCalendarEvent(eventData);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        booking.meetLink = googleEvent.hangoutLink;
        await booking.save({ session });

        if (booking.interviewId && googleEvent.hangoutLink) {
            const mainSheetUpdate = await MainSheetEntry.findOneAndUpdate(
                { interviewId: booking.interviewId },
                { $set: { meetingLink: googleEvent.hangoutLink, updatedBy: req.user._id } },
                { session }
            );
            // Optional: Check if update was successful
            if (!mainSheetUpdate) {
                // This would be a data integrity issue, but we can handle it
                throw new Error(`MainSheetEntry with interviewId ${booking.interviewId} not found.`);
            }
        }
        
        await session.commitTransaction();
        
        logEvent('main_sheet_meetlink_synced', { studentBookingId: booking._id, interviewId: booking.interviewId, adminId: req.user._id });
        res.json({ success: true, data: booking });

    } catch (error) {
        await session.abortTransaction();
        throw error; // Re-throw the error to be caught by asyncHandler
    } finally {
        session.endSession();
    }
});

const getDomains = asyncHandler(async (req, res) => {
    const domains = await Domain.find().sort({ name: 1 });
    res.json({ success: true, data: domains });
});

const createDomain = asyncHandler(async (req, res) => {
    const { name, eventTitle } = req.body;
    if (!name) { res.status(400); throw new Error('Domain name is required.'); }
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    };
    const escapedName = escapeRegExp(name);

    const existing = await Domain.findOne({ name: new RegExp(`^${escapedName}$`, 'i') });    if (existing) { res.status(400); throw new Error('A domain with this name already exists.'); }
    const domain = await Domain.create({ name, eventTitle, createdBy: req.user._id, updatedBy: req.user._id });
    res.status(201).json({ success: true, data: domain });
});

const updateDomain = asyncHandler(async (req, res) => {
    const { name, eventTitle } = req.body;
    const domain = await Domain.findByIdAndUpdate( req.params.id, { name, eventTitle, updatedBy: req.user._id }, { new: true, runValidators: true });
    if (!domain) { res.status(404); throw new Error('Domain not found.'); }
    res.json({ success: true, data: domain });
});

const deleteDomain = asyncHandler(async (req, res) => {
    const domain = await Domain.findById(req.params.id);
    if (!domain) { res.status(404); throw new Error('Domain not found.'); }
    await EvaluationSheet.deleteOne({ domain: domain._id });
    await domain.deleteOne();
    res.json({ success: true, message: 'Domain and its evaluation sheet have been deleted.' });
});

const getEvaluationSheetByDomain = asyncHandler(async (req, res) => {
    const { domainId } = req.params;
    let sheet = await EvaluationSheet.findOne({ domain: domainId });
    if (!sheet) { sheet = await EvaluationSheet.create({ domain: domainId, columnGroups: [], updatedBy: req.user._id, }); }
    res.json({ success: true, data: sheet });
});

const updateEvaluationSheet = asyncHandler(async (req, res) => {
    const { domainId } = req.params;
    const { columnGroups, remarksEnabled } = req.body;
    const sheet = await EvaluationSheet.findOneAndUpdate( { domain: domainId }, { columnGroups, remarksEnabled, updatedBy: req.user._id }, { new: true, upsert: true, runValidators: true });
    res.json({ success: true, data: sheet });
});

// @desc    Get dashboard analytics data
// @route   GET /api/admin/stats/analytics
// @access  Private/Admin
const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const { view, targetDate } = req.query;
    if (!targetDate) {
        return res.status(400).json({ success: false, message: "Target date is required." });
    }
    const date = new Date(targetDate);
    
    let startDate, endDate, groupBy, project;
    
    // Determine date range and grouping logic based on view
    switch (view) {
        case 'daily':
            startDate = startOfDay(date);
            endDate = endOfDay(date);
            groupBy = { $hour: { date: "$interviewDate", timezone: "Asia/Kolkata" } };
            project = { _id: 0, hour: '$_id' };
            break;
        case 'monthly':
            startDate = startOfMonth(date);
            endDate = endOfMonth(date);
            groupBy = { $week: { date: "$interviewDate", timezone: "Asia/Kolkata" } };
            project = { _id: 0, week: '$_id' };
            break;
        case 'weekly':
        default:
            startDate = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
            endDate = endOfWeek(date, { weekStartsOn: 1 });   // Sunday end
            groupBy = { $isoDayOfWeek: { date: "$interviewDate", timezone: "Asia/Kolkata" } }; // 1=Mon, 7=Sun
            project = { _id: 0, day: '$_id' };
            break;
    }
    
    // --- FIX: Corrected Status Names to match MainSheetEntry model ---
    const statuses = ['Scheduled', 'Completed', 'InProgress', 'Cancelled', 'Pending Student Booking'];
    const groupStage = { _id: groupBy };
    const projectStage = { ...project };

    statuses.forEach(status => {
        // Create a URL-friendly key from the status name (e.g., 'PendingStudentBooking')
        const key = status.replace(/\s+/g, ''); 
        groupStage[key] = {
            $sum: { $cond: [{ $eq: ["$interviewStatus", status] }, 1, 0] }
        };
        projectStage[key] = `$${key}`;
    });
    
    const analytics = await MainSheetEntry.aggregate([
        { $match: { interviewDate: { $gte: startDate, $lte: endDate } } },
        { $group: groupStage },
        { $project: projectStage },
        { $sort: { [Object.keys(project)[1]]: 1 } } // Sort by hour, day, or week
    ]);

    // --- FIX: Remap the key for the frontend ---
    const formattedAnalytics = analytics.map(item => {
        const { PendingStudentBooking, ...rest } = item;
        return { ...rest, Pending: PendingStudentBooking || 0 };
    });

    res.json({ success: true, data: formattedAnalytics });
});


// --- FIX: Add new controller for fetching the latest date ---
// @desc    Get the latest interview date from the main sheet
// @route   GET /api/admin/stats/latest-interview-date
// @access  Private/Admin
const getLatestInterviewDate = asyncHandler(async (req, res) => {
    const latestEntry = await MainSheetEntry.findOne({ interviewDate: { $ne: null } }).sort({ interviewDate: -1 });
    res.json({
        success: true,
        data: {
            latestDate: latestEntry ? latestEntry.interviewDate : new Date().toISOString(),
        }
    });
});

// @desc    Get summary statistics for the Domain Evaluation page
// @route   GET /api/admin/evaluation-summary
// @access  Private/Admin
const getDomainEvaluationSummary = asyncHandler(async (req, res) => {
    const summary = await MainSheetEntry.aggregate([
        // Filter out entries with no techStack (domain)
        { $match: { techStack: { $exists: true, $ne: null, $ne: "" } } },

        // Group by techStack
        {
            $group: {
                _id: '$techStack', // Group by domain name
                candidateCount: { $sum: 1 }, // Count total interviews (candidates) for the domain
                scheduledCount: {
                    $sum: { $cond: [{ $eq: ['$interviewStatus', 'Scheduled'] }, 1, 0] }
                },
                completedCount: {
                    $sum: { $cond: [{ $eq: ['$interviewStatus', 'Completed'] }, 1, 0] }
                },
                cancelledCount: {
                    $sum: { $cond: [{ $eq: ['$interviewStatus', 'Cancelled'] }, 1, 0] }
                },
                inProgressCount: {
                    $sum: { $cond: [{ $eq: ['$interviewStatus', 'InProgress'] }, 1, 0] }
                },
                pendingCount: {
                    $sum: { $cond: [{ $eq: ['$interviewStatus', 'Pending Student Booking'] }, 1, 0] }
                }
            }
        },

        // Reshape the output
        {
            $project: {
                _id: 0,
                domainName: '$_id',
                candidateCount: '$candidateCount',
                ...['scheduledCount', 'completedCount', 'cancelledCount', 'inProgressCount', 'pendingCount'].reduce((acc, field) => ({ ...acc, [field]: `$${field}` }), {})
            }
        },
        { $sort: { domainName: 1 } }
    ]);

    res.json({ success: true, data: summary });
});

module.exports = {
    getDashboardStats, getEarningsReport: generateAndGetPayoutSheet, getPaymentRequests, sendPaymentEmail,
    getApplicants, createApplicant, updateApplicant, deleteApplicant, exportApplicants,
    getApplicantDetails, updateApplicantStatus, processLinkedInReview, processSkillCategorization,
    manualOnboard, getSkillAssessments, getGuidelinesSubmissions, processGuidelinesReview,
    getInterviewers, getInterviewerDetails, createInterviewer, updateInterviewer, deleteInterviewer,
  bulkDeleteInterviewers,
    getUsers, getUserDetails, createUser, updateUser, deleteUser,
    createInterviewBooking, getInterviewBookings, getBookingSlots,
    getInterviewBookingDetails,
    resetBookingSubmission,
    updateInterviewBooking,
    deleteInterviewBooking,
    getMainSheetEntryById,
    getMainSheetEntries,
    bulkUpdateMainSheetEntries,
    deleteMainSheetEntry,
    bulkDeleteMainSheetEntries,
    createPublicBooking,
    getPublicBookings,
    updatePublicBooking,
    getStudentPipeline,
    getPublicBookingDetails,
    updateStudentBooking,
    getUniqueHostEmails,
    generateMeetLink,
    sendBookingReminders,
    getUniqueHiringNames,
    getDomains,
    createDomain,
    updateDomain,
    deleteDomain,
    getEvaluationSheetByDomain,
    updateEvaluationSheet,
    getEvaluationDataForAdmin,
    sendInvoiceMail,
    sendPaymentReceivedEmail,
    refreshRecordingLinks,
    createCustomEmailTemplate,
    getCustomEmailTemplates,
    getCustomEmailTemplateById,
    updateCustomEmailTemplate,
    deleteCustomEmailTemplate,
    sendBulkCustomEmail,
    bulkUploadMainSheetEntries,
    bulkUploadInterviewers, getDashboardAnalytics,
    getLatestInterviewDate, // <-- Export the new function
    getDomainEvaluationSummary,
    exportMainSheetEntries,
    // --- MODIFICATION START ---
    sendWelcomeEmail,
    // --- MODIFICATION END ---
};
