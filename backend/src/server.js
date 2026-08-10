const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        status: 'OK',
        message: 'Server is running',
        database: states[dbState] || 'unknown',
        databaseName: mongoose.connection.name || 'N/A',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use(errorHandler);

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/green_university', {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(async() => {
        console.log('\n=================================');
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        console.log('=================================\n');

        await seedAdmin();

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log('=================================');
            console.log('🚀 SERVER STARTED SUCCESSFULLY');
            console.log('=================================');
            console.log(`📡 API URL: http://localhost:${PORT}/api`);
            console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
            console.log(`📧 Admin: ${process.env.ADMIN_EMAIL || 'admin@greenuniversity.edu'}`);
            console.log(`🔑 Admin Pass: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
            console.log('=================================\n');
        });
    })
    .catch(err => {
        console.error('\n❌ MongoDB Connection Failed!');
        console.error('=================================');
        console.error(`Error: ${err.message}`);
        console.error('=================================\n');
        process.exit(1);
    });

// Seed admin
async function seedAdmin() {
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@greenuniversity.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    try {
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            await User.create({
                name: 'System Administrator',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                department: 'Administration',
                isVerified: true
            });
            console.log('✅ Admin user seeded successfully!');
            console.log(`📧 Email: ${adminEmail}`);
            console.log(`🔑 Password: ${adminPassword}`);
        } else {
            console.log('ℹ️ Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
}

process.on('SIGINT', async() => {
    console.log('\n⚠️ Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
});