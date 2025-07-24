// Test script to check specific user existence
const API_BASE_URL = 'https://backend.rizz.money/api';

async function testSpecificUser() {
  console.log('🧪 Testing Specific User Check...');
  
  // Test with the actual wallet address from profile page
  const testWalletAddress = 'GLakRXvWLAgvJuDQnGGBWoFRFHN1js4PFqtkULUDSWih';
  
  try {
    console.log(`📡 Checking user existence for: ${testWalletAddress}`);
    
    // Test user existence
    const userExistsResponse = await fetch(`${API_BASE_URL}/users/isUser?walletAddress=${testWalletAddress}`);
    const userExistsData = await userExistsResponse.json();
    
    console.log('✅ User exists check response:', userExistsData);
    
    // Test user profile (this should work since profile page works)
    const profileResponse = await fetch(`${API_BASE_URL}/users/profile/${testWalletAddress}`);
    const profileData = await profileResponse.json();
    
    console.log('✅ Profile response status:', profileResponse.status);
    console.log('✅ Profile data:', profileData);
    
    // Test user referrals
    const referralsResponse = await fetch(`${API_BASE_URL}/users/referrals/${testWalletAddress}`);
    const referralsData = await referralsResponse.json();
    
    console.log('✅ Referrals response status:', referralsResponse.status);
    console.log('✅ Referrals data:', referralsData);
    
    // Analysis
    console.log('\n📊 Analysis:');
    console.log(`- User exists: ${userExistsData.exists}`);
    console.log(`- Profile accessible: ${profileResponse.ok}`);
    console.log(`- Referrals accessible: ${referralsResponse.ok}`);
    
    if (userExistsData.exists && profileResponse.ok) {
      console.log('✅ This user exists and should be redirected to home after disclaimer');
    } else if (!userExistsData.exists) {
      console.log('❌ This user does not exist and should see username prompt');
    } else {
      console.log('⚠️ Inconsistent state detected');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSpecificUser(); 