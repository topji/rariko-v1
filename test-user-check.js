// Test script to verify user check API
const API_BASE_URL = 'https://backend.rizz.money/api';

async function testUserCheck() {
  console.log('🧪 Testing User Check API...');
  
  // Test with a sample wallet address
  const testWalletAddress = '1111111111111111111111111111111111111111111111';
  
  try {
    console.log(`📡 Making request to: ${API_BASE_URL}/users/isUser?walletAddress=${testWalletAddress}`);
    
    const response = await fetch(`${API_BASE_URL}/users/isUser?walletAddress=${testWalletAddress}`);
    const data = await response.json();
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', data);
    
    if (response.ok) {
      console.log('✅ API is working correctly');
      console.log('✅ User exists:', data.exists);
    } else {
      console.log('❌ API returned error:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Test health endpoint first
async function testHealth() {
  console.log('🏥 Testing Health Endpoint...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    console.log('✅ Health check response:', data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testHealth();
  console.log('\n' + '='.repeat(50) + '\n');
  await testUserCheck();
}

runTests(); 