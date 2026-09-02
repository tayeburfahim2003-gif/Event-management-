const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async(req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        // Fall back to the httpOnly "remember me" cookie set on login
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized, token failed'
        });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Optional auth - attach req.user if a valid token is present, but never
// block the request if there isn't one (used on public routes that still
// need to know who's asking, e.g. filtering events by approval status).
const optionalAuth = async(req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) req.user = user;
    } catch (error) {
        // Invalid/expired token on a public route: just proceed as a guest
    }

    next();
};

module.exports = { protect, authorize, optionalAuth };