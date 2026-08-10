const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import admin controllers
const {
    getDashboardStats,
    approveEvent,
    rejectEvent,
    getUsers,
    deleteUser
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;