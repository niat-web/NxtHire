// server/app.js
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const { requestLogger } = require('./middleware/logger.middleware');

// Load env vars
dotenv.config();

// Initialize Express
const app = express();

// Render (and most modern hosts) sit behind a reverse proxy that forwards the
// real client IP via X-Forwarded-For. Without `trust proxy`, express-rate-limit
// throws a ValidationError because it can't safely identify users. `1` trusts a
// single hop (the platform's edge), which is what Render uses.
app.set('trust proxy', 1);

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS - whitelist client URL
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:3000', 'http://localhost:5173', process.env.CLIENT_URL].filter(Boolean),
  credentials: true,
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Set static folder for email templates preview if needed
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// Mount routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/applicant', require('./routes/applicant.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/interviewer', require('./routes/interviewer.routes'));
app.use('/api/public-bookings', require('./routes/public.routes'));

// Legacy / external-monitor probe paths — return 200 silently so they don't
// generate 404s in the logs. These never existed as real endpoints; they
// appear to come from an external uptime monitor or stale browser cache.
app.get('/api/users', (_req, res) => {
  res.json({ success: true, message: 'This endpoint has moved. Authenticated admins should use /api/admin/users.' });
});

// Basic route for API health check
app.get('/', (req, res) => {
  res.json({
    message: 'NxtWave Interviewer API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
