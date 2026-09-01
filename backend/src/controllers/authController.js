const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ============================================
// GENERATE JWT TOKEN
// ============================================
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// ============================================
// REGISTER USER
// ============================================
const register = async(req, res) => {
    try {
        const { name, email, password, role, department, studentId, enrollmentYear } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            department,
            studentId: studentId || null,
            enrollmentYear: enrollmentYear || null
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// LOGIN USER
// ============================================
const login = async(req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        // "Remember me" cookie: httpOnly so client-side JS can't read/tamper
        // with it. With rememberMe, it persists 30 days; otherwise it's a
        // session cookie that disappears when the browser closes.
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };
        if (rememberMe) {
            cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }
        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// LOGOUT USER
// ============================================
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ============================================
// GET CURRENT USER
// ============================================
//save user
const getMe = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// UPDATE PROFILE
// ============================================
const updateProfile = async(req, res) => {
    try {
        const { name, phoneNumber, profilePicture } = req.body;
        const user = await User.findById(req.user.id);

        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
    register,
    login,
    logout,
    getMe,
    updateProfile
};