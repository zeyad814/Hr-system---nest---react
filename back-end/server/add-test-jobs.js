const API_BASE = 'http://localhost:3000/api';

// Helper function for HTTP requests
async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.response = { status: response.status, data };
    throw error;
  }

  return { data, status: response.status };
}

// Login as client first
async function loginAsClient() {
  try {
    const response = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'client@test.com',
        password: 'Pass123!'
      })
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

const testJobs = [
  {
    title: 'مطور Full Stack',
    description: 'نبحث عن مطور Full Stack ذو خبرة في React و Node.js لتطوير تطبيقات ويب حديثة.',
    requirements: 'خبرة 3-5 سنوات في تطوير تطبيقات الويب\nإتقان React, TypeScript, Node.js\nمعرفة بقواعد البيانات SQL و NoSQL',
    location: 'الرياض',
    company: 'شركة التقنية المتقدمة',
    jobType: 'دوام كامل',
    salaryRange: '15000-20000 ريال',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  },
  {
    title: 'مصمم UI/UX',
    description: 'نحتاج مصمم واجهات مستخدم مبدع لتصميم تجارب مستخدم مميزة.',
    requirements: 'خبرة 2-4 سنوات في تصميم UI/UX\nإتقان Figma, Adobe XD\nفهم عميق لمبادئ تصميم واجهات المستخدم',
    location: 'جدة',
    company: 'شركة التصميم الإبداعي',
    jobType: 'دوام كامل',
    salaryRange: '10000-15000 ريال',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'محلل بيانات',
    description: 'نبحث عن محلل بيانات لاستخراج رؤى قيمة من البيانات الضخمة.',
    requirements: 'خبرة 3-5 سنوات في تحليل البيانات\nإتقان Python, SQL, Tableau\nمعرفة بالتعلم الآلي ميزة إضافية',
    location: 'الدمام',
    company: 'شركة البيانات الذكية',
    jobType: 'دوام كامل',
    salaryRange: '12000-18000 ريال',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'مسوق رقمي',
    description: 'نحتاج مسوق رقمي متخصص في التسويق عبر وسائل التواصل الاجتماعي.',
    requirements: 'خبرة 2-4 سنوات في التسويق الرقمي\nإتقان أدوات التسويق الرقمي\nمعرفة بـ SEO و Google Ads',
    location: 'الرياض',
    company: 'شركة التسويق الرقمي',
    jobType: 'دوام كامل',
    salaryRange: '8000-12000 ريال',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    title: 'مهندس برمجيات',
    description: 'نبحث عن مهندس برمجيات لبناء أنظمة موزعة وقابلة للتوسع.',
    requirements: 'خبرة 4-6 سنوات في هندسة البرمجيات\nإتقان Java, Spring Boot, Microservices\nمعرفة بـ AWS ميزة إضافية',
    location: 'جدة',
    company: 'شركة الهندسة البرمجية',
    jobType: 'دوام كامل',
    salaryRange: '18000-25000 ريال',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

async function createJobs() {
  try {
    console.log('🚀 Starting to create test jobs...\n');
    console.log('=' .repeat(50));

    // Login as client
    console.log('🔐 Logging in as client...');
    const token = await loginAsClient();
    console.log('✅ Logged in successfully\n');

    let successCount = 0;

    for (const job of testJobs) {
      try {
        console.log(`📝 Creating job: ${job.title}`);

        await request(`${API_BASE}/client/jobs`, {
          method: 'POST',
          body: JSON.stringify(job),
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(`✅ Job created: ${job.title}\n`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create job ${job.title}:`, error.message);
        console.error('   Error details:', error.response?.data || error);
      }
    }

    console.log('=' .repeat(50));
    console.log('🎉 Done!');
    console.log(`✅ Successfully created: ${successCount} jobs`);
    console.log(`❌ Failed: ${testJobs.length - successCount} jobs\n`);
    console.log('💡 You can now view the jobs at: http://localhost:8080/hr/candidates');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

createJobs();
