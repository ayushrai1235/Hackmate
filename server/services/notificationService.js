import Notification from '../models/Notification.js';
import { getIo } from '../socket/index.js';

/**
 * Create a notification in the database and emit it via socket to the receiver.
 * @param {string} receiver - ID of the receiving user
 * @param {string} sender - ID of the sending user (optional)
 * @param {string} type - Notification type (e.g., liked, super_liked, matched, message, team_invite, join_request, request_accepted, team_accepted)
 * @param {string} message - Text message content
 * @param {object} metadata - Additional context data (optional)
 * @returns {Promise<object>} The created and populated notification document
 */
export const createNotification = async (receiver, sender, type, message, metadata = {}) => {
  try {
    const notification = await Notification.create({
      receiver,
      sender: sender || null,
      type,
      message,
      metadata,
    });

    let populated = notification;
    if (sender) {
      populated = await notification.populate('sender', 'name avatar');
    }

    const io = getIo();
    if (io) {
      io.to(`user:${receiver}`).emit('notification:new', populated);
    } else {
      console.warn(`Socket server io instance not available when emitting notification:new to user:${receiver}`);
    }

    return populated;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
