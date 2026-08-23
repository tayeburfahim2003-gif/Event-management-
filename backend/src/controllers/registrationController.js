const Registration = require('../models/Registration');
const Event = require('../models/Event');
const QRCode = require('qrcode');

// ============================================
// REGISTER FOR EVENT
// ============================================
const registerForEvent = async(req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        if (event.status !== 'approved') {
            return res.status(400).json({ success: false, error: 'Event is not open for registration' });
        }

        if (event.registeredCount >= event.capacity) {
            return res.status(400).json({ success: false, error: 'Event is full' });
        }

        const existingRegistration = await Registration.findOne({ userId, eventId });
        if (existingRegistration) {
            return res.status(400).json({ success: false, error: 'Already registered' });
        }

        const qrData = JSON.stringify({ eventId, userId, timestamp: Date.now() });
        const qrCode = await QRCode.toDataURL(qrData);

        const registration = await Registration.create({ userId, eventId, qrCode });

        event.registeredCount += 1;
        await event.save();

        res.status(201).json({ success: true, data: registration, qrCode });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// CHECK-IN
// ============================================
const checkIn = async(req, res) => {
    try {
        const { qrData } = req.body;
        const parsedData = JSON.parse(qrData);
        const { eventId, userId } = parsedData;

        const registration = await Registration.findOne({ userId, eventId });
        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        if (registration.attendanceStatus === 'checked-in') {
            return res.status(400).json({ success: false, error: 'Already checked in' });
        }

        const event = await Event.findById(eventId);
        if (req.user.role !== 'admin' && event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        registration.attendanceStatus = 'checked-in';
        registration.checkInTime = new Date();
        await registration.save();

        res.status(200).json({ success: true, message: 'Check-in successful', data: registration });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// GET USER REGISTRATIONS
// ============================================
const getUserRegistrations = async(req, res) => {
    try {
        const registrations = await Registration.find({ userId: req.user.id })
            .populate('eventId')
            .sort({ registrationDate: -1 });

        res.status(200).json({ success: true, data: registrations });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// GET EVENT REGISTRATIONS
// ============================================
const getEventRegistrations = async(req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        if (req.user.role !== 'admin' && event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const registrations = await Registration.find({ eventId: req.params.eventId })
            .populate('userId', 'name email department studentId')
            .sort({ registrationDate: -1 });

        res.status(200).json({ success: true, data: registrations });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// CANCEL REGISTRATION
// ============================================
const cancelRegistration = async(req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        if (req.user.role !== 'admin' && registration.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        if (registration.attendanceStatus === 'checked-in') {
            return res.status(400).json({ success: false, error: 'Cannot cancel checked-in registration' });
        }

        const event = await Event.findById(registration.eventId);
        if (event && event.registeredCount > 0) {
            event.registeredCount -= 1;
            await event.save();
        }

        await registration.remove();

        res.status(200).json({ success: true, message: 'Registration cancelled successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// SUBMIT FEEDBACK / RATING FOR AN EVENT
// ============================================
const submitFeedback = async(req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
        }

        const registration = await Registration.findById(req.params.id);
        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        if (registration.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        if (registration.attendanceStatus === 'cancelled') {
            return res.status(400).json({ success: false, error: 'Cannot leave feedback on a cancelled registration' });
        }

        const event = await Event.findById(registration.eventId);
        if (event && new Date(event.endDate) > new Date()) {
            return res.status(400).json({ success: false, error: 'Feedback can only be submitted after the event has ended' });
        }

        registration.feedbackRating = rating;
        registration.feedbackComment = (comment || '').trim();
        registration.feedbackSubmitted = true;
        await registration.save();

        res.status(200).json({ success: true, message: 'Feedback submitted', data: registration });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
    registerForEvent,
    checkIn,
    getUserRegistrations,
    getEventRegistrations,
    cancelRegistration,
    submitFeedback
};