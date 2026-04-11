const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// GET /api/admin/notifications/live — fetch recent notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { limit = 20, unreadOnly } = req.query;
  const query = { targetRole: 'admin' };
  if (unreadOnly === 'true') query.isRead = false;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  const unreadCount = await Notification.countDocuments({ targetRole: 'admin', isRead: false });

  res.json({ success: true, data: { notifications, unreadCount } });
});

// PUT /api/admin/notifications/live/:id/read — mark one as read
const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

// PUT /api/admin/notifications/live/read-all — mark all as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ targetRole: 'admin', isRead: false }, { isRead: true });
  res.json({ success: true });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
