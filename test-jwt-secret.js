const jwt = require('jsonwebtoken');

// Test with different secrets
const secrets = ['dev-secret', 'test-secret', 'secret', 'jwt-secret'];

const payload = {
  sub: 'cmg0ttr3j00038z26fbogdvy4',
  email: 'client@test.com',
  role: 'CLIENT',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
};

console.log('Testing JWT with different secrets...');

for (const secret of secrets) {
  try {
    const token = jwt.sign(payload, secret);
    console.log(`\nSecret: ${secret}`);
    console.log(`Token: ${token}`);
    
    // Try to verify with the same secret
    const decoded = jwt.verify(token, secret);
    console.log(`✅ Verification successful with ${secret}`);
  } catch (error) {
    console.log(`❌ Failed with ${secret}: ${error.message}`);
  }
}

// Test the original token with different secrets
const originalToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWcwdHRyM2owMDAzOHoyNmZib2dkdnk0IiwiZW1haWwiOiJjbGllbnRAdGVzdC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiaWF0IjoxNzU4OTIyNzM3LCJleHAiOjE3NTg5MjYzMzd9.E2i0PVsd7676IM3tflmp-zOvwiSMTqM35xNnv0tAbbQ';

console.log('\n\nTesting original token with different secrets...');
for (const secret of secrets) {
  try {
    const decoded = jwt.verify(originalToken, secret);
    console.log(`✅ Original token verified with secret: ${secret}`);
    console.log('Decoded payload:', decoded);
  } catch (error) {
    console.log(`❌ Original token failed with ${secret}: ${error.message}`);
  }
}
