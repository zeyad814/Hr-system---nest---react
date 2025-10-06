const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const NEW_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWcwdHRyM2owMDAzOHoyNmZib2dkdnk0IiwiZW1haWwiOiJjbGllbnRAdGVzdC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiaWF0IjoxNzU4OTI1MDE2LCJleHAiOjE3NTg5Mjg2MTZ9.jtrSl34HMUKpxN5wwG6sg5TPvPUjISY9yJ-RayWj_k0';

async function testWithNewToken() {
  try {
    console.log('Testing with new token...');
    
    // Test dashboard stats endpoint
    const response = await axios.get(`${API_BASE_URL}/clients/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${NEW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dashboard stats API works with new token!');
    console.log('Response:', response.data);
    
    // Test jobs endpoint
    const jobsResponse = await axios.get(`${API_BASE_URL}/clients/jobs`, {
      headers: {
        'Authorization': `Bearer ${NEW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Jobs API works with new token!');
    console.log('Jobs response:', jobsResponse.data);
    
  } catch (error) {
    console.error('❌ API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWithNewToken();
