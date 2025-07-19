// server/server.js
const app = require('./app');
const connectDB = require('./config/db');
const colors = require('colors');
const { initializeAutomationJobs } = require('./services/automation.service');
const { createInitialAdmin } = require('./services/auth.service');

// Set up unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`.red.bold);
  console.error(err.stack);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

// Connect to database
const startServer = async () => {
  try {
    await connectDB();
    
    // Create initial admin if none exists
    await createInitialAdmin();
    
    // Start automation jobs
    initializeAutomationJobs();
    
    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error(`Error starting server: ${error.message}`.red.bold);
    process.exit(1);
  }
};

startServer();