const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClients() {
  try {
    const clients = await prisma.client.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    console.log('=== Clients in Database ===');
    console.log(JSON.stringify(clients, null, 2));
    console.log('\n=== Total Clients ===');
    console.log('Total:', clients.length);

    if (clients.length > 0) {
      console.log('\n=== Use this Client ID for testing ===');
      console.log('Client ID:', clients[0].id);
      console.log('Client Name:', clients[0].name);
    } else {
      console.log('\n⚠️ No clients found! You need to create a client first.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkClients();
