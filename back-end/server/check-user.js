const { PrismaClient } = require('@prisma/client');

async function checkUser() {
  const prisma = new PrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: 'cmg0ttr3j00038z26fbogdvy4' }
    });
    
    console.log('User found:', user);
    
    if (!user) {
      console.log('User not found, checking all users...');
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true }
      });
      console.log('All users:', allUsers);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
