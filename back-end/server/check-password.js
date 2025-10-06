const bcrypt = require('bcrypt');

async function checkPassword() {
  const password = 'password123';
  const hash = '$2b$10$QXsdSIOXeNPDhC/ZkRktQeWyBqm2AABl8BF1A1hJayMyNNpG1SmES';
  
  try {
    const result = await bcrypt.compare(password, hash);
    console.log('Password match:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPassword();
