const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function nuclearFix() {
  try {
    console.log('🚨 NUCLEAR FIX: Dropping and recreating orders collection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    // Backup existing data
    console.log('\n📦 Backing up existing data...');
    const existingData = await ordersCollection.find({}).toArray();
    console.log(`Found ${existingData.length} documents to backup`);

    // Drop the entire collection
    console.log('\n🗑️ Dropping orders collection...');
    await ordersCollection.drop();
    console.log('✅ Collection dropped');

    // Wait a moment for MongoDB to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Recreate collection with new schema
    console.log('\n🔄 Recreating collection...');
    await db.createCollection('orders');
    console.log('✅ Collection recreated');

    // Restore data with new schema (if any)
    if (existingData.length > 0) {
      console.log('\n🔄 Restoring data with new schema...');
      const restoredData = existingData.map(doc => ({
        tokenAddress: doc.tokenAddress || doc.tokenContractAddress,
        symbol: (doc.symbol || doc.tokenSymbol || '').toUpperCase(),
        userAddress: doc.userAddress || doc.walletAddress,
        amountInUsd: doc.amountInUsd || doc.usdAmount || doc.totalValue,
        tokenAmount: doc.tokenAmount || doc.amount,
        amountInSol: doc.amountInSol || doc.solAmount,
        type: doc.type || (doc.orderType === 'buy' ? 'BUY' : 'SELL'),
        txHash: doc.txHash || doc.transactionHash,
        feeInUsd: doc.feeInUsd || doc.feeInUSD || 0,
        tokenPrice: doc.tokenPrice || doc.price,
        timestamp: doc.timestamp || doc.createdAt || new Date(),
        realizedPNL: doc.realizedPNL || null
      }));

      if (restoredData.length > 0) {
        await ordersCollection.insertMany(restoredData);
        console.log(`✅ Restored ${restoredData.length} documents`);
      }
    }

    // Verify no indexes exist
    console.log('\n🔍 Verifying no indexes exist...');
    const indexes = await ordersCollection.indexes();
    console.log('Current indexes:', indexes.length);
    indexes.forEach(index => {
      console.log(`- ${index.name}:`, JSON.stringify(index.key));
    });

    await mongoose.disconnect();
    console.log('\n✅ Nuclear fix completed!');
    console.log('🚀 Restart your backend now');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

nuclearFix(); 