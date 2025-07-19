// server/config/whatsapp.js
const axios = require('axios');

// WhatsApp Business API configuration
const whatsappConfig = {
  apiUrl: process.env.WHATSAPP_API_URL,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN
};

// Create WhatsApp API client
const createWhatsAppClient = () => {
  const client = axios.create({
    baseURL: whatsappConfig.apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${whatsappConfig.accessToken}`
    }
  });
  
  return client;
};

module.exports = {
  whatsappConfig,
  createWhatsAppClient
};