const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const FRESH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWcwdHRyM2owMDAzOHoyNmZib2dkdnk0IiwiZW1haWwiOiJjbGllbnRAdGVzdC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiaWF0IjoxNzU4OTI1MjA1LCJleHAiOjE3NTg5Mjg4MDV9._EmCTQxS7bXVjxF___JgHV985iyIRDJGbgz7WdhcnyA';

async function testFreshToken() {
  try {
    console.log('Testing all client APIs with fresh token...');
    
    // Test dashboard stats endpoint
    const dashboardResponse = await axios.get(`${API_BASE_URL}/clients/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${FRESH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dashboard stats API works!');
    console.log('Dashboard response:', dashboardResponse.data);
    
    // Test jobs endpoint
    const jobsResponse = await axios.get(`${API_BASE_URL}/clients/jobs`, {
      headers: {
        'Authorization': `Bearer ${FRESH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Jobs API works!');
    console.log('Jobs response:', jobsResponse.data);
    
    // Test profile endpoint
    const profileResponse = await axios.get(`${API_BASE_URL}/clients/profile`, {
      headers: {
        'Authorization': `Bearer ${FRESH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile API works!');
    console.log('Profile response:', profileResponse.data);
    
    // Test candidates endpoint
    const candidatesResponse = await axios.get(`${API_BASE_URL}/clients/candidates`, {
      headers: {
        'Authorization': `Bearer ${FRESH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Candidates API works!');
    console.log('Candidates response:', candidatesResponse.data);
    
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

testFreshToken();
