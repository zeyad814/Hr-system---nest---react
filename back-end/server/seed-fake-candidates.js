const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Arabic names and realistic data
const arabicNames = [
  'أحمد محمد العتيبي',
  'فاطمة عبدالله السعيد',
  'محمد علي القحطاني',
  'نورا سعد الغامدي',
  'عبدالرحمن خالد الشمري',
  'ريم عبدالعزيز المطيري',
  'سعد أحمد الزهراني',
  'هند محمد البقمي',
  'خالد عبدالله العتيبي',
  'مريم سعد القحطاني',
  'عبدالله محمد الشمري',
  'لينا أحمد الغامدي',
  'يوسف خالد المطيري',
  'سارة عبدالعزيز البقمي',
  'عمر محمد الزهراني',
  'نور عبدالله العتيبي',
  'بدر سعد القحطاني',
  'زينب أحمد الشمري',
  'طارق خالد الغامدي',
  'فهد محمد المطيري'
];

const arabicEmails = [
  'ahmed.mohammed@email.com',
  'fatima.abdullah@email.com',
  'mohammed.ali@email.com',
  'nora.saad@email.com',
  'abdulrahman.khalid@email.com',
  'reem.abdulaziz@email.com',
  'saad.ahmed@email.com',
  'hind.mohammed@email.com',
  'khalid.abdullah@email.com',
  'mariam.saad@email.com',
  'abdullah.mohammed@email.com',
  'lina.ahmed@email.com',
  'yousef.khalid@email.com',
  'sara.abdulaziz@email.com',
  'omar.mohammed@email.com',
  'nour.abdullah@email.com',
  'badr.saad@email.com',
  'zainab.ahmed@email.com',
  'tariq.khalid@email.com',
  'fahad.mohammed@email.com'
];

const phoneNumbers = [
  '+966501234567',
  '+966502345678',
  '+966503456789',
  '+966504567890',
  '+966505678901',
  '+966506789012',
  '+966507890123',
  '+966508901234',
  '+966509012345',
  '+966500123456',
  '+966511234567',
  '+966522345678',
  '+966533456789',
  '+966544567890',
  '+966555678901',
  '+966566789012',
  '+966577890123',
  '+966588901234',
  '+966599012345',
  '+966500123456'
];

const locations = [
  'الرياض، المملكة العربية السعودية',
  'جدة، المملكة العربية السعودية',
  'الدمام، المملكة العربية السعودية',
  'مكة المكرمة، المملكة العربية السعودية',
  'المدينة المنورة، المملكة العربية السعودية',
  'الطائف، المملكة العربية السعودية',
  'بريدة، المملكة العربية السعودية',
  'تبوك، المملكة العربية السعودية',
  'خميس مشيط، المملكة العربية السعودية',
  'الهفوف، المملكة العربية السعودية'
];

const skills = [
  'JavaScript, React, Node.js, TypeScript',
  'Python, Django, PostgreSQL, Docker',
  'Java, Spring Boot, MySQL, Microservices',
  'C#, .NET Core, SQL Server, Azure',
  'PHP, Laravel, MySQL, Vue.js',
  'React Native, Flutter, Firebase',
  'Angular, TypeScript, RxJS, Material UI',
  'Vue.js, Nuxt.js, MongoDB, Express',
  'Go, Gin, PostgreSQL, Kubernetes',
  'Ruby, Rails, PostgreSQL, Redis',
  'Swift, iOS Development, Core Data',
  'Kotlin, Android Development, Room',
  'DevOps, AWS, Docker, Jenkins',
  'Data Science, Python, Pandas, Scikit-learn',
  'Machine Learning, TensorFlow, PyTorch',
  'UI/UX Design, Figma, Adobe XD',
  'Project Management, Agile, Scrum',
  'Digital Marketing, SEO, Google Analytics',
  'Sales, CRM, Lead Generation',
  'Customer Service, Communication, Problem Solving'
];

const experiences = [
  'مبتدئ (0-2 سنوات)',
  'متوسط (2-5 سنوات)',
  'متقدم (5-8 سنوات)',
  'خبير (8+ سنوات)'
];

const educations = [
  'بكالوريوس علوم الحاسب',
  'بكالوريوس هندسة البرمجيات',
  'بكالوريوس نظم المعلومات',
  'بكالوريوس الهندسة الكهربائية',
  'بكالوريوس إدارة الأعمال',
  'بكالوريوس التسويق',
  'بكالوريوس المحاسبة',
  'بكالوريوس التمويل',
  'ماجستير علوم الحاسب',
  'ماجستير إدارة الأعمال',
  'دبلوم تقنية المعلومات',
  'دبلوم التسويق الرقمي'
];

const jobTitles = [
  'مطور React أول',
  'مطور Python',
  'مطور Java',
  'مطور .NET',
  'مطور PHP',
  'مطور تطبيقات الجوال',
  'مصمم UI/UX',
  'محلل بيانات',
  'مهندس DevOps',
  'مدير مشاريع',
  'أخصائي تسويق رقمي',
  'أخصائي مبيعات',
  'محاسب أول',
  'أخصائي موارد بشرية',
  'مدير عمليات'
];

const companies = [
  'شركة التقنية المتقدمة',
  'مجموعة الحلول الذكية',
  'شركة التطوير الرقمي',
  'مؤسسة الابتكار التقني',
  'شركة الأنظمة المتكاملة',
  'مجموعة البيانات الضخمة',
  'شركة الحوسبة السحابية',
  'مؤسسة الذكاء الاصطناعي',
  'شركة الأمن السيبراني',
  'مجموعة التطبيقات الذكية'
];

const clientNames = [
  'شركة النخيل للاستثمار',
  'مجموعة الرؤية المستقبلية',
  'شركة الأفق الجديد',
  'مؤسسة التميز التجاري',
  'شركة النجوم المتلألئة',
  'مجموعة الريادة الصناعية',
  'شركة الأصالة والجودة',
  'مؤسسة التطوير المستدام',
  'شركة الإبداع والابتكار',
  'مجموعة التقدم التقني'
];

async function main() {
  console.log('🌱 Starting fake candidates seed...');

  // Hash password for all test users
  const passwordHash = await bcrypt.hash('Pass123!', 10);

  // Create fake clients first
  console.log('📋 Creating fake clients...');
  const clients = [];
  for (let i = 0; i < 5; i++) {
    // Check if user already exists
    let clientUser = await prisma.user.findUnique({
      where: { email: `client${i + 1}@test.com` }
    });

    if (!clientUser) {
      clientUser = await prisma.user.create({
        data: {
          email: `client${i + 1}@test.com`,
          name: clientNames[i],
          passwordHash,
          role: 'CLIENT',
          department: 'إدارة الشركة',
          position: 'مدير عام',
          status: 'ACTIVE'
        }
      });
    }

    // Check if client already exists
    let client = await prisma.client.findFirst({
      where: { userId: clientUser.id }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: clientUser.id,
          name: clientNames[i],
          companyName: clientNames[i],
          industry: 'تقنية المعلومات',
          email: `client${i + 1}@test.com`,
          phone: phoneNumbers[i],
          location: locations[i],
          description: `شركة ${clientNames[i]} - عميل تجريبي للاختبار`,
          status: 'SIGNED'
        }
      });
    }
    clients.push(client);
    console.log(`✅ Created client: ${client.name}`);
  }

  // Create fake jobs
  console.log('💼 Creating fake jobs...');
  const jobs = [];
  for (let i = 0; i < 8; i++) {
    const job = await prisma.job.create({
      data: {
        title: jobTitles[i],
        company: companies[i % companies.length],
        location: locations[i % locations.length],
        jobType: ['FULL_TIME', 'PART_TIME', 'CONTRACT'][i % 3],
        department: 'تقنية المعلومات',
        description: `وصف وظيفة ${jobTitles[i]} في ${companies[i % companies.length]}. نحن نبحث عن متخصص متميز للانضمام إلى فريقنا.`,
        requirements: `متطلبات الوظيفة:\n- خبرة في ${skills[i % skills.length]}\n- ${experiences[i % experiences.length]}\n- ${educations[i % educations.length]}\n- مهارات التواصل والعمل الجماعي`,
        requiredSkills: skills[i % skills.length],
        salaryRange: `${(i + 1) * 5000}-${(i + 2) * 5000} ريال سعودي`,
        applicationDeadline: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000), // 1-8 weeks from now
        clientId: clients[i % clients.length].id,
        status: 'OPEN'
      }
    });
    jobs.push(job);
    console.log(`✅ Created job: ${job.title}`);
  }

  // Create fake candidates
  console.log('👥 Creating fake candidates...');
  const candidates = [];
  for (let i = 0; i < 20; i++) {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: arabicEmails[i] }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: arabicEmails[i],
          name: arabicNames[i],
          passwordHash,
          role: 'APPLICANT',
          department: null,
          position: null,
          status: 'ACTIVE'
        }
      });
    }

    // Check if applicant already exists
    let applicant = await prisma.applicant.findUnique({
      where: { userId: user.id }
    });

    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: {
          userId: user.id,
          phone: phoneNumbers[i],
          address: `${locations[i % locations.length]}, شارع الملك فهد`,
          location: locations[i % locations.length],
          dateOfBirth: new Date(1990 + (i % 15), i % 12, (i % 28) + 1),
          nationality: 'سعودي',
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          maritalStatus: ['SINGLE', 'MARRIED'][i % 2],
          skills: skills[i],
          experience: experiences[i % experiences.length],
          education: educations[i % educations.length],
          languages: 'العربية، الإنجليزية',
          portfolio: `https://portfolio${i}.com`,
          website: `https://website${i}.com`,
          linkedin: `https://linkedin.com/in/candidate${i}`,
          github: `https://github.com/candidate${i}`,
          bio: `مرشح تجريبي ${i + 1} - ${arabicNames[i]} - متخصص في ${skills[i]}`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(arabicNames[i])}&background=random`,
          rating: Math.random() * 2 + 3, // 3-5 rating
          resumeUrl: `/uploads/cvs/cv-candidate-${i + 1}.pdf`,
          coverLetter: `رسالة تغطية للمرشح ${arabicNames[i]} - أتطلع للانضمام إلى فريقكم المتميز.`,
          expectedSalary: `${(i + 1) * 3000}-${(i + 2) * 3000} ريال سعودي`,
          availableFrom: new Date(Date.now() + (i % 30) * 24 * 60 * 60 * 1000),
          workType: ['FULL_TIME', 'PART_TIME', 'REMOTE', 'HYBRID'][i % 4]
        }
      });
    }

    candidates.push(applicant);
    console.log(`✅ Created candidate: ${arabicNames[i]}`);
  }

  // Create job applications
  console.log('📝 Creating job applications...');
  const applications = [];
  for (let i = 0; i < candidates.length; i++) {
    // Each candidate applies to 1-3 jobs
    const numApplications = Math.floor(Math.random() * 3) + 1;
    const appliedJobs = [];
    
    for (let j = 0; j < numApplications; j++) {
      let jobId;
      do {
        jobId = jobs[Math.floor(Math.random() * jobs.length)].id;
      } while (appliedJobs.includes(jobId));
      appliedJobs.push(jobId);

      const application = await prisma.jobApplication.create({
        data: {
          jobId: jobId,
          applicantId: candidates[i].id,
          status: ['PENDING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'][Math.floor(Math.random() * 6)],
          resumeUrl: `/uploads/cvs/cv-candidate-${i + 1}.pdf`
        }
      });
      applications.push(application);
    }
    console.log(`✅ Created ${numApplications} applications for ${arabicNames[i]}`);
  }

  // Create some interviews
  console.log('🎯 Creating interviews...');
  const hrUser = await prisma.user.findFirst({
    where: { role: 'HR' }
  });

  if (hrUser) {
    for (let i = 0; i < 10; i++) {
      const application = applications[Math.floor(Math.random() * applications.length)];
      const interview = await prisma.interview.create({
        data: {
          applicationId: application.id,
          scheduledBy: hrUser.id,
          interviewerIds: [hrUser.id],
          candidateId: application.applicantId,
          title: `مقابلة ${i + 1}`,
          description: `مقابلة توظيف للمرشح`,
          type: ['PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'HR'][i % 5],
          status: ['SCHEDULED', 'CONFIRMED', 'ATTENDED', 'NO_SHOW', 'CANCELLED', 'RESCHEDULED'][Math.floor(Math.random() * 6)],
          scheduledAt: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // 1-10 days from now
          duration: [30, 45, 60, 90][i % 4],
          location: i % 2 === 0 ? 'مكتب الشركة' : 'مقابلة عن بُعد',
          notes: `ملاحظات المقابلة ${i + 1}`,
          reminderSent: Math.random() > 0.5
        }
      });
      console.log(`✅ Created interview: ${interview.title}`);
    }
  }

  // Create some experiences for candidates
  console.log('💼 Creating work experiences...');
  for (let i = 0; i < candidates.length; i++) {
    const numExperiences = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numExperiences; j++) {
      await prisma.experience.create({
        data: {
          applicantId: candidates[i].id,
          title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
          company: companies[Math.floor(Math.random() * companies.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          startDate: new Date(2020 + j, j * 2, 1),
          endDate: j < numExperiences - 1 ? new Date(2021 + j, (j + 1) * 2, 1) : null,
          current: j === numExperiences - 1,
          description: `وصف الخبرة العملية ${j + 1} للمرشح ${arabicNames[i]}`,
          achievements: `إنجازات مهمة في ${companies[Math.floor(Math.random() * companies.length)]}`
        }
      });
    }
    console.log(`✅ Created ${numExperiences} experiences for ${arabicNames[i]}`);
  }

  // Create some education records
  console.log('🎓 Creating education records...');
  for (let i = 0; i < candidates.length; i++) {
    const numEducations = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < numEducations; j++) {
      await prisma.education.create({
        data: {
          applicantId: candidates[i].id,
          degree: educations[Math.floor(Math.random() * educations.length)],
          institution: `جامعة ${['الملك سعود', 'الملك عبدالعزيز', 'الأميرة نورة', 'الإمام محمد بن سعود'][j % 4]}`,
          location: locations[Math.floor(Math.random() * locations.length)],
          startDate: new Date(2015 + j, 9, 1),
          endDate: new Date(2019 + j, 6, 1),
          current: false,
          gpa: `${(3.5 + Math.random() * 1.5).toFixed(2)}/5.00`,
          description: `وصف التعليم ${j + 1} للمرشح ${arabicNames[i]}`
        }
      });
    }
    console.log(`✅ Created ${numEducations} education records for ${arabicNames[i]}`);
  }

  console.log('🎉 Fake candidates seed completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - ${candidates.length} candidates created`);
  console.log(`   - ${jobs.length} jobs created`);
  console.log(`   - ${clients.length} clients created`);
  console.log(`   - ${applications.length} job applications created`);
  console.log(`   - Multiple interviews, experiences, and education records created`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
