// // server/config/email.js
// const nodemailer = require('nodemailer');

// const createTransporter = () => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: process.env.EMAIL_SECURE === 'true',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });
  
//   return transporter;
// };

// module.exports = {
//   createTransporter
// };



// server/config/email.js
const nodemailer = require('nodemailer');

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // --- ADD THIS BLOCK TO BYPASS CERTIFICATE ISSUE ---
    tls: {
      // This is often required on cloud servers to prevent security blocks 
      // when connecting to commercial SMTP like Gmail or Office 365.
      rejectUnauthorized: false 
    }
    // --- END ADDITION ---
  });
  
  return transporter;
};

module.exports = {
  createTransporter
};
