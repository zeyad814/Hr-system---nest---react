import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestApplicant() {
  console.log('👤 بدء إنشاء مستخدم تجريبي APPLICANT...\n');

  try {
    // بيانات المستخدم
    const email = 'applicant@test.com';
    const password = '123456';
    const name = 'أحمد محمد';
    
    // التحقق من وجود مستخدم بهذا البريد
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`⚠️  المستخدم ${email} موجود بالفعل.`);
      console.log(`   إذا أردت حذفه أولاً، قم بتشغيل: npx ts-node scripts/delete-hr-data.ts\n`);
      
      // حذف المستخدم القديم
      console.log('🗑️  حذف المستخدم القديم...');
      await prisma.user.delete({
        where: { email },
      });
      console.log('   ✓ تم حذف المستخدم القديم\n');
    }

    // تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    console.log('1. إنشاء User...');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'APPLICANT',
      },
    });
    console.log(`   ✓ تم إنشاء User: ${user.email} (${user.id})\n`);

    // إنشاء Applicant Profile
    console.log('2. إنشاء Applicant Profile...');
    const applicant = await prisma.applicant.create({
      data: {
        userId: user.id,
        phone: '+966501234567',
        location: 'الرياض',
        address: 'الرياض، المملكة العربية السعودية',
        dateOfBirth: new Date('1995-01-15'),
        nationality: 'السعودية',
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        skills: 'JavaScript, React, Node.js, TypeScript, SQL',
        experience: '3-5 سنوات',
        education: 'بكالوريوس علوم حاسب آلي',
        languages: 'العربية، الإنجليزية',
        bio: 'مطور برمجيات متحمس بخبرة في تطوير تطبيقات الويب',
        expectedSalary: '15000',
        workType: 'FULL_TIME',
      },
    });
    console.log(`   ✓ تم إنشاء Applicant Profile: ${applicant.id}\n`);

    console.log('✅ تم إنشاء المستخدم التجريبي بنجاح!\n');
    console.log('📋 بيانات تسجيل الدخول:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: APPLICANT\n`);

  } catch (error) {
    console.error('❌ حدث خطأ أثناء إنشاء المستخدم:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestApplicant()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

