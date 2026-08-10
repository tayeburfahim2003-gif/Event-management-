const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validate } = require('../middleware/validation');

router.post('/register', validateRegister, validate, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update', protect, updateProfile);

module.exports = router;