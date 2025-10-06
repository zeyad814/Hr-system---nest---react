const jwt = require('jsonwebtoken');

const secret = 'dev-secret';
const payload = {
  sub: 'cmg0ttr3j00038z26fbogdvy4',
  email: 'client@test.com',
  role: 'CLIENT',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
};

console.log('Creating new token with secret:', secret);
console.log('Payload:', payload);

const token = jwt.sign(payload, secret);
console.log('New token:', token);

// Verify the token
try {
  const decoded = jwt.verify(token, secret);
  console.log('Token verification successful:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
}

// Test with the original token
const originalToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWcwdHRyM2owMDAzOHoyNmZib2dkdnk0IiwiZW1haWwiOiJjbGllbnRAdGVzdC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiaWF0IjoxNzU4OTIyNzM3LCJleHAiOjE3NTg5MjYzMzd9.E2i0PVsd7676IM3tflmp-zOvwiSMTqM35xNnv0tAbbQ';

try {
  const decodedOriginal = jwt.verify(originalToken, secret);
  console.log('Original token verification successful:', decodedOriginal);
} catch (error) {
  console.error('Original token verification failed:', error.message);
}
