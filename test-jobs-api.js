const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const CLIENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWcwdHRyM2owMDAzOHoyNmZib2dkdnk0IiwiZW1haWwiOiJjbGllbnRAdGVzdC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiaWF0IjoxNzU4OTIyNzM3LCJleHAiOjE3NTg5MjYzMzd9.E2i0PVsd7676IM3tflmp-zOvwiSMTqM35xNnv0tAbbQ';

async function testJobsAPI() {
  try {
    console.log('Testing Jobs API specifically...');
    
    // Test jobs endpoint
    const response = await axios.get(`${API_BASE_URL}/clients/jobs`, {
      headers: {
        'Authorization': `Bearer ${CLIENT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Jobs API works!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Jobs API failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testJobsAPI();
