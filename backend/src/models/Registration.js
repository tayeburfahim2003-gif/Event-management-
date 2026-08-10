const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    qrCode: {
        type: String,
        unique: true
    },
    attendanceStatus: {
        type: String,
        enum: ['registered', 'checked-in', 'no-show', 'cancelled'],
        default: 'registered'
    },
    checkInTime: {
        type: Date
    },
    certificateIssued: {
        type: Boolean,
        default: false
    },
    certificateUrl: {
        type: String
    },
    feedbackSubmitted: {
        type: Boolean,
        default: false
    },
    feedbackRating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedbackComment: {
        type: String,
        trim: true
    }
});

// Ensure user can't register twice for same event
RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);