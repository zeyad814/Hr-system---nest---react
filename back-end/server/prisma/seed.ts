import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password for all test users
  const passwordHash = await bcrypt.hash('Pass123!', 10);

  // Create test users
  const testUsers = [
    {
      email: 'admin@test.com',
      name: 'مدير النظام',
      passwordHash,
      role: 'ADMIN',
      department: 'إدارة النظام',
      position: 'مدير النظام',
      status: 'ACTIVE'
    },
    {
      email: 'hr@test.com',
      name: 'موظف الموارد البشرية',
      passwordHash,
      role: 'HR',
      department: 'الموارد البشرية',
      position: 'أخصائي موارد بشرية',
      status: 'ACTIVE'
    },
    {
      email: 'sales@test.com',
      name: 'موظف المبيعات',
      passwordHash,
      role: 'SALES',
      department: 'المبيعات',
      position: 'أخصائي مبيعات',
      status: 'ACTIVE'
    },
    {
      email: 'client@test.com',
      name: 'عميل تجريبي',
      passwordHash,
      role: 'CLIENT',
      department: null,
      position: null,
      status: 'ACTIVE'
    },
    {
      email: 'applicant@test.com',
      name: 'متقدم للوظيفة',
      passwordHash,
      role: 'APPLICANT',
      department: null,
      position: null,
      status: 'ACTIVE'
    }
  ];

  for (const userData of testUsers) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: userData
      });
      console.log(`✅ Created user: ${user.name} (${user.email})`);

      // Create additional profiles for specific roles
      if (userData.role === 'CLIENT') {
        await prisma.client.create({
          data: {
            userId: user.id,
            name: user.name,
            companyName: 'شركة تجريبية',
            industry: 'تقنية المعلومات',
            email: user.email,
            phone: '+966501234567',
            location: 'الرياض، المملكة العربية السعودية',
            description: 'عميل تجريبي للاختبار'
          }
        });
        console.log(`✅ Created client profile for: ${user.name}`);
      }

      if (userData.role === 'APPLICANT') {
        await prisma.applicant.create({
          data: {
            userId: user.id,
            phone: '+966501234567',
            location: 'الرياض، المملكة العربية السعودية',
            skills: 'JavaScript, React, Node.js, TypeScript',
            experience: '3-5 سنوات',
            education: 'بكالوريوس علوم الحاسب',
            bio: 'متقدم تجريبي للاختبار'
          }
        });
        console.log(`✅ Created applicant profile for: ${user.name}`);
      }
    } else {
      console.log(`⚠️  User already exists: ${userData.email}`);
    }
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });