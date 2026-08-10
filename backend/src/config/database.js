const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4
            maxPoolSize: 10,
            minPoolSize: 2
        });

        console.log('\n=================================');
        console.log('✅ MongoDB Atlas Connected!');
        console.log('=================================');
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🌐 Host: ${conn.connection.host}`);
        console.log(`🔗 Port: ${conn.connection.port}`);
        console.log(`📦 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}`);
        console.log(`📚 Collections: ${(await conn.connection.db.listCollections().toArray()).length}`);
        console.log('=================================\n');

        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('🔄 MongoDB reconnected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        return conn;
    } catch (error) {
        console.error('\n❌ MongoDB Connection Failed!');
        console.error('=================================');
        console.error(`Error: ${error.message}`);

        // Helpful troubleshooting
        if (error.message.includes('bad auth')) {
            console.error('\n🔑 AUTHENTICATION FAILED:');
            console.error('   → Check your username (use: myuser or admin)');
            console.error('   → Check your password (the one you set in Atlas)');
            console.error('   → Make sure the user has proper permissions');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error('\n🌐 NETWORK ERROR:');
            console.error('   → Check your internet connection');
            console.error('   → Verify the cluster URL is correct');
            console.error(`   → Cluster: ${process.env.MONGODB_URI.split('@')[1]?.split('?')[0] || 'unknown'}`);
        } else if (error.message.includes('whitelist') || error.message.includes('IP')) {
            console.error('\n🛡️ IP WHITELIST ISSUE:');
            console.error('   → Your IP is not whitelisted in MongoDB Atlas');
            console.error('   → Go to Atlas → Network Access → Add IP Address');
            console.error(`   → Current IP: https://api.ipify.org`);
        }

        console.error('=================================\n');
        process.exit(1);
    }
};

module.exports = connectDB;