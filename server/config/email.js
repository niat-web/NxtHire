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
  // --- START MODIFICATION ---
  // Using the built-in 'gmail' service is more reliable on hosting platforms
  // as it handles connection details (host, port, security) automatically.
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  // --- END MODIFICATION ---
  
  return transporter;
};

module.exports = {
  createTransporter
};
