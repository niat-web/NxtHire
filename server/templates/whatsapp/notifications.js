// client/src/templates/whatsapp/notifications.js
// Template for WhatsApp notifications
module.exports = (data) => {
    const { firstName, message, actionRequired, actionLink, supportContact } = data;
    
    let template = `*NxtWave Interviewer Notification*
  
  Hello ${firstName},
  
  ${message}`;
  
    if (actionRequired) {
      template += `
  
  *Action Required:* ${actionRequired}`;
    }
  
    if (actionLink) {
      template += `
  
  📱 Link: ${actionLink}`;
    }
  
    template += `
  
  Need help? Contact us at ${supportContact}
  
  *NxtWave Interviewer Team*`;
  
    return template;
  };