import Notification from '../models/Notification.js';

// GET /api/notifications?page=1&limit=20
export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { receiver: req.user._id };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    return res.status(200).json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
  }
};

// PUT /api/notifications/:id/read
export const markRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, receiver: req.user._id },
      { isRead: true },
      { new: true }
    ).populate('sender', 'name avatar');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found or access denied' });
    }

    const unreadCount = await Notification.countDocuments({ receiver: req.user._id, isRead: false });

    return res.status(200).json({ notification, unreadCount });
  } catch (error) {
    console.error('markRead error:', error);
    return res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// PUT /api/notifications/read-all
export const markAllRead = async (req, res) => {
  try {
    const receiver = req.user._id;
    await Notification.updateMany({ receiver, isRead: false }, { isRead: true });

    return res.status(200).json({ message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error) {
    console.error('markAllRead error:', error);
    return res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
};
