const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

/**
 * Create a notification, save to DB, and push via Socket.io to admin room
 */
const pushNotification = async ({ type, title, message, data = {} }) => {
  try {
    const notification = await Notification.create({
      type,
      title,
      message,
      data,
      targetRole: 'admin',
    });

    const io = getIO();
    io.to('admin').emit('new_notification', {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: false,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (err) {
    console.error('Push notification failed:', err.message);
  }
};

module.exports = { pushNotification };
