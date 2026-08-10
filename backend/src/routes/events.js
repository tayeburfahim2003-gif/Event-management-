const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getMyEvents
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { validateEvent, validate } = require('../middleware/validation');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.get('/my-events', protect, getMyEvents);
router.post('/', protect, authorize('organizer', 'admin'), validateEvent, validate, createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;