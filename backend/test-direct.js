const { MongoClient } = require('mongodb');

async function testDirectConnection() {
    console.log('\n=================================');
    console.log('🔍 Testing MongoDB Connection');
    console.log('=================================');

    const uri = "mongodb://localhost:27017/green_university";

    console.log('📡 Connecting to local MongoDB...');
    console.log(`🔗 URI: ${uri}`);
    console.log('=================================\n');

    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
    });

    try {
        await client.connect();
        console.log('✅ CONNECTION SUCCESSFUL! 🎉');

        const db = client.db('green_university');
        console.log(`📊 Database: ${db.databaseName}`);

        const collection = db.collection('_test');
        await collection.insertOne({
            test: true,
            timestamp: new Date(),
            message: 'Hello from Green University!'
        });
        console.log('✍️ Write test: ✅ Success');

        await collection.deleteOne({ test: true });
        console.log('🗑️ Cleanup: ✅ Success');

        await client.close();
        console.log('\n✅ ALL TESTS PASSED!');
        console.log('=================================\n');
        console.log('🚀 You can now start your server with: npm run dev');

    } catch (error) {
        console.error('\n❌ CONNECTION FAILED!');
        console.error('=================================');
        console.error(`Error: ${error.message}`);
        console.error('\n🔧 TROUBLESHOOTING:');
        console.error('→ MongoDB is not running on your computer');
        console.error('→ Download: https://www.mongodb.com/try/download/community');
        console.error('→ After install, run as Administrator: net start MongoDB');
        console.error('=================================\n');
    }
}

testDirectConnection();