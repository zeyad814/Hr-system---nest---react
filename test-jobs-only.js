const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const FRESH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWcwdHRyM2owMDAzOHoyNmZib2dkdnk0IiwiZW1haWwiOiJjbGllbnRAdGVzdC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiaWF0IjoxNzU4OTI1MjA1LCJleHAiOjE3NTg5Mjg4MDV9._EmCTQxS7bXVjxF___JgHV985iyIRDJGbgz7WdhcnyA';

async function testJobsOnly() {
  try {
    console.log('Testing jobs API specifically...');
    console.log('Token:', FRESH_TOKEN);
    
    // Test jobs endpoint
    const response = await axios.get(`${API_BASE_URL}/clients/jobs`, {
      headers: {
        'Authorization': `Bearer ${FRESH_TOKEN}`,
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

testJobsOnly();
