import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { hrApiService, type HRStats, type Job, type Interview, type Applicant } from "@/services/hrApi";
import { useToast } from "@/hooks/use-toast";
import { 
  FileBarChart, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
  Target,
  Filter,
  Eye
} from "lucide-react";

const HRReports = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [stats, setStats] = useState<HRStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch HR statistics
        const hrStats = await hrApiService.getHRStats();
        setStats(hrStats);
        
        // Fetch jobs
        const jobsResponse = await hrApiService.getJobs();
        setJobs(jobsResponse.data || []);
        
        // Fetch interviews
        const interviewsResponse = await hrApiService.getInterviews();
        setInterviews(interviewsResponse.data || []);
        
        // Fetch applicants
        const applicantsResponse = await hrApiService.getApplicants();
        setApplicants(applicantsResponse.data || []);
        
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to handle report download
  const handleDownloadReport = (reportName: string, reportType: string) => {
    toast({
      title: t('hr.reports.downloading'),
      description: `${t('hr.reports.downloading')} ${reportName}...`,
    });
    
    // Simulate report generation and download
    setTimeout(() => {
      // Create a mock PDF content
      const pdfContent = `%PDF-1.4
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
/Length 500
>>
stream
BT
/F1 16 Tf
72 720 Td
(${reportName}) Tj
0 -30 Td
/F1 12 Tf
(نوع التقرير: ${reportType}) Tj
0 -20 Td
(تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}) Tj
0 -30 Td
/F1 14 Tf
(إحصائيات:) Tj
0 -25 Td
/F1 12 Tf
(- إجمالي الوظائف: ${stats?.totalJobs || 0}) Tj
0 -20 Td
(- الوظائف النشطة: ${stats?.activeJobs || 0}) Tj
0 -20 Td
(- إجمالي المتقدمين: ${stats?.totalApplications || 0}) Tj
0 -20 Td
(- المقابلات المجدولة: ${stats?.scheduledInterviews || 0}) Tj
0 -20 Td
(- المرشحين المقبولين: ${stats?.hiredCandidates || 0}) Tj
0 -20 Td
(- المرشحين المرفوضين: ${stats?.rejectedApplications || 0}) Tj
0 -30 Td
/F1 10 Tf
(تم إنشاء هذا التقرير تلقائياً من نظام إدارة الموارد البشرية) Tj
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
0000000824 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
925
%%EOF`;
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: t('hr.reports.downloaded'),
        description: `${t('hr.reports.downloaded')} ${reportName}`,
      });
    }, 1000);
  };

  // Function to handle report view
  const handleViewReport = (reportName: string, reportType: string) => {
    toast({
      title: t('hr.reports.viewing'),
      description: `${t('hr.reports.viewing')} ${reportName}...`,
    });
    
    // Simulate report viewing
    setTimeout(() => {
      // Generate specific data based on report type
      let reportData: any = {
        title: reportName,
        type: reportType,
        generatedAt: new Date().toLocaleString('ar-SA'),
      };

      // Calculate actual counts from the data
      const activeJobsCount = jobs.filter(job => job.status === 'OPEN').length;
      const closedJobsCount = jobs.filter(job => job.status === 'CLOSED').length;
      const filledJobsCount = jobs.filter(job => job.status === 'HIRED').length;
      const totalApplicantsCount = applicants.length;
      const acceptedApplicantsCount = applicants.filter(app => 
        app.applications?.some(application => application.status === 'HIRED')
      ).length;
      const rejectedApplicantsCount = applicants.filter(app => 
        app.applications?.some(application => application.status === 'REJECTED')
      ).length;
      const scheduledInterviewsCount = interviews.filter(i => i.status === 'SCHEDULED').length;
      const completedInterviewsCount = interviews.filter(i => i.status === 'ATTENDED').length;
      const cancelledInterviewsCount = interviews.filter(i => i.status === 'CANCELLED').length;

      // Determine data based on report name
      if (reportName.includes('الوظائف النشطة') || reportName.includes('Active Jobs')) {
        reportData = {
          ...reportData,
          specificData: jobs.filter(job => job.status === 'OPEN'), // ✅ عرض جميع الوظائف النشطة
          dataType: 'jobs',
          summary: {
            total: activeJobsCount,
            description: 'الوظائف المفتوحة حالياً'
          }
        };
      } else if (reportName.includes('الوظائف المغلقة') || reportName.includes('Closed Jobs')) {
        reportData = {
          ...reportData,
          specificData: jobs.filter(job => job.status === 'CLOSED'), // ✅ عرض جميع الوظائف المغلقة
          dataType: 'jobs',
          summary: {
            total: closedJobsCount,
            description: 'الوظائف المغلقة'
          }
        };
      } else if (reportName.includes('الوظائف المشغولة') || reportName.includes('Filled Jobs')) {
        reportData = {
          ...reportData,
          specificData: jobs.filter(job => job.status === 'HIRED'), // ✅ عرض جميع الوظائف المشغولة
          dataType: 'jobs',
          summary: {
            total: filledJobsCount,
            description: 'الوظائف المشغولة'
          }
        };
      } else if (reportName.includes('المرشحين الجدد') || reportName.includes('New Candidates')) {
        reportData = {
          ...reportData,
          specificData: applicants, // ✅ عرض جميع المرشحين
          dataType: 'applicants',
          summary: {
            total: totalApplicantsCount,
            description: 'المرشحين الجدد'
          }
        };
      } else if (reportName.includes('المرشحين المقبولين') || reportName.includes('Accepted Candidates')) {
        const acceptedApplicants = applicants.filter(app => 
          app.applications?.some(application => application.status === 'HIRED')
        );
        reportData = {
          ...reportData,
          specificData: acceptedApplicants, // ✅ عرض جميع المرشحين المقبولين
          dataType: 'applicants',
          summary: {
            total: acceptedApplicantsCount,
            description: 'المرشحين المقبولين'
          }
        };
      } else if (reportName.includes('المرشحين المرفوضين') || reportName.includes('Rejected Candidates')) {
        const rejectedApplicants = applicants.filter(app => 
          app.applications?.some(application => application.status === 'REJECTED')
        );
        reportData = {
          ...reportData,
          specificData: rejectedApplicants, // ✅ عرض جميع المرشحين المرفوضين
          dataType: 'applicants',
          summary: {
            total: rejectedApplicantsCount,
            description: 'المرشحين المرفوضين'
          }
        };
      } else if (reportName.includes('المقابلات المجدولة') || reportName.includes('Scheduled Interviews')) {
        reportData = {
          ...reportData,
          specificData: interviews.filter(i => i.status === 'SCHEDULED'), // ✅ عرض جميع المقابلات المجدولة
          dataType: 'interviews',
          summary: {
            total: scheduledInterviewsCount,
            description: 'المقابلات المجدولة'
          }
        };
      } else if (reportName.includes('المقابلات المكتملة') || reportName.includes('Completed Interviews')) {
        reportData = {
          ...reportData,
          specificData: interviews.filter(i => i.status === 'ATTENDED'), // ✅ عرض جميع المقابلات المكتملة
          dataType: 'interviews',
          summary: {
            total: completedInterviewsCount,
            description: 'المقابلات المكتملة'
          }
        };
      } else if (reportName.includes('المقابلات الملغية') || reportName.includes('Cancelled Interviews')) {
        reportData = {
          ...reportData,
          specificData: interviews.filter(i => i.status === 'CANCELLED'), // ✅ عرض جميع المقابلات الملغية
          dataType: 'interviews',
          summary: {
            total: cancelledInterviewsCount,
            description: 'المقابلات الملغية'
          }
        };
      } else if (reportName.includes('الأداء الشهري') || reportName.includes('Monthly Performance')) {
        reportData = {
          ...reportData,
          specificData: {
            totalJobs: jobs.length,
            activeJobs: activeJobsCount,
            totalApplications: totalApplicantsCount,
            scheduledInterviews: scheduledInterviewsCount,
            hiredCandidates: acceptedApplicantsCount,
            rejectedApplications: rejectedApplicantsCount,
          },
          dataType: 'performance',
          summary: {
            total: 'شهري',
            description: 'مؤشرات الأداء الشهرية'
          }
        };
      } else if (reportName.includes('معدل النجاح') || reportName.includes('Success Rate')) {
        const successRate = totalApplicantsCount > 0 ? (acceptedApplicantsCount / totalApplicantsCount * 100).toFixed(1) : '0.0';
        reportData = {
          ...reportData,
          specificData: {
            successRate: successRate,
            totalApplications: totalApplicantsCount,
            hiredCandidates: acceptedApplicantsCount,
            rejectedApplications: rejectedApplicantsCount,
          },
          dataType: 'success',
          summary: {
            total: `${successRate}%`,
            description: 'معدل نجاح التوظيف'
          }
        };
      } else if (reportName.includes('الإنتاجية') || reportName.includes('Productivity')) {
        reportData = {
          ...reportData,
          specificData: {
            jobsPerMonth: Math.round(jobs.length / 12),
            interviewsPerWeek: Math.round(scheduledInterviewsCount / 4),
            hiresPerMonth: Math.round(acceptedApplicantsCount / 12),
            avgTimeToHire: '15 يوم',
          },
          dataType: 'productivity',
          summary: {
            total: 'فعال',
            description: 'مؤشرات إنتاجية الفريق'
          }
        };
      } else {
        // Default data
        reportData = {
          ...reportData,
          specificData: jobs, // ✅ عرض جميع الوظائف
          dataType: 'general',
          summary: {
            total: jobs.length,
            description: 'بيانات عامة'
          }
        };
      }
      
      // Open report in a new window/tab with better sizing for large data
      const reportWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      if (reportWindow) {
        let tableContent = '';
        
        // Generate table content based on data type
        if (reportData.dataType === 'jobs') {
          tableContent = `
            <h2>${reportData.summary.description}</h2>
            <p class="data-count">إجمالي السجلات: <strong>${reportData.specificData.length}</strong></p>
            <table class="data-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>الشركة</th>
                  <th>الموقع</th>
                  <th>الحالة</th>
                  <th>تاريخ النشر</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.specificData.map(job => `
                  <tr>
                    <td>${job.title}</td>
                    <td>${job.company}</td>
                    <td>${job.location}</td>
                    <td><span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span></td>
                    <td>${job.createdAt ? new Date(job.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        } else if (reportData.dataType === 'applicants') {
          tableContent = `
            <h2>${reportData.summary.description}</h2>
            <p class="data-count">إجمالي السجلات: <strong>${reportData.specificData.length}</strong></p>
            <table class="data-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد الإلكتروني</th>
                  <th>الهاتف</th>
                  <th>الموقع</th>
                  <th>تاريخ التقديم</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.specificData.map(applicant => `
                  <tr>
                    <td>${applicant.user?.name || 'غير محدد'}</td>
                    <td>${applicant.user?.email || 'غير محدد'}</td>
                    <td>${applicant.phone || 'غير محدد'}</td>
                    <td>${applicant.location || 'غير محدد'}</td>
                    <td>${applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        } else if (reportData.dataType === 'interviews') {
          tableContent = `
            <h2>${reportData.summary.description}</h2>
            <p class="data-count">إجمالي السجلات: <strong>${reportData.specificData.length}</strong></p>
            <table class="data-table">
              <thead>
                <tr>
                  <th>المرشح</th>
                  <th>الوظيفة</th>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.specificData.map(interview => `
                  <tr>
                    <td>${interview.applicant?.user?.name || 'غير محدد'}</td>
                    <td>${interview.job?.title || 'غير محدد'}</td>
                    <td>${interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString('ar-SA') : 'غير محدد'}</td>
                    <td>${interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleTimeString('ar-SA') : 'غير محدد'}</td>
                    <td><span class="status-badge status-${interview.status.toLowerCase()}">${interview.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        } else if (reportData.dataType === 'performance') {
          tableContent = `
            <h2>${reportData.summary.description}</h2>
            <div class="stats">
              <div class="stat-card">
                <h3>إجمالي الوظائف</h3>
                <p style="font-size: 24px; font-weight: bold; color: #2563eb;">${reportData.specificData.totalJobs}</p>
              </div>
              <div class="stat-card">
                <h3>الوظائف النشطة</h3>
                <p style="font-size: 24px; font-weight: bold; color: #16a34a;">${reportData.specificData.activeJobs}</p>
              </div>
              <div class="stat-card">
                <h3>إجمالي المتقدمين</h3>
                <p style="font-size: 24px; font-weight: bold; color: #7c3aed;">${reportData.specificData.totalApplications}</p>
              </div>
              <div class="stat-card">
                <h3>المقابلات المجدولة</h3>
                <p style="font-size: 24px; font-weight: bold; color: #ea580c;">${reportData.specificData.scheduledInterviews}</p>
              </div>
              <div class="stat-card">
                <h3>المرشحين المقبولين</h3>
                <p style="font-size: 24px; font-weight: bold; color: #059669;">${reportData.specificData.hiredCandidates}</p>
              </div>
              <div class="stat-card">
                <h3>المرشحين المرفوضين</h3>
                <p style="font-size: 24px; font-weight: bold; color: #dc2626;">${reportData.specificData.rejectedApplications}</p>
              </div>
            </div>
          `;
        } else if (reportData.dataType === 'success') {
          tableContent = `
            <h2>${reportData.summary.description}</h2>
            <div class="stats">
              <div class="stat-card">
                <h3>معدل النجاح</h3>
                <p style="font-size: 32px; font-weight: bold; color: #059669;">${reportData.specificData.successRate}%</p>
              </div>
              <div class="stat-card">
                <h3>إجمالي المتقدمين</h3>
                <p style="font-size: 24px; font-weight: bold; color: #2563eb;">${reportData.specificData.totalApplications}</p>
              </div>
              <div class="stat-card">
                <h3>المرشحين المقبولين</h3>
                <p style="font-size: 24px; font-weight: bold; color: #16a34a;">${reportData.specificData.hiredCandidates}</p>
              </div>
              <div class="stat-card">
                <h3>المرشحين المرفوضين</h3>
                <p style="font-size: 24px; font-weight: bold; color: #dc2626;">${reportData.specificData.rejectedApplications}</p>
              </div>
            </div>
          `;
        } else if (reportData.dataType === 'productivity') {
          tableContent = `
            <h2>${reportData.summary.description}</h2>
            <div class="stats">
              <div class="stat-card">
                <h3>الوظائف شهرياً</h3>
                <p style="font-size: 24px; font-weight: bold; color: #2563eb;">${reportData.specificData.jobsPerMonth}</p>
              </div>
              <div class="stat-card">
                <h3>المقابلات أسبوعياً</h3>
                <p style="font-size: 24px; font-weight: bold; color: #7c3aed;">${reportData.specificData.interviewsPerWeek}</p>
              </div>
              <div class="stat-card">
                <h3>التوظيف شهرياً</h3>
                <p style="font-size: 24px; font-weight: bold; color: #16a34a;">${reportData.specificData.hiresPerMonth}</p>
              </div>
              <div class="stat-card">
                <h3>متوسط وقت التوظيف</h3>
                <p style="font-size: 24px; font-weight: bold; color: #ea580c;">${reportData.specificData.avgTimeToHire}</p>
              </div>
            </div>
          `;
        }

        reportWindow.document.write(`
          <html dir="rtl">
            <head>
              <title>${reportName}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  direction: rtl; 
                  background: #f8f9fa;
                }
                .header { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white;
                  padding: 20px; 
                  border-radius: 8px; 
                  margin-bottom: 20px; 
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .stats { 
                  display: grid; 
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                  gap: 15px; 
                  margin: 20px 0; 
                }
                .stat-card { 
                  background: #fff; 
                  border: 1px solid #ddd; 
                  padding: 20px; 
                  border-radius: 8px; 
                  text-align: center; 
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  transition: transform 0.2s;
                }
                .stat-card:hover {
                  transform: translateY(-2px);
                }
                .data-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 20px 0; 
                  background: white;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .data-table th, .data-table td { 
                  border: 1px solid #ddd; 
                  padding: 12px; 
                  text-align: right; 
                }
                .data-table th { 
                  background: #f8f9fa; 
                  font-weight: bold; 
                  color: #495057;
                }
                .data-table tbody tr:nth-child(even) {
                  background: #f8f9fa;
                }
                .data-table tbody tr:hover {
                  background: #e9ecef;
                }
                .summary { 
                  background: #e0f2fe; 
                  padding: 20px; 
                  border-radius: 8px; 
                  margin: 20px 0; 
                  border-left: 4px solid #2196f3;
                }
                .data-count {
                  background: #d4edda;
                  color: #155724;
                  padding: 10px;
                  border-radius: 4px;
                  margin: 10px 0;
                  border-left: 4px solid #28a745;
                }
                .status-badge {
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: bold;
                  text-transform: uppercase;
                }
                .status-open { background: #d4edda; color: #155724; }
                .status-closed { background: #f8d7da; color: #721c24; }
                .status-hired { background: #d1ecf1; color: #0c5460; }
                .status-scheduled { background: #fff3cd; color: #856404; }
                .status-attended { background: #d4edda; color: #155724; }
                .status-cancelled { background: #f8d7da; color: #721c24; }
                .status-rejected { background: #f8d7da; color: #721c24; }
                .status-pending { background: #fff3cd; color: #856404; }
                h1 { margin: 0; }
                h2 { color: #495057; margin-top: 30px; }
                h3 { color: #6c757d; margin: 0 0 10px 0; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${reportName}</h1>
                <p>نوع التقرير: ${reportType}</p>
                <p>تاريخ الإنشاء: ${reportData.generatedAt}</p>
              </div>
              
              <div class="summary">
                <h3>ملخص التقرير</h3>
                <p><strong>العدد الإجمالي:</strong> ${reportData.summary.total}</p>
                <p><strong>الوصف:</strong> ${reportData.summary.description}</p>
              </div>
              
              ${tableContent}
            </body>
          </html>
        `);
        reportWindow.document.close();
      }
      
      toast({
        title: t('hr.reports.viewed'),
        description: `${t('hr.reports.viewed')} ${reportName}`,
      });
    }, 1000);
  };
  
  // Calculate actual counts for display
  const activeJobsCount = jobs.filter(job => job.status === 'OPEN').length;
  const closedJobsCount = jobs.filter(job => job.status === 'CLOSED').length;
  const filledJobsCount = jobs.filter(job => job.status === 'HIRED').length;
  const totalApplicantsCount = applicants.length;
  const acceptedApplicantsCount = applicants.filter(app => 
    app.applications?.some(application => application.status === 'HIRED')
  ).length;
  const rejectedApplicantsCount = applicants.filter(app => 
    app.applications?.some(application => application.status === 'REJECTED')
  ).length;
  const scheduledInterviewsCount = interviews.filter(i => i.status === 'SCHEDULED').length;
  const completedInterviewsCount = interviews.filter(i => i.status === 'ATTENDED').length;
  const cancelledInterviewsCount = interviews.filter(i => i.status === 'CANCELLED').length;
  const successRate = totalApplicantsCount > 0 ? (acceptedApplicantsCount / totalApplicantsCount * 100).toFixed(1) : '0.0';

  const reportCategories = [
    {
      title: t('hr.reports.employmentReports'),
      description: t('hr.reports.employmentReportsDesc'),
      icon: Briefcase,
      color: "bg-primary",
      reports: [
        {
          name: t('hr.reports.activeJobsReport'),
          description: `${activeJobsCount} ${t('hr.reports.openJobs')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "2.3 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        },
        {
          name: t('hr.reports.closedJobsReport'),
          description: `${closedJobsCount} ${t('hr.reports.closedJobs')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "1.8 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        },
        {
          name: t('hr.reports.filledJobsReport'),
          description: `${filledJobsCount} ${t('hr.reports.filledJobs')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "1.5 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        }
      ]
    },
    {
      title: t('hr.reports.candidateReports'),
      description: t('hr.reports.candidateReportsDesc'),
      icon: Users,
      color: "bg-secondary",
      reports: [
        {
          name: t('hr.reports.newCandidatesReport'),
          description: `${totalApplicantsCount} ${t('hr.reports.newApplicants')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "3.2 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        },
        {
          name: t('hr.reports.acceptedCandidatesReport'),
          description: `${acceptedApplicantsCount} ${t('hr.reports.acceptedApplicants')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "2.1 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        },
        {
          name: t('hr.reports.rejectedCandidatesReport'),
          description: `${rejectedApplicantsCount} ${t('hr.reports.rejectedApplicants')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "1.9 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        }
      ]
    },
    {
      title: t('hr.reports.interviewReports'),
      description: t('hr.reports.interviewReportsDesc'),
      icon: Calendar,
      color: "bg-accent",
      reports: [
        {
          name: t('hr.reports.scheduledInterviewsReport'),
          description: `${scheduledInterviewsCount} ${t('hr.reports.scheduledInterviews')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "2.7 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        },
        {
          name: t('hr.reports.completedInterviewsReport'),
          description: `${completedInterviewsCount} ${t('hr.reports.completedInterviews')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "2.4 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        },
        {
          name: t('hr.reports.cancelledInterviewsReport'),
          description: `${cancelledInterviewsCount} ${t('hr.reports.cancelledInterviews')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "1.6 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        }
      ]
    },
    {
      title: t('hr.reports.performanceReports'),
      description: t('hr.reports.performanceReportsDesc'),
      icon: Target,
      color: "bg-info",
      reports: [
        {
          name: t('hr.reports.monthlyPerformanceReport'),
          description: t('hr.reports.currentMonthPerformance'),
          date: new Date().toLocaleDateString('ar-SA'),
          size: "4.1 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        },
        {
          name: t('hr.reports.successRateReport'),
          description: `${successRate}% ${t('hr.reports.successRate')}`,
          date: new Date().toLocaleDateString('ar-SA'),
          size: "2.8 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        },
        {
          name: t('hr.reports.productivityReport'),
          description: t('hr.reports.teamProductivity'),
          date: new Date().toLocaleDateString('ar-SA'),
          size: "3.5 MB",
          format: "PDF",
          type: t('hr.reports.status.running')
        }
      ]
    }
  ];

  const quickStats = [
    {
      title: t('hr.dashboard.totalJobs'),
      value: jobs.length,
      icon: Briefcase,
      color: "text-blue-600"
    },
    {
      title: t('hr.dashboard.activeJobs'),
      value: activeJobsCount,
      icon: Target,
      color: "text-green-600"
    },
    {
      title: t('hr.dashboard.totalApplications'),
      value: totalApplicantsCount,
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: t('hr.dashboard.scheduledInterviews'),
      value: scheduledInterviewsCount,
      icon: Calendar,
      color: "text-orange-600"
    }
  ];

  return (
    <MainLayout userRole="hr" userName={t('hr.reports.userName')}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{t('hr.reports.title')}</h1>
            <p className="text-muted-foreground">{t('hr.reports.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {t('hr.reports.filterReports')}
            </Button>
            <Button className="gap-2">
              <Calendar className="h-4 w-4" />
              {t('hr.reports.customReport')}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                    <div className="h-8 bg-muted animate-pulse rounded w-12"></div>
                  </div>
                  <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                </div>
              </Card>
            ))
          ) : (
            quickStats.map((stat, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`${category.color} p-2 rounded-lg text-white`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground font-normal">{category.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.reports.map((report, reportIndex) => (
                    <div key={reportIndex} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{report.name}</h4>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-2"
                          onClick={() => handleDownloadReport(report.name, report.type)}
                        >
                          <Download className="h-3 w-3 ml-1" />
                          {t('hr.reports.download')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 px-2"
                          onClick={() => handleViewReport(report.name, report.type)}
                        >
                          <Eye className="h-3 w-3 ml-1" />
                          {t('hr.reports.view')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent HR Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5" />
              {t('hr.reports.recentReports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
              
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileBarChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{report.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                        <span>•</span>
                        <span>{report.format}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">{report.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-3 w-3" />
                    {t('hr.reports.download')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('hr.reports.monthlyPerformanceSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('hr.reports.jobsPosted')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">32</span>
                    <Badge variant="outline" className="text-xs text-secondary">+15%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('hr.reports.newCandidates')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">128</span>
                    <Badge variant="outline" className="text-xs text-secondary">+23%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('hr.reports.completedInterviews')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">45</span>
                    <Badge variant="outline" className="text-xs text-accent">+8%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('hr.reports.successfulHires')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">18</span>
                    <Badge variant="outline" className="text-xs text-secondary">+12%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('hr.reports.goalAchievement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{t('hr.reports.monthlyHiringGoal')}</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{t('hr.reports.candidateQuality')}</span>
                    <span className="text-sm font-medium">88%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{t('hr.reports.clientSatisfaction')}</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-info h-2 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default HRReports;