// server/services/whatsapp.service.js
const { createWhatsAppClient } = require('../config/whatsapp');
const Communication = require('../models/Communication');
const { logEvent, logError } = require('../middleware/logger.middleware');

/**
 * Sends a pre-approved WhatsApp message template.
 * @param {object} options - The options for the message.
 * @param {mongoose.Types.ObjectId} options.recipient - The ID of the recipient document.
 * @param {string} options.recipientModel - The model of the recipient (e.g., 'Applicant', 'Interviewer').
 * @param {string} options.recipientPhone - The destination phone number.
 * @param {string} options.recipientEmail - The recipient's email for logging purposes.
 * @param {string} options.templateName - The exact name of the approved template on Meta.
 * @param {Array<string>} options.templateParams - An array of strings to fill the template's variables (e.g., {{1}}, {{2}}).
 * @param {string} options.relatedTo - A description of the communication's purpose.
 * @param {mongoose.Types.ObjectId} [options.sentBy] - The user ID of the sender, if applicable.
 * @param {boolean} [options.isAutomated=true] - Whether the message was sent automatically.
 * @param {object} [options.metadata={}] - Additional metadata to store.
 * @returns {Promise<object>} An object indicating success or failure.
 */
const sendWhatsAppMessage = async (options) => {
    try {
      const {
        recipient,
        recipientModel,
        recipientPhone,
        recipientEmail,
        templateName,
        templateParams,
        relatedTo,
        sentBy,
        isAutomated = true,
        metadata = {}
      } = options;
  
      // Format phone number to E.164 format with Indian country code
      const formattedPhone = formatPhoneNumber(recipientPhone);
      
      // Build the API payload for a TEMPLATE message
      const messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: 'en_US' // Assuming English (US) as the language
            },
            components: [{
                type: 'body',
                parameters: (templateParams || []).map(param => ({
                    type: 'text',
                    text: String(param) // Ensure parameters are strings
                }))
            }]
        }
      };
      
      // Create and use the WhatsApp API client
      const client = createWhatsAppClient();
      const response = await client.post(
        `/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        messagePayload
      );
  
      // Log the communication to our database
      const communication = await Communication.create({
        recipient,
        recipientModel,
        recipientEmail,
        recipientPhone: formattedPhone,
        communicationType: 'WhatsApp',
        templateName,
        subject: null, // Not applicable for WhatsApp
        content: `Template '${templateName}' sent to ${formattedPhone}.`, // Log content is for internal reference
        status: response.data && response.data.messages ? 'Sent' : 'Failed',
        relatedTo,
        sentBy,
        isAutomated,
        metadata: {
          ...metadata,
          whatsappMessageId: response.data?.messages?.[0]?.id,
          params: templateParams
        },
        sentAt: new Date()
      });
  
      logEvent('whatsapp_sent', {
        communicationId: communication._id,
        recipientPhone: formattedPhone,
        templateName
      });
  
      return {
        success: true,
        communicationId: communication._id,
        whatsappMessageId: response.data?.messages?.[0]?.id
      };
    } catch (error) {
      logError('whatsapp_send_failed', error, {
        recipientPhone: options.recipientPhone,
        templateName: options.templateName
      });
      
      try {
        await Communication.create({
          recipient: options.recipient,
          recipientModel: options.recipientModel,
          recipientEmail: options.recipientEmail,
          recipientPhone: options.recipientPhone,
          communicationType: 'WhatsApp',
          templateName: options.templateName,
          content: `Failed to send message. Error: ${error.message}`,
          status: 'Failed',
          relatedTo: options.relatedTo,
          sentBy: options.sentBy,
          isAutomated: options.isAutomated || true,
          metadata: {
            ...options.metadata,
            error: error.message
          }
        });
      } catch (dbError) {
        logError('whatsapp_log_failed', dbError);
      }
  
      return {
        success: false,
        error: error.message
      };
    }
  };
  
/**
 * Formats a phone number to E.164 standard for the WhatsApp API.
 * @param {string} phoneNumber The phone number to format.
 * @returns {string} The formatted phone number.
 */
const formatPhoneNumber = (phoneNumber) => {
    let cleaned = String(phoneNumber || '').replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }
    return cleaned;
};

/**
 * Sends a welcome message to a newly onboarded interviewer.
 * @param {object} user The user object.
 * @param {object} applicant The applicant object.
 * @returns {Promise<object>} A promise that resolves to the result of the send operation.
 */
const sendWelcomeWhatsApp = async (user, applicant) => {
    const phone = applicant.whatsappNumber || user.whatsappNumber;
    if (!phone) {
        logEvent('whatsapp_skipped', { reason: 'No WhatsApp number available', userId: user._id });
        return { success: false, error: 'WhatsApp number not available' };
    }
    
    return await sendWhatsAppMessage({
      recipient: applicant._id,
      recipientModel: 'Applicant',
      recipientPhone: phone,
      recipientEmail: user.email,
      templateName: 'interviewer_welcome',
      templateParams: [user.firstName],
      relatedTo: 'Onboarding',
      isAutomated: true,
      metadata: { userId: user._id }
    });
};

/**
 * Updates the status of a WhatsApp message from a webhook callback.
 * @param {string} messageId The ID of the WhatsApp message.
 * @param {string} status The new status from the webhook.
 * @returns {Promise<boolean>} True if the update was successful, false otherwise.
 */
const updateMessageStatus = async (messageId, status) => {
    try {
      const communication = await Communication.findOne({
        'metadata.whatsappMessageId': messageId,
        communicationType: 'WhatsApp'
      });
      
      if (communication) {
        communication.status = mapWhatsAppStatus(status);
        communication.statusLog.push({
          status: communication.status,
          timestamp: new Date(),
          details: `WhatsApp status: ${status}`
        });
        await communication.save();
        logEvent('whatsapp_status_updated', {
          communicationId: communication._id,
          status: communication.status,
          whatsappStatus: status
        });
        return true;
      }
      return false;
    } catch (error) {
      logError('whatsapp_status_update_failed', error, { messageId, status });
      return false;
    }
};

/**
 * Maps the status from a WhatsApp webhook to the application's internal status enums.
 * @param {string} whatsappStatus The status from the WhatsApp webhook.
 * @returns {string} The corresponding internal status.
 */
const mapWhatsAppStatus = (whatsappStatus) => {
    switch (String(whatsappStatus || '').toLowerCase()) {
      case 'sent': return 'Sent';
      case 'delivered': return 'Delivered';
      case 'read': return 'Read';
      case 'failed':
      case 'rejected': return 'Failed';
      default: return 'Sent'; // Default to 'Sent' if status is unknown
    }
};
  
module.exports = {
  sendWhatsAppMessage,
  sendWelcomeWhatsApp,
  updateMessageStatus
};