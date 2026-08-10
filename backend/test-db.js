require('dotenv').config();
const mongoose = require('mongoose');

async function testDatabase() {
    console.log('\n=================================');
    console.log('🔍 Testing Local MongoDB Connection');
    console.log('=================================');

    // Show connection string (hide password for security)
    const hiddenURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/green_university';
    console.log(`📡 Connection: ${hiddenURI}`);
    console.log('=================================\n');

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/green_university', {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ CONNECTION SUCCESSFUL! 🎉');
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🌐 Host: ${conn.connection.host}`);
        console.log(`🔗 Port: ${conn.connection.port}`);
        console.log(`🔗 State: Connected ✅`);

        // Test write operation
        const testCollection = conn.connection.db.collection('_test');
        await testCollection.insertOne({
            test: true,
            timestamp: new Date(),
            message: 'Hello from Green University!'
        });
        console.log('✍️ Write test: ✅ Success');

        // Read test
        const result = await testCollection.findOne({ test: true });
        console.log('📖 Read test: ✅ Success');
        console.log(`   Data: ${JSON.stringify(result)}`);

        // Clean up
        await testCollection.deleteOne({ test: true });
        console.log('🗑️ Cleanup: ✅ Success');

        // List existing collections
        const collections = await conn.connection.db.listCollections().toArray();
        console.log(`\n📚 Collections (${collections.length}):`);
        if (collections.length === 0) {
            console.log('   (No collections yet - ready to go!)');
        } else {
            collections.forEach(col => console.log(`   - ${col.name}`));
        }

        await mongoose.connection.close();
        console.log('\n✅ TEST COMPLETE! All checks passed.');
        console.log('=================================\n');
        console.log('🚀 You can now start your server with: npm run dev');
        console.log('=================================\n');

    } catch (error) {
        console.error('\n❌ CONNECTION FAILED!');
        console.error('=================================');
        console.error(`Error: ${error.message}`);

        // Troubleshooting
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n🔧 MONGODB NOT RUNNING:');
            console.error('→ MongoDB is not running on your computer');
            console.error('→ Start MongoDB with: net start MongoDB');
            console.error('→ Or download from: https://www.mongodb.com/try/download/community');
        } else if (error.message.includes('Authentication')) {
            console.error('\n🔑 AUTHENTICATION ERROR:');
            console.error('→ Local MongoDB usually doesn\'t need authentication');
            console.error('→ Check if you have auth enabled in MongoDB');
        }

        console.error('=================================\n');
        process.exit(1);
    }
}

testDatabase();