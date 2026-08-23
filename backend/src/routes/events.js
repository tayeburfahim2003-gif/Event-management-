const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getMyEvents,
    getEventFeedback
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { validateEvent, validate } = require('../middleware/validation');

// Public routes
router.get('/', getEvents);

// Protected routes (must come before the generic '/:id' route below,
// otherwise Express matches "my-events" as an :id and errors out)
router.get('/my-events', protect, getMyEvents);
router.post('/', protect, authorize('organizer', 'admin'), validateEvent, validate, createEvent);

// Public routes with a param (declared last so they don't swallow the routes above)
router.get('/:id', getEvent);
router.get('/:id/feedback', getEventFeedback);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;