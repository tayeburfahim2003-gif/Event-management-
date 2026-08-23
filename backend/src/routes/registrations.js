const express = require('express');
const router = express.Router();
const {
    registerForEvent,
    checkIn,
    getUserRegistrations,
    getEventRegistrations,
    cancelRegistration,
    submitFeedback
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes (all registration routes require authentication)
router.use(protect);

router.post('/', registerForEvent);
router.post('/checkin', authorize('organizer', 'admin'), checkIn);
router.get('/user', getUserRegistrations);
router.get('/event/:eventId', getEventRegistrations);
router.put('/:id/feedback', submitFeedback);
router.delete('/:id', cancelRegistration);

module.exports = router;