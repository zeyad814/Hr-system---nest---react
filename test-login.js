const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testLogin() {
  try {
    console.log('Testing login to get a fresh token...');
    
    // Try to login with the client credentials
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'client@test.com',
      password: 'Pass123!'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
    // Test the token
    const token = response.data.access_token;
    console.log('Testing with fresh token...');
    
    const dashboardResponse = await axios.get(`${API_BASE_URL}/clients/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dashboard API works with fresh token!');
    console.log('Dashboard response:', dashboardResponse.data);
    
  } catch (error) {
    console.error('❌ Login test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
