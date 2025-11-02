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

// بيانات مرشحين تجريبيين
const testApplicants = [
  {
    email: 'ahmed.dev@example.com',
    password: 'Pass123!',
    name: 'أحمد محمد المطور',
    phone: '+966501234567',
    location: 'الرياض',
    skills: 'JavaScript, React, TypeScript, Node.js',
    experience: '5 سنوات',
    education: 'بكالوريوس علوم الحاسب',
    bio: 'مطور Full Stack بخبرة 5 سنوات في تطوير تطبيقات الويب'
  },
  {
    email: 'fatima.designer@example.com',
    password: 'Pass123!',
    name: 'فاطمة أحمد المصممة',
    phone: '+966502345678',
    location: 'جدة',
    skills: 'UI/UX Design, Figma, Adobe XD, Photoshop',
    experience: '3 سنوات',
    education: 'بكالوريوس تصميم جرافيك',
    bio: 'مصممة واجهات مستخدم بخبرة في تصميم تطبيقات الجوال والويب'
  },
  {
    email: 'mohammed.analyst@example.com',
    password: 'Pass123!',
    name: 'محمد علي المحلل',
    phone: '+966503456789',
    location: 'الدمام',
    skills: 'Data Analysis, Python, SQL, Tableau',
    experience: '4 سنوات',
    education: 'بكالوريوس إحصاء',
    bio: 'محلل بيانات متخصص في تحليل البيانات الضخمة'
  },
  {
    email: 'nora.marketer@example.com',
    password: 'Pass123!',
    name: 'نورا سعد المسوقة',
    phone: '+966504567890',
    location: 'الرياض',
    skills: 'Digital Marketing, SEO, Google Ads, Social Media',
    experience: '3 سنوات',
    education: 'بكالوريوس تسويق',
    bio: 'مسوقة رقمية متخصصة في التسويق عبر وسائل التواصل الاجتماعي'
  },
  {
    email: 'khalid.engineer@example.com',
    password: 'Pass123!',
    name: 'خالد عبدالله المهندس',
    phone: '+966505678901',
    location: 'جدة',
    skills: 'Java, Spring Boot, Microservices, AWS',
    experience: '6 سنوات',
    education: 'بكالوريوس هندسة برمجيات',
    bio: 'مهندس برمجيات بخبرة في بناء الأنظمة الموزعة'
  }
];

async function createApplicant(applicantData) {
  try {
    console.log(`\n📝 Creating applicant: ${applicantData.name}`);

    // 1. Register user
    console.log('  → Registering user...');
    const registerResponse = await request(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        email: applicantData.email,
        password: applicantData.password,
        name: applicantData.name,
        role: 'APPLICANT'
      })
    });

    const token = registerResponse.data.access_token;
    console.log('  ✅ User registered successfully');

    // 2. Create/Update applicant profile
    console.log('  → Creating applicant profile...');
    await request(`${API_BASE}/applicants/profile`, {
      method: 'POST',
      body: JSON.stringify({
        phone: applicantData.phone,
        location: applicantData.location,
        skills: applicantData.skills,
        experience: applicantData.experience,
        education: applicantData.education,
        bio: applicantData.bio
      }),
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('  ✅ Applicant profile created');

    // 3. Get available jobs
    console.log('  → Fetching available jobs...');
    const jobsResponse = await request(`${API_BASE}/jobs/public`);
    const jobs = jobsResponse.data;

    if (jobs && jobs.length > 0) {
      // Apply to the first available job
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
      console.log(`  → Applying to job: ${randomJob.title}`);

      try {
        await request(`${API_BASE}/applicants/apply`, {
          method: 'POST',
          body: JSON.stringify({
            jobId: randomJob.id,
            coverLetter: `أنا ${applicantData.name} وأود التقدم لهذه الوظيفة. لدي خبرة ${applicantData.experience} في المجال.`
          }),
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`  ✅ Applied to job successfully`);
      } catch (applyError) {
        if (applyError.response?.status === 400) {
          console.log(`  ⚠️  Already applied to this job`);
        } else {
          throw applyError;
        }
      }
    } else {
      console.log('  ⚠️  No jobs available to apply to');
    }

    console.log(`✅ Applicant ${applicantData.name} created successfully!`);
    return true;

  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log(`  ⚠️  User ${applicantData.email} already exists, skipping...`);
      return false;
    }
    console.error(`  ❌ Error creating applicant ${applicantData.name}:`, error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting to create test applicants...\n');
  console.log('=' .repeat(50));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const applicant of testApplicants) {
    const result = await createApplicant(applicant);
    if (result === true) {
      successCount++;
    } else if (result === false) {
      skipCount++;
    } else {
      errorCount++;
    }

    // Wait a bit between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Done!');
  console.log(`✅ Successfully created: ${successCount}`);
  console.log(`⚠️  Skipped (already exist): ${skipCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('\n📊 Total applicants processed: ' + testApplicants.length);
  console.log('\n💡 You can now view the candidates at: http://localhost:8080/hr/candidates');
  console.log('   Login credentials for any applicant:');
  console.log('   - Email: ahmed.dev@example.com (or any other email from the list)');
  console.log('   - Password: Pass123!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
