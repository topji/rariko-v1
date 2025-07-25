const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function testGetAllOrders() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Order = require('./models/Order');
    
    console.log('\n📊 Testing getAllOrders...');
    
    // Test 1: Get all orders
    const allOrders = await Order.find({}).sort({ timestamp: -1 }).limit(100);
    console.log(`Found ${allOrders.length} total orders`);
    
    if (allOrders.length > 0) {
      console.log('\n📋 Sample order:');
      console.log(JSON.stringify(allOrders[0], null, 2));
    }
    
    // Test 2: Get orders for a specific user (if any orders exist)
    if (allOrders.length > 0) {
      const userAddress = allOrders[0].userAddress;
      const userOrders = await Order.find({ userAddress }).sort({ timestamp: -1 }).limit(100);
      console.log(`\n👤 Found ${userOrders.length} orders for user ${userAddress}`);
    }
    
    console.log('\n✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testGetAllOrders(); 