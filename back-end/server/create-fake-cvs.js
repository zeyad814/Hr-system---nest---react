const fs = require('fs');
const path = require('path');

// Simple PDF content template
const createPDFContent = (candidateName, email, phone, skills) => {
  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 300
>>
stream
BT
/F1 14 Tf
72 720 Td
(Sample CV Document) Tj
0 -25 Td
/Candidate Name: ${candidateName}) Tj
0 -20 Td
(Email: ${email}) Tj
0 -20 Td
(Phone: ${phone}) Tj
0 -20 Td
(Skills: ${skills}) Tj
0 -20 Td
(Experience: 3-5 years) Tj
0 -20 Td
(Education: Bachelor's Degree) Tj
0 -20 Td
(Location: Riyadh, Saudi Arabia) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000624 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
725
%%EOF`;
};

// Arabic names and data
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

// Create CV files
const uploadsDir = path.join(__dirname, 'uploads', 'cvs');

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('📄 Creating fake CV files...');

for (let i = 0; i < 20; i++) {
  const fileName = `cv-candidate-${i + 1}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  
  const pdfContent = createPDFContent(
    arabicNames[i],
    arabicEmails[i],
    phoneNumbers[i],
    skills[i]
  );
  
  fs.writeFileSync(filePath, pdfContent);
  console.log(`✅ Created CV file: ${fileName}`);
}

console.log('🎉 All CV files created successfully!');

