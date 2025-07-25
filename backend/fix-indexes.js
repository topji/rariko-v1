const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function fixIndexes() {
  try {
    console.log('🔧 FIXING INDEXES: Comprehensive index cleanup...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    // Get current indexes
    console.log('\n📊 Current indexes before fix:');
    const currentIndexes = await ordersCollection.indexes();
    currentIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    // List of ALL possible problematic indexes
    const allPossibleIndexes = [
      'buyTxHash_1',
      'user_1_createdAt_-1',
      'orderType_1_status_1',
      'tokenSymbol_1',
      'transactionHash_1',
      'createdAt_-1',
      'userAddress_1_timestamp_-1',
      'symbol_1_timestamp_-1',
      'type_1',
      'symbol_1',
      'txHash_1',
      'timestamp_-1',
      'userAddress_1',
      'tokenAddress_1',
      'walletAddress_1',
      'tokenContractAddress_1'
    ];

    console.log('\n🗑️ Attempting to drop all possible indexes...');
    for (const indexName of allPossibleIndexes) {
      try {
        await ordersCollection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (error) {
        if (error.code === 26) {
          console.log(`ℹ️ Index doesn't exist: ${indexName}`);
        } else {
          console.log(`⚠️ Error dropping ${indexName}:`, error.message);
        }
      }
    }

    // Drop all indexes except _id (nuclear approach)
    console.log('\n🚨 Nuclear approach: Dropping ALL indexes except _id...');
    try {
      const allIndexes = await ordersCollection.indexes();
      for (const index of allIndexes) {
        if (index.name !== '_id_') {
          try {
            await ordersCollection.dropIndex(index.name);
            console.log(`✅ Dropped: ${index.name}`);
          } catch (error) {
            console.log(`⚠️ Couldn't drop ${index.name}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Nuclear drop failed:', error.message);
    }

    // Verify final state
    console.log('\n🔍 Final index state:');
    const finalIndexes = await ordersCollection.indexes();
    console.log('Total indexes:', finalIndexes.length);
    finalIndexes.forEach(index => {
      console.log(`- ${index.name}:`, JSON.stringify(index.key));
    });

    // Test document insertion
    console.log('\n🧪 Testing document insertion...');
    try {
      const testDoc = {
        tokenAddress: 'TEST_TOKEN',
        symbol: 'TEST',
        userAddress: 'TEST_USER',
        amountInUsd: 1,
        tokenAmount: 1,
        amountInSol: 0.01,
        type: 'BUY',
        txHash: 'TEST_TX_HASH',
        feeInUsd: 0.01,
        tokenPrice: 1,
        timestamp: new Date(),
        realizedPNL: null
      };

      const result = await ordersCollection.insertOne(testDoc);
      console.log('✅ Test document inserted successfully:', result.insertedId);

      // Clean up test document
      await ordersCollection.deleteOne({ _id: result.insertedId });
      console.log('✅ Test document cleaned up');
    } catch (error) {
      console.error('❌ Test insertion failed:', error.message);
    }

    await mongoose.disconnect();
    console.log('\n✅ Index fix completed!');
    console.log('🚀 Restart your backend now');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndexes(); 