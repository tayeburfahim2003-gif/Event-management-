const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: true,
        enum: ['academic', 'sports', 'cultural', 'workshop', 'conference', 'social', 'career', 'other']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    venue: {
        type: String,
        required: [true, 'Venue is required'],
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    registeredCount: {
        type: Number,
        default: 0
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizerName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'ongoing', 'completed', 'cancelled'],
        default: 'pending'
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/800x400?text=Event+Image'
    },
    isGreen: {
        type: Boolean,
        default: false
    },
    greenInitiatives: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    prerequisites: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    contactPhone: {
        type: String
    },
    feedbackLink: {
        type: String
    },
    certificateTemplate: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
EventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Check if event is full
EventSchema.methods.isFull = function() {
    return this.registeredCount >= this.capacity;
};

// Check if event is ongoing
EventSchema.methods.isOngoing = function() {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
};

// Text index to support efficient keyword search across title/description/venue
EventSchema.index({ title: 'text', description: 'text', venue: 'text' });

module.exports = mongoose.model('Event', EventSchema);