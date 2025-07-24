const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  username: 'testuser123',
  walletAddress: '1111111111111111111111111111111111111111111111',
  displayName: 'Test User'
};

const testOrder = {
  walletAddress: testUser.walletAddress,
  tokenSymbol: 'AAPL',
  tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount: 10,
  price: 150.50,
  totalValue: 1505.00
};

async function testAPI() {
  console.log('🧪 Testing rizz.money Backend API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check passed:', health.data.message);

    // Test 2: Check if user exists (should be false initially)
    console.log('\n2. Testing isUser endpoint...');
    const isUser = await axios.get(`${BASE_URL}/users/isUser?walletAddress=${testUser.walletAddress}`);
    console.log('✅ isUser check passed:', isUser.data);

    // Test 3: Check username uniqueness
    console.log('\n3. Testing username uniqueness...');
    const isUnique = await axios.get(`${BASE_URL}/users/isUniqueUserName?username=${testUser.username}`);
    console.log('✅ Username uniqueness check passed:', isUnique.data);

    // Test 4: Create user
    console.log('\n4. Testing user creation...');
    const createUser = await axios.post(`${BASE_URL}/users/createUser`, testUser);
    console.log('✅ User created successfully:', createUser.data.message);

    // Test 5: Check if user exists (should be true now)
    console.log('\n5. Testing isUser endpoint again...');
    const isUserAfter = await axios.get(`${BASE_URL}/users/isUser?walletAddress=${testUser.walletAddress}`);
    console.log('✅ isUser check passed:', isUserAfter.data);

    // Test 6: Get user profile
    console.log('\n6. Testing get user profile...');
    const profile = await axios.get(`${BASE_URL}/users/profile/${testUser.walletAddress}`);
    console.log('✅ Profile retrieved:', profile.data.user.username);

    // Test 7: Create buy order
    console.log('\n7. Testing buy order creation...');
    const buyOrder = await axios.post(`${BASE_URL}/orders/createBuyOrder`, testOrder);
    console.log('✅ Buy order created:', buyOrder.data.message);

    // Test 8: Create sell order
    console.log('\n8. Testing sell order creation...');
    const sellOrderData = { ...testOrder, amount: 5, totalValue: 752.50 };
    const sellOrder = await axios.post(`${BASE_URL}/orders/createSellOrder`, sellOrderData);
    console.log('✅ Sell order created:', sellOrder.data.message);

    // Test 9: Get user orders
    console.log('\n9. Testing get user orders...');
    const orders = await axios.get(`${BASE_URL}/orders/getUserOrders?walletAddress=${testUser.walletAddress}`);
    console.log('✅ User orders retrieved:', orders.data.count, 'orders');

    // Test 10: Get user volume
    console.log('\n10. Testing get user volume...');
    const volume = await axios.get(`${BASE_URL}/orders/getUserVolume?walletAddress=${testUser.walletAddress}`);
    console.log('✅ User volume retrieved:', volume.data.volume.totalVolume);

    // Test 11: Get trading stats
    console.log('\n11. Testing trading stats...');
    const stats = await axios.get(`${BASE_URL}/orders/stats`);
    console.log('✅ Trading stats retrieved:', stats.data.totalOrders, 'total orders');

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('- User management: ✅');
    console.log('- Order management: ✅');
    console.log('- Volume tracking: ✅');
    console.log('- API endpoints: ✅');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Check if axios is installed
try {
  require('axios');
} catch (error) {
  console.error('❌ Axios not found. Please install it first:');
  console.error('npm install axios');
  process.exit(1);
}

// Run tests
testAPI(); 