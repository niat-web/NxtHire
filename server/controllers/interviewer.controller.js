// server/controllers/interviewer.controller.js
const asyncHandler = require('express-async-handler');
const { startOfDay, endOfDay } = require('date-fns');
const Interviewer = require('../models/Interviewer');
const User = require('../models/User');
const Availability = require('../models/Availability');
const InterviewBooking = require('../models/InterviewBooking');
const MainSheetEntry = require('../models/MainSheetEntry');
const EvaluationSheet = require('../models/EvaluationSheet');
const Domain = require('../models/Domain');
const { logEvent, logError } = require('../middleware/logger.middleware');

// @desc    Subscribe to push notifications
// @route   POST /api/interviewer/subscribe
// @access  Private/Interviewer
const subscribeToPushNotifications = asyncHandler(async (req, res) => {
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
      res.status(400);
      throw new Error('Push subscription object is required.');
  }

  const interviewer = await Interviewer.findOne({ user: req.user.id });
  if (!interviewer) {
      res.status(404);
      throw new Error('Interviewer profile not found.');
  }

  // Check if the subscription endpoint already exists to avoid duplicates
  const alreadySubscribed = interviewer.pushSubscriptions.some(
      sub => sub.endpoint === subscription.endpoint
  );

  if (!alreadySubscribed) {
      interviewer.pushSubscriptions.push(subscription);
      await interviewer.save();
      logEvent('push_subscription_added', { interviewerId: interviewer._id, endpoint: subscription.endpoint });
  } else {
      logEvent('push_subscription_exists', { interviewerId: interviewer._id, endpoint: subscription.endpoint });
  }
  
  res.status(201).json({ success: true, message: 'Subscription saved successfully.' });
});


// --- MODIFICATION START: New function to get payment history ---
const getPaymentHistory = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        res.status(400);
        throw new Error('Start and end dates are required.');
    }

    const interviewer = await Interviewer.findOne({ user: req.user.id });
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found.');
    }

    // Safely parse payment amount, defaulting to 0 if invalid or not set.
    const paymentAmount = parseInt(String(interviewer.paymentAmount || '0').replace(/[^0-9]/g, ''), 10);
    
    const pipeline = [
        {
            $match: {
                interviewer: interviewer._id,
                interviewStatus: 'Completed',
                interviewDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                }
            }
        },
        {
            $group: {
                _id: '$techStack', // Group by domain
                interviewsCompleted: { $sum: 1 }
            }
        },
        { $project: { _id: 0, domain: '$_id', interviewsCompleted: 1, amount: { $multiply: ['$interviewsCompleted', paymentAmount] } } },
        { $sort: { domain: 1 } }
    ];

    const results = await MainSheetEntry.aggregate(pipeline);

    const totalInterviews = results.reduce((acc, curr) => acc + curr.interviewsCompleted, 0);
    const totalAmount = results.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({ success: true, data: { breakdown: results, totalInterviews, totalAmount } });
});
// --- MODIFICATION END ---

const getInterviewerEvaluationSummary = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id }).select('_id');
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found.');
    }

    const summary = await MainSheetEntry.aggregate([
        { $match: { 
            interviewer: interviewer._id,
            techStack: { $exists: true, $ne: null, $ne: "" }
        }},
        {
            $group: {
                _id: '$techStack',
                candidateCount: { $sum: 1 },
                scheduledCount: { $sum: { $cond: [{ $eq: ['$interviewStatus', 'Scheduled'] }, 1, 0] }},
                completedCount: { $sum: { $cond: [{ $eq: ['$interviewStatus', 'Completed'] }, 1, 0] }},
                cancelledCount: { $sum: { $cond: [{ $eq: ['$interviewStatus', 'Cancelled'] }, 1, 0] }},
                inProgressCount: { $sum: { $cond: [{ $eq: ['$interviewStatus', 'InProgress'] }, 1, 0] }},
                pendingCount: { $sum: { $cond: [{ $eq: ['$interviewStatus', 'Pending Student Booking'] }, 1, 0] }}
            }
        },
        {
            $project: {
                _id: 0,
                domainName: '$_id',
                candidateCount: '$candidateCount',
                scheduledCount: 1,
                completedCount: 1,
                cancelledCount: 1,
                inProgressCount: 1,
                pendingCount: 1
            }
        },
        { $sort: { domainName: 1 } }
    ]);

    res.json({ success: true, data: summary });
});


const getAssignedDomains = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id });
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found.');
    }
    const domains = await MainSheetEntry.distinct('techStack', { interviewer: interviewer._id });
    res.json({ success: true, data: domains.filter(Boolean) });
});

const getEvaluationDataForInterviewer = asyncHandler(async (req, res) => {
    // --- MODIFICATION START ---
    const { domain, search, interviewStatus, interviewDate } = req.query;
    // --- MODIFICATION END ---
    
    if (!domain) {
        return res.json({ success: true, data: { evaluationSheet: null, interviews: [] } });
    }
    
    const interviewer = await Interviewer.findOne({ user: req.user.id });
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found.');
    }
    
    const domainDoc = await Domain.findOne({ name: domain });
    if (!domainDoc) {
        res.status(404);
        throw new Error('Domain configuration not found.');
    }
    
    const evaluationSheet = await EvaluationSheet.findOne({ domain: domainDoc._id });
    
    const query = {
        interviewer: interviewer._id,
        techStack: domain,
    };

    // --- MODIFICATION START ---
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

const updateEvaluationData = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { evaluationData: newEvaluationData, interviewerRemarks } = req.body;

    const interviewer = await Interviewer.findOne({ user: req.user.id });
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found.');
    }
    
    const entry = await MainSheetEntry.findById(id);
    if (!entry) {
        res.status(404);
        throw new Error('Interview entry not found.');
    }

    if (entry.interviewer.toString() !== interviewer._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to update this entry.');
    }
    
    let hasChanges = false;
    if (newEvaluationData) {
        entry.evaluationData = {
            ...(entry.evaluationData || {}),
            ...newEvaluationData
        };
        entry.markModified('evaluationData');
        hasChanges = true;
    }

    if (interviewerRemarks !== undefined) {
        entry.interviewerRemarks = interviewerRemarks;
        hasChanges = true;
    }
    
    entry.updatedBy = req.user.id;
    if (hasChanges) await entry.save();
    
    logEvent('evaluation_data_updated', { entryId: id, interviewerId: interviewer._id });

    res.json({ success: true, message: 'Evaluation updated successfully.', data: entry });
});

const getAssignedInterviews = asyncHandler(async (req, res) => {
  const interviewer = await Interviewer.findOne({ user: req.user.id });
  if (!interviewer) {
    res.status(404);
    throw new Error('Interviewer profile not found for the logged-in user.');
  }

  const assignedEntries = await MainSheetEntry.find({ interviewer: interviewer._id })
    .select(
      'techStack interviewId uid candidateName mobileNumber mailId meetingLink interviewDate interviewTime interviewDuration interviewStatus'
    )
    .sort({ interviewDate: -1 });

  res.json({ success: true, data: assignedEntries });
});

const updateAssignedInterviewStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const interviewer = await Interviewer.findOne({ user: req.user.id });
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found.');
    }

    const entry = await MainSheetEntry.findById(id);
    if (!entry) {
        res.status(404);
        throw new Error('Interview entry not found.');
    }

    if (entry.interviewer.toString() !== interviewer._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to update this interview.');
    }

    entry.interviewStatus = status;
    entry.updatedBy = req.user.id;
    await entry.save();
    
    logEvent('interview_status_updated_by_interviewer', { entryId: entry._id, newStatus: status, interviewerId: interviewer._id });

    res.json({ success: true, message: 'Interview status updated successfully.', data: entry });
});

const getProfile = asyncHandler(async (req, res) => {
  const interviewer = await Interviewer.findOne({ user: req.user.id })
    .populate('user', 'firstName lastName email phoneNumber whatsappNumber');
  if (!interviewer) {
    res.status(404);
    throw new Error('Interviewer profile not found');
  }
  res.json({ success: true, data: interviewer });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { currentEmployer, jobTitle, yearsOfExperience, companyType } = req.body;
  const interviewer = await Interviewer.findOne({ user: req.user.id });
  if (!interviewer) {
    res.status(404); throw new Error('Interviewer profile not found');
  }
  if (currentEmployer) interviewer.currentEmployer = currentEmployer;
  if (jobTitle) interviewer.jobTitle = jobTitle;
  if (yearsOfExperience !== undefined) interviewer.yearsOfExperience = yearsOfExperience;
  if (companyType) interviewer.companyType = companyType;
  await interviewer.save();
  logEvent('interviewer_profile_updated', { interviewerId: interviewer._id, userId: req.user.id });
  res.json({ success: true, data: interviewer, message: 'Profile updated successfully' });
});

const updateBankDetails = asyncHandler(async (req, res) => {
  const { accountName, accountNumber, bankName, ifscCode } = req.body;
  if (!accountName || !accountNumber || !bankName || !ifscCode) {
    res.status(400);
    throw new Error('All bank details fields are required');
  }
  const interviewer = await Interviewer.findOne({ user: req.user.id });
  if (!interviewer) {
    res.status(404); throw new Error('Interviewer profile not found');
  }
  interviewer.bankDetails = { accountName, accountNumber, bankName, ifscCode };
  await interviewer.save();
  logEvent('interviewer_bank_details_updated', { interviewerId: interviewer._id, userId: req.user.id });
  res.json({ success: true, message: 'Bank details updated successfully' });
});

const getMetrics = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id });
    if (!interviewer) {
      res.status(404);
      throw new Error('Interviewer profile not found');
    }

    // Get today's date at the beginning of the day (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [scheduledCount, completedCount, cancelledCount, upcomingInterviews] = await Promise.all([
        MainSheetEntry.countDocuments({ interviewer: interviewer._id, interviewStatus: 'Scheduled' }),
        MainSheetEntry.countDocuments({ interviewer: interviewer._id, interviewStatus: 'Completed' }),
        MainSheetEntry.countDocuments({ interviewer: interviewer._id, interviewStatus: 'Cancelled' }),
        MainSheetEntry.find({ 
            interviewer: interviewer._id, 
            interviewStatus: 'Scheduled',
            interviewDate: { $gte: today } // Only today and future dates
        }).sort({ interviewDate: 1, interviewTime: 1 }).limit(5)
    ]);
    
    // Safely parse payment amount
    const paymentAmount = parseInt(String(interviewer.paymentAmount).replace(/[^0-9]/g, ''), 10) || 0;
    const totalEarnings = completedCount * paymentAmount;
    
    res.json({
      success: true,
      data: {
        scheduledCount,
        completedCount,
        cancelledCount,
        totalEarnings,
        upcomingInterviews,
        status: interviewer.status,
      },
    });
});

const getBookingRequests = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id }).select('_id');
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found');
    }

    const requests = await InterviewBooking.find({
        'interviewers.interviewer': interviewer._id,
        status: 'Open'
    })
    .select('bookingDate interviewers status')
    .sort({ bookingDate: -1 });

    const personalRequests = requests.map(booking => {
        const myRequest = booking.interviewers.find(
            i => i.interviewer.toString() === interviewer._id.toString()
        );
        return {
            bookingId: booking._id,
            bookingDate: booking.bookingDate,
            status: myRequest.status,
            providedSlots: myRequest.providedSlots,
        };
    });
    
    res.json({ success: true, data: personalRequests });
});

const submitTimeSlots = asyncHandler(async (req, res) => {
    const { slots, remarks } = req.body;
    const { bookingId } = req.params;
    
    const interviewer = await Interviewer.findOne({ user: req.user.id }).select('_id');
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found');
    }
    
    const booking = await InterviewBooking.findById(bookingId);
    if (!booking) {
        res.status(404);
        throw new Error('Booking request not found.');
    }

    const interviewerSubDoc = booking.interviewers.find(i => i.interviewer.toString() === interviewer._id.toString());
    if (!interviewerSubDoc) {
        res.status(403);
        throw new Error('You are not part of this booking request.');
    }
    interviewerSubDoc.providedSlots = slots;
    interviewerSubDoc.status = 'Submitted';
    interviewerSubDoc.remarks = remarks || '';
    interviewerSubDoc.submittedAt = new Date();
    
    await booking.save();

    logEvent('interviewer_slots_submitted', {
        bookingId: booking._id,
        interviewerId: interviewer._id,
    });
    
    res.json({ success: true, message: 'Time slots submitted successfully.' });
});

const declineBookingRequest = asyncHandler(async (req, res) => {
    const { remarks } = req.body;
    const { bookingId } = req.params;

    if (!remarks) {
        res.status(400);
        throw new Error('Remarks are required when declining a request.');
    }

    const interviewer = await Interviewer.findOne({ user: req.user.id }).select('_id');
    if (!interviewer) {
        res.status(404);
        throw new Error('Interviewer profile not found');
    }

    const booking = await InterviewBooking.findById(bookingId);
    if (!booking) {
        res.status(404);
        throw new Error('Booking request not found.');
    }

    const interviewerSubDoc = booking.interviewers.find(i => i.interviewer.toString() === interviewer._id.toString());
    if (!interviewerSubDoc) {
        res.status(403);
        throw new Error('You are not part of this booking request.');
    }

    interviewerSubDoc.status = 'Not Available';
    interviewerSubDoc.remarks = remarks;
    interviewerSubDoc.providedSlots = [];
    interviewerSubDoc.submittedAt = new Date();

    await booking.save();

    logEvent('interviewer_request_declined', {
        bookingId: booking._id,
        interviewerId: interviewer._id,
    });
    
    res.json({ success: true, message: 'Request declined successfully.' });
});

const addExperience = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id });
    if (!interviewer) { res.status(404); throw new Error('Interviewer not found'); }
    interviewer.experiences.push(req.body);
    await interviewer.save();
    res.status(201).json({ success: true, data: interviewer.experiences });
});

const updateExperience = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id });
    const experience = interviewer.experiences.id(req.params.expId);
    if (!experience) { res.status(404); throw new Error('Experience not found'); }
    
    Object.assign(experience, req.body);
    await interviewer.save();
    res.json({ success: true, data: interviewer.experiences });
});

const deleteExperience = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id });
    const experience = interviewer.experiences.id(req.params.expId);
    if (!experience) {
        res.status(404);
        throw new Error('Experience not found');
    }
    experience.deleteOne();
    await interviewer.save();
    res.json({ success: true, data: interviewer.experiences });
});

const addSkill = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id });
    if (!interviewer) { res.status(404); throw new Error('Interviewer not found'); }
    interviewer.skills.push(req.body);
    await interviewer.save();
    res.status(201).json({ success: true, data: interviewer.skills });
});

const updateSkill = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id });
    const skill = interviewer.skills.id(req.params.skillId);
    if (!skill) { res.status(404); throw new Error('Skill not found'); }

    Object.assign(skill, req.body);
    await interviewer.save();
    res.json({ success: true, data: interviewer.skills });
});

const deleteSkill = asyncHandler(async (req, res) => {
    const interviewer = await Interviewer.findOne({ user: req.user.id });
    const skill = interviewer.skills.id(req.params.skillId);
    if (!skill) { res.status(404); throw new Error('Skill not found'); }
    
    skill.deleteOne();
    await interviewer.save();
    res.json({ success: true, data: interviewer.skills });
});


module.exports = {
  getProfile,
  updateProfile,
  updateBankDetails,
  getMetrics,
  getBookingRequests,
  submitTimeSlots,
  declineBookingRequest,
  addExperience,
  updateExperience,
  deleteExperience,
  addSkill,
  updateSkill,
  deleteSkill,
  getAssignedInterviews,
  updateAssignedInterviewStatus,
  // --- MODIFICATION: Export new function ---
  getAssignedDomains,
  getEvaluationDataForInterviewer,
  updateEvaluationData,
  getPaymentHistory, 
  subscribeToPushNotifications,
  getInterviewerEvaluationSummary
};
