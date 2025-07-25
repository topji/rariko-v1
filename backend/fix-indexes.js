const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the orders collection
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    console.log('Dropping old indexes...');
    
    // Drop all existing indexes except _id
    const indexes = await ordersCollection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        console.log(`Dropping index: ${index.name}`);
        await ordersCollection.dropIndex(index.name);
      }
    }

    console.log('Creating new indexes...');
    
    // Create new indexes for the simplified Order model
    await ordersCollection.createIndex({ userAddress: 1, timestamp: -1 });
    await ordersCollection.createIndex({ type: 1 });
    await ordersCollection.createIndex({ symbol: 1 });
    await ordersCollection.createIndex({ txHash: 1 });
    await ordersCollection.createIndex({ timestamp: -1 });

    console.log('Indexes fixed successfully!');
    
    // List all indexes to verify
    const newIndexes = await ordersCollection.indexes();
    console.log('Current indexes:');
    newIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixIndexes(); 