const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed data...');

  // Clear existing data first
  await prisma.commission.deleteMany();
  await prisma.revenue.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@company.com',
      name: 'John Doe',
      role: 'SALES_MANAGER',
      department: 'Sales',
      position: 'Senior Sales Manager',
      phone: '+1-555-0101',
      status: 'ACTIVE',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@company.com',
      name: 'Jane Smith',
      role: 'SALES_REP',
      department: 'Sales',
      position: 'Sales Representative',
      phone: '+1-555-0102',
      status: 'ACTIVE',
    },
  });

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      phone: '+1-555-1001',
      address: '123 Tech Street, Silicon Valley, CA',
      industry: 'Technology',
      status: 'SIGNED',
      contactPerson: 'Mike Johnson',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Global Finance Inc',
      email: 'hr@globalfinance.com',
      phone: '+1-555-1002',
      address: '456 Finance Ave, New York, NY',
      industry: 'Finance',
      status: 'SIGNED',
      contactPerson: 'Sarah Wilson',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Healthcare Plus',
      email: 'recruiting@healthcareplus.com',
      phone: '+1-555-1003',
      address: '789 Medical Blvd, Boston, MA',
      industry: 'Healthcare',
      status: 'SIGNED',
      contactPerson: 'Dr. Robert Brown',
    },
  });

  // Create sample contracts
  const contract1 = await prisma.contract.create({
    data: {
      clientId: client1.id,
      title: 'Senior Software Engineer Placement',
      description: 'Placement of senior software engineers for TechCorp',
      value: 75000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      status: 'ACTIVE',
      terms: 'Standard placement terms with 90-day guarantee',
    },
  });

  const contract2 = await prisma.contract.create({
    data: {
      clientId: client2.id,
      title: 'Financial Analyst Recruitment',
      description: 'Recruitment of financial analysts',
      value: 45000,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-11-30'),
      status: 'ACTIVE',
      terms: 'Contingency recruitment with 60-day guarantee',
    },
  });

  // Create sample revenue records
  const revenue1 = await prisma.revenue.create({
    data: {
      clientId: client1.id,
      contractId: contract1.id,
      amount: 25000,
      type: 'DIRECT_HIRE',
      description: 'Placement fee for Senior Software Engineer',
      date: new Date('2024-03-15'),
    },
  });

  const revenue2 = await prisma.revenue.create({
    data: {
      clientId: client1.id,
      contractId: contract1.id,
      amount: 30000,
      type: 'DIRECT_HIRE',
      description: 'Additional placement fee',
      date: new Date('2024-05-20'),
    },
  });

  const revenue3 = await prisma.revenue.create({
    data: {
      clientId: client2.id,
      contractId: contract2.id,
      amount: 18000,
      type: 'CONSULTING',
      description: 'Financial analyst placement',
      date: new Date('2024-04-10'),
    },
  });

  const revenue4 = await prisma.revenue.create({
    data: {
      clientId: client3.id,
      amount: 22000,
      type: 'TEMPORARY_HIRE',
      description: 'Temporary healthcare staff placement',
      date: new Date('2024-06-05'),
    },
  });

  const revenue5 = await prisma.revenue.create({
    data: {
      clientId: client1.id,
      amount: 35000,
      type: 'PROJECT_BASED',
      description: 'Project-based consulting',
      date: new Date('2024-07-12'),
    },
  });

  // Create sample commissions
  await prisma.commission.create({
    data: {
      revenueId: revenue1.id,
      userId: user1.id,
      amount: 2500,
      percentage: 10.0,
      type: 'STANDARD',
      status: 'PAID',
      paidAt: new Date('2024-03-30'),
    },
  });

  await prisma.commission.create({
    data: {
      revenueId: revenue2.id,
      userId: user2.id,
      amount: 3000,
      percentage: 10.0,
      type: 'STANDARD',
      status: 'APPROVED',
    },
  });

  await prisma.commission.create({
    data: {
      revenueId: revenue3.id,
      userId: user1.id,
      amount: 1800,
      percentage: 10.0,
      type: 'STANDARD',
      status: 'PAID',
      paidAt: new Date('2024-04-25'),
    },
  });

  await prisma.commission.create({
    data: {
      revenueId: revenue4.id,
      userId: user2.id,
      amount: 2200,
      percentage: 10.0,
      type: 'BONUS',
      status: 'PENDING',
    },
  });

  await prisma.commission.create({
    data: {
      revenueId: revenue5.id,
      userId: user1.id,
      amount: 3500,
      percentage: 10.0,
      type: 'OVERRIDE',
      status: 'APPROVED',
    },
  });

  console.log('Seed data created successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.client.count()} clients`);
  console.log(`Created ${await prisma.contract.count()} contracts`);
  console.log(`Created ${await prisma.revenue.count()} revenue records`);
  console.log(`Created ${await prisma.commission.count()} commission records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });