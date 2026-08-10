const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // For faster queries
    },
    type: {
        type: String,
        enum: [
            'event_created', // When someone creates an event
            'event_approved', // When event is approved
            'event_rejected', // When event is rejected
            'event_updated', // When event is updated
            'event_cancelled', // When event is cancelled
            'registration_confirmed', // When user registers
            'registration_cancelled', // When registration is cancelled
            'event_reminder', // 24hr before event
            'check_in', // When checked in
            'certificate_issued', // When certificate is generated
            'feedback_request', // Request for feedback
            'system_alert', // System notifications
            'general' // General notifications
        ],
        default: 'general'
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);