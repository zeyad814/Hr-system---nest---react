import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteHRData() {
  console.log('🗑️  بدء حذف بيانات HR...\n');

  try {
    // 1. حذف Sales Offers المرتبطة بـ JobApplications
    console.log('1. حذف Sales Offers...');
    const deletedSalesOffers = await prisma.salesOffer.deleteMany({});
    console.log(`   ✓ تم حذف ${deletedSalesOffers.count} Sales Offer\n`);

    // 2. حذف Interview Schedules
    console.log('2. حذف Interview Schedules...');
    const deletedSchedules = await prisma.interviewSchedule.deleteMany({});
    console.log(`   ✓ تم حذف ${deletedSchedules.count} Interview Schedule\n`);

    // 3. حذف Interviews (ستحذف تلقائياً ApplicationTimeline المرتبطة)
    console.log('3. حذف Interviews...');
    const deletedInterviews = await prisma.interview.deleteMany({});
    console.log(`   ✓ تم حذف ${deletedInterviews.count} Interview\n`);

    // 4. حذف Feedback المرتبطة بـ JobApplications
    console.log('4. حذف Feedback...');
    const deletedFeedback = await prisma.feedback.deleteMany({});
    console.log(`   ✓ تم حذف ${deletedFeedback.count} Feedback\n`);

    // 5. حذف ApplicationTimeline
    console.log('5. حذف ApplicationTimeline...');
    const deletedTimeline = await prisma.applicationTimeline.deleteMany({});
    console.log(`   ✓ تم حذف ${deletedTimeline.count} Application Timeline\n`);

    // 6. حذف Contracts المرتبطة بـ applicants (فقط التي لها applicantId)
    console.log('6. حذف Contracts المرتبطة بـ applicants...');
    const contractsWithApplicants = await prisma.contract.findMany({
      where: {
        applicantId: { not: null as any },
      },
      select: { id: true },
    });
    const deletedContracts = await prisma.contract.deleteMany({
      where: {
        id: { in: contractsWithApplicants.map(c => c.id) },
      },
    });
    console.log(`   ✓ تم حذف ${deletedContracts.count} Contract\n`);

    // 7. حذف JobApplications (سيحذف تلقائياً Experiences, Education, Projects, Qualifications بسبب onDelete: Cascade)
    console.log('7. حذف JobApplications...');
    const deletedApplications = await prisma.jobApplication.deleteMany({});
    console.log(`   ✓ تم حذف ${deletedApplications.count} Job Application\n`);

    // 8. حذف Applicants (سيحذف تلقائياً Experiences, Education, Projects, Qualifications)
    console.log('8. حذف Applicants...');
    const deletedApplicants = await prisma.applicant.deleteMany({});
    console.log(`   ✓ تم حذف ${deletedApplicants.count} Applicant\n`);

    // 9. حذف Users التي role = APPLICANT (اختياري - احذر، قد تحذف مستخدمين آخرين)
    console.log('9. حذف Users بحالة APPLICANT...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: 'APPLICANT',
      },
    });
    console.log(`   ✓ تم حذف ${deletedUsers.count} User (APPLICANT)\n`);

    console.log('✅ تم حذف جميع بيانات HR بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء حذف البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteHRData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

