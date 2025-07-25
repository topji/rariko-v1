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

    console.log('Checking current indexes...');
    
    // List all current indexes
    const indexes = await ordersCollection.indexes();
    console.log('Current indexes:');
    indexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\nDropping old indexes...');
    
    // Drop specific problematic indexes first
    const problematicIndexes = ['buyTxHash_1', 'user_1_createdAt_-1', 'orderType_1_status_1', 'tokenSymbol_1', 'transactionHash_1', 'createdAt_-1'];
    
    for (const indexName of problematicIndexes) {
      try {
        console.log(`Attempting to drop index: ${indexName}`);
        await ordersCollection.dropIndex(indexName);
        console.log(`✅ Successfully dropped index: ${indexName}`);
      } catch (error) {
        if (error.code === 27) {
          console.log(`ℹ️ Index ${indexName} doesn't exist, skipping...`);
        } else {
          console.log(`⚠️ Error dropping index ${indexName}:`, error.message);
        }
      }
    }

    // Drop any remaining indexes except _id
    const remainingIndexes = await ordersCollection.indexes();
    for (const index of remainingIndexes) {
      if (index.name !== '_id_') {
        try {
          console.log(`Dropping remaining index: ${index.name}`);
          await ordersCollection.dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`⚠️ Error dropping index ${index.name}:`, error.message);
        }
      }
    }

    console.log('\nCreating new indexes...');
    
    // Create new indexes for the simplified Order model
    try {
      await ordersCollection.createIndex({ userAddress: 1, timestamp: -1 });
      console.log('✅ Created index: userAddress_1_timestamp_-1');
    } catch (error) {
      console.log('⚠️ Error creating userAddress index:', error.message);
    }

    try {
      await ordersCollection.createIndex({ type: 1 });
      console.log('✅ Created index: type_1');
    } catch (error) {
      console.log('⚠️ Error creating type index:', error.message);
    }

    try {
      await ordersCollection.createIndex({ symbol: 1 });
      console.log('✅ Created index: symbol_1');
    } catch (error) {
      console.log('⚠️ Error creating symbol index:', error.message);
    }

    try {
      await ordersCollection.createIndex({ txHash: 1 });
      console.log('✅ Created index: txHash_1');
    } catch (error) {
      console.log('⚠️ Error creating txHash index:', error.message);
    }

    try {
      await ordersCollection.createIndex({ timestamp: -1 });
      console.log('✅ Created index: timestamp_-1');
    } catch (error) {
      console.log('⚠️ Error creating timestamp index:', error.message);
    }

    console.log('\nIndexes fixed successfully!');
    
    // List all indexes to verify
    const finalIndexes = await ordersCollection.indexes();
    console.log('\nFinal indexes:');
    finalIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Check if the problematic index still exists
    const buyTxHashIndex = finalIndexes.find(index => index.name === 'buyTxHash_1');
    if (buyTxHashIndex) {
      console.log('\n❌ WARNING: buyTxHash_1 index still exists!');
      console.log('This might cause issues. Please check manually.');
    } else {
      console.log('\n✅ buyTxHash_1 index successfully removed!');
    }

  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixIndexes(); 