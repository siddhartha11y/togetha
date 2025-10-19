// Quick test to check if the new endpoints are working
const axios = require('axios').default;

async function testEndpoints() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  console.log('🧪 Testing new endpoints...\n');
  
  try {
    // Test following endpoint
    console.log('Testing GET /api/auth/following');
    const followingResponse = await axios.get(`${baseURL}/api/auth/following`, {
      validateStatus: () => true // Accept any status
    });
    console.log(`Status: ${followingResponse.status}`);
    console.log(`Response: ${JSON.stringify(followingResponse.data, null, 2)}\n`);
    
    // Test followers endpoint
    console.log('Testing GET /api/auth/followers');
    const followersResponse = await axios.get(`${baseURL}/api/auth/followers`, {
      validateStatus: () => true
    });
    console.log(`Status: ${followersResponse.status}`);
    console.log(`Response: ${JSON.stringify(followersResponse.data, null, 2)}\n`);
    
    if (followingResponse.status === 401 && followersResponse.status === 401) {
      console.log('✅ Endpoints exist and require authentication (expected)');
    } else if (followingResponse.status === 404 || followersResponse.status === 404) {
      console.log('❌ Endpoints not found - backend needs restart');
    } else {
      console.log('✅ Endpoints working');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server not running');
      console.log('Start with: cd backend && nodemon server.js');
    }
  }}