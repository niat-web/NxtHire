// server/config/email.js
const brevoConfig = {
  apiUrl: 'https://api.brevo.com/v3/smtp/email',
  apiKey: process.env.BREVO_API_KEY,
  senderEmail: process.env.FROM_EMAIL,
  senderName: process.env.FROM_NAME,
};

module.exports = {
  brevoConfig,
};

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
//     // REMOVE the tls: { rejectUnauthorized: false } block entirely.
//   });
  
//   return transporter;
// };

// module.exports = {
//   createTransporter
// };
