const Notification = require('../models/Notification');

// ============================================
// CREATE NOTIFICATION (Helper function)
// ============================================
const createNotification = async(userId, type, title, message, data = {}) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            data
        });
        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error.message);
        return null;
    }
};

// ============================================
// GET USER NOTIFICATIONS
// ============================================
const getNotifications = async(req, res) => {
    try {
        const { limit = 20, page = 1, unreadOnly = false } = req.query;

        const filter = { userId: req.user.id };
        if (unreadOnly === 'true') {
            filter.read = false;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({
            userId: req.user.id,
            read: false
        });

        res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// MARK NOTIFICATION AS READ
// ============================================
const markAsRead = async(req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        if (notification.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        notification.read = true;
        notification.readAt = new Date();
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================
const markAllAsRead = async(req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, read: false }, { read: true, readAt: new Date() });

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE NOTIFICATION
// ============================================
const deleteNotification = async(req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        if (notification.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await notification.remove();

        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// GET UNREAD COUNT
// ============================================
const getUnreadCount = async(req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user.id,
            read: false
        });

        res.status(200).json({ success: true, data: { unreadCount: count } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// SEND BULK NOTIFICATIONS (Admin only)
// ============================================
const sendBulkNotification = async(req, res) => {
    try {
        const { userIds, title, message, type = 'general', data = {} } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, error: 'Please provide an array of user IDs' });
        }

        if (!title || !message) {
            return res.status(400).json({ success: false, error: 'Title and message are required' });
        }

        const notifications = [];
        for (const userId of userIds) {
            const notification = await createNotification(userId, type, title, message, data);
            if (notification) notifications.push(notification);
        }

        res.status(201).json({
            success: true,
            message: `Sent ${notifications.length} notifications`,
            data: notifications
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// SEND TO ALL USERS (Admin only)
// ============================================
const sendToAllUsers = async(req, res) => {
    try {
        const { title, message, type = 'general', data = {} } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, error: 'Title and message are required' });
        }

        const User = require('../models/User');
        const users = await User.find({}, '_id');

        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'No users found' });
        }

        const notifications = [];
        for (const user of users) {
            const notification = await createNotification(user._id, type, title, message, data);
            if (notification) notifications.push(notification);
        }

        res.status(201).json({
            success: true,
            message: `Sent notification to ${notifications.length} users`,
            data: notifications
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    sendBulkNotification,
    sendToAllUsers
};