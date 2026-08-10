const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { createNotification } = require('./notificationController');

// ============================================
// GET DASHBOARD STATS
// ============================================
const getDashboardStats = async(req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalRegistrations = await Registration.countDocuments();
        const pendingEvents = await Event.countDocuments({ status: 'pending' });

        res.status(200).json({
            success: true,
            data: { totalUsers, totalEvents, totalRegistrations, pendingEvents }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// APPROVE EVENT
// ============================================
const approveEvent = async(req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        event.status = 'approved';
        await event.save();

        await createNotification(
            event.organizerId,
            'event_approved',
            'Event Approved! 🎉',
            `Your event "${event.title}" has been approved and is now live for registration.`, { eventId: event._id }
        );

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// REJECT EVENT
// ============================================
const rejectEvent = async(req, res) => {
    try {
        const { reason } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        event.status = 'rejected';
        await event.save();

        await createNotification(
            event.organizerId,
            'event_rejected',
            'Event Rejected ❌',
            `Your event "${event.title}" was rejected. Reason: ${reason || 'No reason provided'}`, { eventId: event._id }
        );

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// GET ALL USERS
// ============================================
const getUsers = async(req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE USER
// ============================================
const deleteUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
        }

        await user.remove();
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
    getDashboardStats,
    approveEvent,
    rejectEvent,
    getUsers,
    deleteUser
};