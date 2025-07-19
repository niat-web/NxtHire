// client/src/templates/whatsapp/welcome.js
// Template for WhatsApp welcome message
module.exports = (data) => {
    const { firstName, portalLink, supportContact } = data;
    
    return `🎉 *Welcome to NxtWave Interviewer Program!*
  
  Hello ${firstName},
  
  You have successfully joined our interviewer network. We're excited to have you on board!
  
  *Getting Started:*
  1️⃣ Complete your profile 
  2️⃣ Set your availability
  3️⃣ Start receiving interview assignments
  
  📱 Access your interviewer portal: ${portalLink}
  
  Need help? Contact us at ${supportContact}
  
  *NxtWave Interviewer Team*`;
  };