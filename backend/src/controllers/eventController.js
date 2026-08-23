const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { createNotification } = require('./notificationController');

// ============================================
// GET ALL EVENTS
// ============================================
const getEvents = async(req, res) => {
    try {
        const { category, status, search, limit = 20, page = 1 } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { venue: { $regex: search, $options: 'i' } }
            ];
        }

        if (!req.user || req.user.role === 'student') {
            filter.status = 'approved';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const events = await Event.find(filter)
            .populate('organizerId', 'name email department')
            .sort({ startDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// GET SINGLE EVENT
// ============================================
const getEvent = async(req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizerId', 'name email department phoneNumber');

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// CREATE EVENT
// ============================================
const createEvent = async(req, res) => {
    try {
        const {
            title,
            description,
            category,
            startDate,
            endDate,
            venue,
            capacity,
            image,
            isGreen,
            greenInitiatives,
            tags,
            prerequisites,
            contactEmail,
            contactPhone
        } = req.body;

        if (req.user.role === 'student') {
            return res.status(403).json({
                success: false,
                error: 'Students cannot create events. Please register as an organizer.'
            });
        }

        const event = await Event.create({
            title,
            description,
            category,
            startDate,
            endDate,
            venue,
            capacity,
            organizerId: req.user.id,
            organizerName: req.user.name,
            image: image || 'https://via.placeholder.com/800x400?text=Event+Image',
            isGreen: isGreen || false,
            greenInitiatives: greenInitiatives || '',
            tags: tags || [],
            prerequisites: prerequisites || '',
            contactEmail: contactEmail || req.user.email,
            contactPhone: contactPhone || req.user.phoneNumber || '',
            status: req.user.role === 'admin' ? 'approved' : 'pending'
        });

        // Send notification to organizer
        await createNotification(
            req.user.id,
            'event_created',
            'Event Created Successfully',
            `Your event "${event.title}" has been ${event.status === 'pending' ? 'submitted for approval' : 'approved and is now live'}.`, { eventId: event._id }
        );

        if (event.status === 'pending') {
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
                await createNotification(
                    admin._id,
                    'event_created',
                    'New Event Pending Approval',
                    `${req.user.name} created "${event.title}" and needs your approval.`, { eventId: event._id, organizerId: req.user.id }
                );
            }
        }

        res.status(201).json({
            success: true,
            data: event,
            message: event.status === 'pending' ?
                'Event submitted for admin approval' :
                'Event created successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// UPDATE EVENT
// ============================================
const updateEvent = async(req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        if (req.user.role !== 'admin' && event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        if (event.status === 'ongoing' || event.status === 'completed') {
            return res.status(400).json({ success: false, error: 'Cannot update ongoing or completed events' });
        }

        const fields = ['title', 'description', 'category', 'startDate', 'endDate',
            'venue', 'capacity', 'image', 'isGreen', 'greenInitiatives',
            'tags', 'prerequisites', 'contactEmail', 'contactPhone'
        ];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                event[field] = req.body[field];
            }
        });

        if (req.user.role !== 'admin') {
            event.status = 'pending';
        }

        await event.save();

        await createNotification(
            event.organizerId,
            'event_updated',
            'Event Updated',
            `Your event "${event.title}" has been updated and ${event.status === 'pending' ? 'is pending re-approval' : 'is live'}.`, { eventId: event._id }
        );

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE EVENT
// ============================================
const deleteEvent = async(req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        if (req.user.role !== 'admin' && event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await event.remove();

        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// GET MY EVENTS
// ============================================
const getMyEvents = async(req, res) => {
    try {
        const events = await Event.find({ organizerId: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: events });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// GET EVENT FEEDBACK / RATINGS
// ============================================
const getEventFeedback = async(req, res) => {
    try {
        const reviews = await Registration.find({
            eventId: req.params.id,
            feedbackSubmitted: true
        })
            .populate('userId', 'name profilePicture')
            .sort({ registrationDate: -1 });

        const ratings = reviews.map((r) => r.feedbackRating);
        const averageRating = ratings.length
            ? Number((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1))
            : 0;

        res.status(200).json({
            success: true,
            data: {
                averageRating,
                totalReviews: reviews.length,
                reviews: reviews.map((r) => ({
                    _id: r._id,
                    user: r.userId,
                    rating: r.feedbackRating,
                    comment: r.feedbackComment,
                    date: r.registrationDate
                }))
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getMyEvents,
    getEventFeedback
};