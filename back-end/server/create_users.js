const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const users = [
  {
    email: 'admin@test.com',
    name: 'System Admin',
    password: 'Pass123!',
    role: 'ADMIN'
  },
  {
    email: 'hr@test.com',
    name: 'HR Manager',
    password: 'Pass123!',
    role: 'HR'
  },
  {
    email: 'sales@test.com',
    name: 'Sales Manager',
    password: 'Pass123!',
    role: 'SALES'
  },
  {
    email: 'client@test.com',
    name: 'Client User',
    password: 'Pass123!',
    role: 'CLIENT'
  },
  {
    email: 'applicant@test.com',
    name: 'Job Applicant',
    password: 'Pass123!',
    role: 'APPLICANT'
  }
];

async function createAllUsers() {
  try {
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      const passwordHash = await bcrypt.hash(userData.password, 10);

      if (existingUser) {
        console.log(`User ${userData.email} already exists, updating password...`);
        await prisma.user.update({
          where: { email: userData.email },
          data: { 
            passwordHash,
            name: userData.name,
            role: userData.role,
            status: 'ACTIVE'
          }
        });
        console.log(`User ${userData.email} updated successfully`);
      } else {
        // Create new user
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            passwordHash,
            role: userData.role,
            status: 'ACTIVE'
          }
        });
        console.log(`User created: ${user.email} with role ${user.role}`);
      }
    }
    
    console.log('\n=== All users created/updated successfully! ===');
    console.log('Login credentials:');
    users.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });
    
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAllUsers();