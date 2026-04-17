// server/services/whatsapp.service.js
const { createWhatsAppClient } = require('../config/whatsapp');
const { logEvent, logError } = require('../middleware/logger.middleware');

/**
 * Format phone number to E.164 (Indian default)
 */
const formatPhoneNumber = (phoneNumber) => {
    let cleaned = String(phoneNumber || '').replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (!cleaned.startsWith('91') && cleaned.length === 10) cleaned = `91${cleaned}`;
    return cleaned;
};

/**
 * Core function to send a WhatsApp template message via Meta Cloud API
 */
const sendWhatsAppMessage = async ({ recipientPhone, templateName, templateParams = [], metadata = {} }) => {
    try {
        if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
            return { success: false, error: 'WhatsApp credentials not configured' };
        }

        const formattedPhone = formatPhoneNumber(recipientPhone);
        if (!formattedPhone || formattedPhone.length < 10) {
            return { success: false, error: 'Invalid phone number' };
        }

        const messagePayload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'template',
            template: {
                name: templateName,
                language: { code: 'en' },
                components: templateParams.length > 0 ? [{
                    type: 'body',
                    parameters: templateParams.map(param => ({
                        type: 'text',
                        text: String(param)
                    }))
                }] : []
            }
        };

        const client = createWhatsAppClient();
        const response = await client.post(
            `/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            messagePayload
        );

        const messageId = response.data?.messages?.[0]?.id;

        logEvent('whatsapp_sent', {
            recipientPhone: formattedPhone,
            templateName,
            messageId,
            ...metadata
        });

        return { success: true, messageId };
    } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        logError('whatsapp_send_failed', error, {
            recipientPhone,
            templateName,
            errorDetail: errorMsg
        });
        return { success: false, error: errorMsg };
    }
};

/**
 * Send welcome message to newly onboarded interviewer
 * Template: welcome_interviewer
 * Body: Hello {{1}}, welcome to NxtHire! You have been added as an interviewer. Please check your email to set your password and get started.
 */
const sendWelcomeWhatsApp = async (user, applicant) => {
    // Check notification toggle
    try {
        const { isNotificationEnabled } = require('../controllers/notificationSettings.controller');
        const enabled = await isNotificationEnabled('whatsappInterviewerWelcome');
        if (!enabled) {
            logEvent('whatsapp_skipped_disabled', { userId: user._id });
            return { success: false, skipped: true, reason: 'Disabled by admin' };
        }
    } catch (e) { /* fail-open */ }

    const phone = applicant?.whatsappNumber || applicant?.phoneNumber || user?.phoneNumber;
    if (!phone) {
        return { success: false, error: 'No phone number available' };
    }

    return await sendWhatsAppMessage({
        recipientPhone: phone,
        templateName: 'welcome_interviewer',
        templateParams: [user.firstName || 'there'],
        metadata: { userId: user._id, type: 'welcome' }
    });
};

/**
 * Send booking request notification to interviewer
 * Template: booking_request
 * Body: Hi {{1}}, you have a new interview booking request for {{2}}. Please login to your dashboard and submit your availability.
 */
const sendBookingRequestWhatsApp = async (interviewer, bookingDate) => {
    const phone = interviewer.user?.whatsappNumber || interviewer.user?.phoneNumber;
    if (!phone) return { success: false, error: 'No phone number' };

    const dateStr = new Date(bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return await sendWhatsAppMessage({
        recipientPhone: phone,
        templateName: 'booking_request',
        templateParams: [interviewer.user.firstName || 'there', dateStr],
        metadata: { interviewerId: interviewer._id, type: 'booking_request' }
    });
};

/**
 * Send interview cancelled notification
 * Template: interview_cancelled
 * Body: Hi {{1}}, your interview scheduled on {{2}} has been cancelled. Please check your dashboard for updates.
 */
const sendInterviewCancelledWhatsApp = async (interviewer, interviewDate) => {
    const phone = interviewer.user?.whatsappNumber || interviewer.user?.phoneNumber;
    if (!phone) return { success: false, error: 'No phone number' };

    const dateStr = new Date(interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return await sendWhatsAppMessage({
        recipientPhone: phone,
        templateName: 'interview_cancelled',
        templateParams: [interviewer.user.firstName || 'there', dateStr],
        metadata: { interviewerId: interviewer._id, type: 'interview_cancelled' }
    });
};

/**
 * Send payment confirmation to interviewer
 * Template: payment_confirmation
 * Body: Hi {{1}}, your payment of Rs.{{2}} for {{3}} has been processed successfully. Thank you for your contribution.
 */
const sendPaymentConfirmationWhatsApp = async (interviewer, amount, period) => {
    const phone = interviewer.user?.whatsappNumber || interviewer.user?.phoneNumber;
    if (!phone) return { success: false, error: 'No phone number' };

    return await sendWhatsAppMessage({
        recipientPhone: phone,
        templateName: 'payment_confirmation',
        templateParams: [interviewer.user.firstName || 'there', String(amount), period],
        metadata: { interviewerId: interviewer._id, type: 'payment_confirmation' }
    });
};

module.exports = {
    sendWhatsAppMessage,
    sendWelcomeWhatsApp,
    sendBookingRequestWhatsApp,
    sendInterviewCancelledWhatsApp,
    sendPaymentConfirmationWhatsApp,
    formatPhoneNumber
};
