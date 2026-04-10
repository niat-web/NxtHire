const asyncHandler = require('express-async-handler');
const NotificationSettings = require('../models/NotificationSettings');

// Helper to get or create the singleton settings document
const getOrCreateSettings = async () => {
  let settings = await NotificationSettings.findOne({ key: 'global' });
  if (!settings) {
    settings = await NotificationSettings.create({ key: 'global' });
  }
  return settings;
};

// @desc    Get notification settings
// @route   GET /api/admin/notification-settings
// @access  Private/Admin
const getNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings });
});

// @desc    Update notification settings
// @route   PUT /api/admin/notification-settings
// @access  Private/Admin
const updateNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  // Only update fields that are present in the request body
  const allowedFields = Object.keys(NotificationSettings.schema.paths).filter(
    f => f !== '_id' && f !== '__v' && f !== 'key' && f !== 'createdAt' && f !== 'updatedAt'
  );

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });

  await settings.save();
  res.json({ success: true, data: settings, message: 'Notification settings updated.' });
});

// @desc    Check if a specific notification is enabled
// @route   Used internally by other services
const isNotificationEnabled = async (key) => {
  const settings = await getOrCreateSettings();
  return settings[key] !== false; // Default to true if field doesn't exist
};

module.exports = {
  getNotificationSettings,
  updateNotificationSettings,
  isNotificationEnabled,
};
