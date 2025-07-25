const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function debugIndexes() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    console.log('\n📊 Current Indexes in orders collection:');
    const indexes = await ordersCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n📈 Collection Stats:');
    const stats = await ordersCollection.stats();
    console.log('Total documents:', stats.count);
    console.log('Total size:', stats.size, 'bytes');

    console.log('\n📋 Sample Documents:');
    const sampleDocs = await ordersCollection.find({}).limit(3).toArray();
    sampleDocs.forEach((doc, i) => {
      console.log(`\nDocument ${i + 1}:`);
      console.log('Fields:', Object.keys(doc));
      console.log('ID:', doc._id);
      if (doc.buyTxHash !== undefined) {
        console.log('buyTxHash:', doc.buyTxHash);
      }
      if (doc.txHash !== undefined) {
        console.log('txHash:', doc.txHash);
      }
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugIndexes(); 