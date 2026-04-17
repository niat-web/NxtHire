// server/config/whatsapp.js
const axios = require('axios');

const WHATSAPP_API_BASE = 'https://graph.facebook.com/v21.0';

// Create WhatsApp API client using Meta Cloud API
const createWhatsAppClient = () => {
  return axios.create({
    baseURL: WHATSAPP_API_BASE,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
    }
  });
};

module.exports = { createWhatsAppClient };
