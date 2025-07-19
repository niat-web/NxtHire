// server/middleware/logger.middleware.js
const winston = require('winston');
const path = require('path');

// Create winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'interviewer-system' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    // Write all logs with level 'info' and below to 'combined.log'
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    })
  ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Middleware to log requests
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log once the response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};

// Function to log custom events
const logEvent = (eventType, data) => {
  logger.info({
    event: eventType,
    ...data
  });
};

// Function to log errors
const logError = (errorType, error, additionalData = {}) => {
  logger.error({
    error: errorType,
    message: error.message,
    stack: error.stack,
    ...additionalData
  });
};

module.exports = {
  requestLogger,
  logEvent,
  logError
};