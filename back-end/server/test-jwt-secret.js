const jwt = require('jsonwebtoken');

// Test with the secret that should be used
const secret = 'dev-secret';
const payload = {
  sub: 'cmg1f63hf00008zj08xr8lfwo',
  email: 'client2@test.com',
  role: 'CLIENT',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60)
};

console.log('Creating token with secret:', secret);
const token = jwt.sign(payload, secret);
console.log('Token created:', token);

console.log('Verifying token with same secret...');
try {
  const verified = jwt.verify(token, secret);
  console.log('Token verification successful:', verified);
} catch (error) {
  console.log('Token verification failed:', error.message);
}

// Test with different secrets to see if any work
const otherSecrets = ['your-secret-key', 'jwt-secret', 'secret', 'my-secret'];
for (const testSecret of otherSecrets) {
  try {
    const verified = jwt.verify(token, testSecret);
    console.log(`Token verified with secret '${testSecret}':`, verified);
  } catch (error) {
    console.log(`Token verification failed with secret '${testSecret}':`, error.message);
  }
}
