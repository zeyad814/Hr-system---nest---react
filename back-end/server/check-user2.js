const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: 'cmg1f63hf00008zj08xr8lfwo' }
    });
    console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
