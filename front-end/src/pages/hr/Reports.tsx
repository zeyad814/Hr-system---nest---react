import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { hrApiService, type HRStats, type Job, type Interview, type Applicant, type DateRangeFilter } from "@/services/hrApi";
import { useToast } from "@/hooks/use-toast";
import { ReportFiltersModal, type ReportFilters } from "@/components/hr/ReportFiltersModal";
import { CustomReportModal, type CustomReportConfig } from "@/components/hr/CustomReportModal";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  Eye,
  X
} from "lucide-react";

const HRReports = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [stats, setStats] = useState<HRStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: { from: undefined, to: undefined },
    jobStatus: 'all',
    interviewType: 'all',
    interviewStatus: 'all',
    applicationStatus: 'all',
    clientId: 'all',
    department: 'all',
    searchTerm: ''
  });
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch HR statistics with filters
        const dateRangeFilter: DateRangeFilter = {
          startDate: filters.dateRange.from?.toISOString(),
          endDate: filters.dateRange.to?.toISOString()
        };
        
        const hrStats = await hrApiService.getHRStats();
        setStats(hrStats);
        
        // Fetch jobs with filters
        const jobsResponse = await hrApiService.getJobs(filters.clientId !== 'all' ? filters.clientId : undefined);
        setJobs(jobsResponse.data || []);
        
        // Fetch interviews with filters
        const interviewFilters = {
          status: filters.interviewStatus !== 'all' ? filters.interviewStatus : undefined,
          type: filters.interviewType !== 'all' ? filters.interviewType : undefined,
          dateFrom: filters.dateRange.from?.toISOString(),
          dateTo: filters.dateRange.to?.toISOString()
        };
        const interviewsResponse = await hrApiService.getInterviews(interviewFilters);
        setInterviews(interviewsResponse.data || []);
        
        // Fetch applicants with filters
        const applicantsResponse = await hrApiService.getApplicants(
          filters.applicationStatus !== 'all' ? filters.applicationStatus : undefined,
          filters.searchTerm || undefined
        );
        setApplicants(applicantsResponse.data || []);
        
        // Fetch clients for filter options
        const clientsResponse = await hrApiService.getClients();
        setClients(clientsResponse.data || []);
        
        // Extract unique departments from jobs
        const uniqueDepartments = [...new Set(jobs.map(job => job.client?.name).filter(Boolean))];
        setDepartments(uniqueDepartments);
        
      } catch (error) {
        console.error('Error fetching reports data:', error);
        toast({
          title: t('hr.reports.error'),
          description: t('hr.reports.errorDescription'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, t, toast]);

  // Function to generate report HTML content
  const generateReportHTML = (reportName: string, reportType: string) => {
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
        specificData: jobs.filter(job => job.status === 'OPEN'),
        dataType: 'jobs',
        summary: {
          total: activeJobsCount,
          description: 'الوظائف المفتوحة حالياً'
        }
      };
    } else if (reportName.includes('الوظائف المغلقة') || reportName.includes('Closed Jobs')) {
      reportData = {
        ...reportData,
        specificData: jobs.filter(job => job.status === 'CLOSED'),
        dataType: 'jobs',
        summary: {
          total: closedJobsCount,
          description: 'الوظائف المغلقة'
        }
      };
    } else if (reportName.includes('الوظائف المشغولة') || reportName.includes('Filled Jobs')) {
      reportData = {
        ...reportData,
        specificData: jobs.filter(job => job.status === 'HIRED'),
        dataType: 'jobs',
        summary: {
          total: filledJobsCount,
          description: 'الوظائف المشغولة'
        }
      };
    } else if (reportName.includes('المرشحين الجدد') || reportName.includes('New Candidates')) {
      reportData = {
        ...reportData,
        specificData: applicants,
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
        specificData: acceptedApplicants,
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
        specificData: rejectedApplicants,
        dataType: 'applicants',
        summary: {
          total: rejectedApplicantsCount,
          description: 'المرشحين المرفوضين'
        }
      };
    } else if (reportName.includes('المقابلات المجدولة') || reportName.includes('Scheduled Interviews')) {
      reportData = {
        ...reportData,
        specificData: interviews.filter(i => i.status === 'SCHEDULED'),
        dataType: 'interviews',
        summary: {
          total: scheduledInterviewsCount,
          description: 'المقابلات المجدولة'
        }
      };
    } else if (reportName.includes('المقابلات المكتملة') || reportName.includes('Completed Interviews')) {
      reportData = {
        ...reportData,
        specificData: interviews.filter(i => i.status === 'ATTENDED'),
        dataType: 'interviews',
        summary: {
          total: completedInterviewsCount,
          description: 'المقابلات المكتملة'
        }
      };
    } else if (reportName.includes('المقابلات الملغية') || reportName.includes('Cancelled Interviews')) {
      reportData = {
        ...reportData,
        specificData: interviews.filter(i => i.status === 'CANCELLED'),
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
        specificData: jobs,
        dataType: 'general',
        summary: {
          total: jobs.length,
          description: 'بيانات عامة'
        }
      };
    }

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

    return `
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
    `;
  };

  // Function to handle report download
  const handleDownloadReport = (reportName: string, reportType: string) => {
    toast({
      title: t('hr.reports.downloading'),
      description: `${t('hr.reports.downloading')} ${reportName}...`,
    });

    setTimeout(() => {
      const htmlContent = generateReportHTML(reportName, reportType);

      // Create a temporary iframe to print the content as PDF
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // Wait for content to load then print
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      }

      toast({
        title: t('hr.reports.downloaded'),
        description: `${t('hr.reports.downloaded')} ${reportName}`,
      });
    }, 500);
  };

  // Filter handling functions
  const handleApplyFilters = (newFilters: ReportFilters) => {
    setFilters(newFilters);
    toast({
      title: t('hr.reports.filtersApplied'),
      description: t('hr.reports.filtersAppliedDescription'),
    });
  };

  // Function to download all filtered reports as a single PDF
  const handleDownloadAllReports = async (appliedFilters: ReportFilters) => {
    try {
      toast({
        title: t('hr.reports.downloading'),
        description: 'جاري تجميع جميع التقارير...',
      });

      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;

      // Helper function to add a new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Add title page
      pdf.setFontSize(20);
      pdf.text('تقرير شامل - HR Reports', pdf.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.text(`تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}`, pdf.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Add filter information
      pdf.setFontSize(14);
      pdf.text('معايير الفلترة:', margin, yPosition);
      yPosition += 10;
      pdf.setFontSize(10);

      const filterTexts: string[] = [];
      if (appliedFilters.dateRange.from || appliedFilters.dateRange.to) {
        const from = appliedFilters.dateRange.from ? appliedFilters.dateRange.from.toLocaleDateString('ar-SA') : 'غير محدد';
        const to = appliedFilters.dateRange.to ? appliedFilters.dateRange.to.toLocaleDateString('ar-SA') : 'غير محدد';
        filterTexts.push(`نطاق التاريخ: من ${from} إلى ${to}`);
      }
      if (appliedFilters.jobStatus !== 'all') {
        filterTexts.push(`حالة الوظيفة: ${appliedFilters.jobStatus}`);
      }
      if (appliedFilters.interviewType !== 'all') {
        filterTexts.push(`نوع المقابلة: ${appliedFilters.interviewType}`);
      }
      if (appliedFilters.interviewStatus !== 'all') {
        filterTexts.push(`حالة المقابلة: ${appliedFilters.interviewStatus}`);
      }
      if (appliedFilters.applicationStatus !== 'all') {
        filterTexts.push(`حالة التقديم: ${appliedFilters.applicationStatus}`);
      }
      if (appliedFilters.clientId !== 'all') {
        const client = clients.find(c => c.id === appliedFilters.clientId);
        filterTexts.push(`العميل: ${client?.name || appliedFilters.clientId}`);
      }
      if (appliedFilters.department !== 'all') {
        filterTexts.push(`القسم: ${appliedFilters.department}`);
      }
      if (appliedFilters.searchTerm) {
        filterTexts.push(`كلمة البحث: ${appliedFilters.searchTerm}`);
      }

      if (filterTexts.length === 0) {
        filterTexts.push('لا توجد فلاتر محددة - جميع البيانات');
      }

      filterTexts.forEach(text => {
        checkPageBreak(lineHeight);
        pdf.text(text, margin, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 10;

      // Get filtered data
      const filteredJobs = jobs.filter(job => {
        if (appliedFilters.jobStatus !== 'all' && job.status !== appliedFilters.jobStatus) return false;
        if (appliedFilters.clientId !== 'all' && job.clientId !== appliedFilters.clientId) return false;
        return true;
      });

      const filteredInterviews = interviews.filter(interview => {
        if (appliedFilters.interviewType !== 'all' && interview.type !== appliedFilters.interviewType) return false;
        if (appliedFilters.interviewStatus !== 'all' && interview.status !== appliedFilters.interviewStatus) return false;
        if (appliedFilters.dateRange.from && interview.scheduledAt && new Date(interview.scheduledAt) < appliedFilters.dateRange.from) return false;
        if (appliedFilters.dateRange.to && interview.scheduledAt && new Date(interview.scheduledAt) > appliedFilters.dateRange.to) return false;
        return true;
      });

      const filteredApplicants = applicants.filter(applicant => {
        if (appliedFilters.applicationStatus !== 'all') {
          const hasMatchingStatus = applicant.applications?.some(app => app.status === appliedFilters.applicationStatus);
          if (!hasMatchingStatus) return false;
        }
        if (appliedFilters.searchTerm) {
          const searchLower = appliedFilters.searchTerm.toLowerCase();
          const matchesSearch = 
            applicant.user?.name?.toLowerCase().includes(searchLower) ||
            applicant.user?.email?.toLowerCase().includes(searchLower) ||
            applicant.phone?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }
        return true;
      });

      // Add Jobs Report
      if (filteredJobs.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.text('تقرير الوظائف', margin, yPosition);
        yPosition += 10;

        const jobsTableData = filteredJobs.map(job => [
          job.title || 'غير محدد',
          job.client?.name || 'غير محدد',
          job.location || 'غير محدد',
          job.status || 'غير محدد',
          job.createdAt ? new Date(job.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'
        ]);

        (pdf as any).autoTable({
          startY: yPosition,
          head: [['العنوان', 'الشركة', 'الموقع', 'الحالة', 'تاريخ النشر']],
          body: jobsTableData,
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
          styles: { font: 'Arial', fontSize: 9, cellPadding: 3 },
          margin: { left: margin, right: margin },
          didDrawPage: (data: any) => {
            yPosition = data.cursor.y + 10;
          }
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 10;
      }

      // Add Interviews Report
      if (filteredInterviews.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.text('تقرير المقابلات', margin, yPosition);
        yPosition += 10;

        const interviewsTableData = filteredInterviews.map(interview => [
          interview.applicant?.user?.name || 'غير محدد',
          interview.job?.title || 'غير محدد',
          interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleDateString('ar-SA') : 'غير محدد',
          interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleTimeString('ar-SA') : 'غير محدد',
          interview.status || 'غير محدد'
        ]);

        (pdf as any).autoTable({
          startY: yPosition,
          head: [['المرشح', 'الوظيفة', 'التاريخ', 'الوقت', 'الحالة']],
          body: interviewsTableData,
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
          styles: { font: 'Arial', fontSize: 9, cellPadding: 3 },
          margin: { left: margin, right: margin },
          didDrawPage: (data: any) => {
            yPosition = data.cursor.y + 10;
          }
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 10;
      }

      // Add Applicants Report
      if (filteredApplicants.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.text('تقرير المتقدمين', margin, yPosition);
        yPosition += 10;

        const applicantsTableData = filteredApplicants.map(applicant => [
          applicant.user?.name || 'غير محدد',
          applicant.user?.email || 'غير محدد',
          applicant.phone || 'غير محدد',
          applicant.location || 'غير محدد',
          applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'
        ]);

        (pdf as any).autoTable({
          startY: yPosition,
          head: [['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الموقع', 'تاريخ التقديم']],
          body: applicantsTableData,
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
          styles: { font: 'Arial', fontSize: 9, cellPadding: 3 },
          margin: { left: margin, right: margin },
          didDrawPage: (data: any) => {
            yPosition = data.cursor.y + 10;
          }
        });

        yPosition = (pdf as any).lastAutoTable.finalY + 10;
      }

      // Add Summary
      checkPageBreak(40);
      pdf.setFontSize(16);
      pdf.text('ملخص التقرير', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      const summaryData = [
        `إجمالي الوظائف: ${filteredJobs.length}`,
        `إجمالي المقابلات: ${filteredInterviews.length}`,
        `إجمالي المتقدمين: ${filteredApplicants.length}`,
      ];

      summaryData.forEach(text => {
        checkPageBreak(lineHeight + 2);
        pdf.text(text, margin, yPosition);
        yPosition += lineHeight + 2;
      });

      // Save the PDF
      const fileName = `hr-reports-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: t('hr.reports.downloaded'),
        description: 'تم تحميل جميع التقارير بنجاح',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء ملف PDF',
        variant: 'destructive',
      });
    }
  };

  const handleCustomReport = (config: CustomReportConfig) => {
    toast({
      title: t('hr.reports.generatingReport'),
      description: t('hr.reports.generatingReportDescription'),
    });
    
    // Here you would implement the actual report generation logic
    // For now, we'll just show a success message
    setTimeout(() => {
      toast({
        title: t('hr.reports.reportGenerated'),
        description: t('hr.reports.reportGeneratedDescription'),
      });
    }, 2000);
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { from: undefined, to: undefined },
      jobStatus: 'all',
      interviewType: 'all',
      interviewStatus: 'all',
      applicationStatus: 'all',
      clientId: 'all',
      department: 'all',
      searchTerm: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.jobStatus !== 'all') count++;
    if (filters.interviewType !== 'all') count++;
    if (filters.interviewStatus !== 'all') count++;
    if (filters.applicationStatus !== 'all') count++;
    if (filters.clientId !== 'all') count++;
    if (filters.department !== 'all') count++;
    if (filters.searchTerm !== '') count++;
    return count;
  };

  // Function to handle report view
  const handleViewReport = (reportName: string, reportType: string) => {
    toast({
      title: t('hr.reports.viewing'),
      description: `${t('hr.reports.viewing')} ${reportName}...`,
    });

    setTimeout(() => {
      const htmlContent = generateReportHTML(reportName, reportType);

      // Open report in a new window/tab
      const reportWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      if (reportWindow) {
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
      }

      toast({
        title: t('hr.reports.viewed'),
        description: `${t('hr.reports.viewed')} ${reportName}`,
      });
    }, 500);
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
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowFiltersModal(true)}
            >
              <Filter className="h-4 w-4" />
              {t('hr.reports.filterReports')}
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
            <Button 
              className="gap-2"
              onClick={() => setShowCustomReportModal(true)}
            >
              <Calendar className="h-4 w-4" />
              {t('hr.reports.customReport')}
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{t('hr.reports.activeFilters')}:</span>
                  <div className="flex flex-wrap gap-2">
                    {filters.dateRange.from && (
                      <Badge variant="secondary" className="gap-1">
                        {t('hr.reports.from')}: {filters.dateRange.from.toLocaleDateString()}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, from: undefined } }))}
                        />
                      </Badge>
                    )}
                    {filters.dateRange.to && (
                      <Badge variant="secondary" className="gap-1">
                        {t('hr.reports.to')}: {filters.dateRange.to.toLocaleDateString()}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, to: undefined } }))}
                        />
                      </Badge>
                    )}
                    {filters.jobStatus !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        {t('hr.reports.jobStatus')}: {filters.jobStatus}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFilters(prev => ({ ...prev, jobStatus: 'all' }))}
                        />
                      </Badge>
                    )}
                    {filters.interviewType !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        {t('hr.reports.interviewType')}: {filters.interviewType}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFilters(prev => ({ ...prev, interviewType: 'all' }))}
                        />
                      </Badge>
                    )}
                    {filters.searchTerm && (
                      <Badge variant="secondary" className="gap-1">
                        {t('hr.reports.search')}: {filters.searchTerm}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                        />
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t('hr.reports.clearAll')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Filter Modal */}
        <ReportFiltersModal
          isOpen={showFiltersModal}
          onClose={() => setShowFiltersModal(false)}
          onApplyFilters={handleApplyFilters}
          onDownloadAll={handleDownloadAllReports}
          currentFilters={filters}
          clients={clients}
          departments={departments}
        />

        {/* Custom Report Modal */}
        <CustomReportModal
          isOpen={showCustomReportModal}
          onClose={() => setShowCustomReportModal(false)}
          onGenerateReport={handleCustomReport}
          clients={clients}
        />
      </div>
    </MainLayout>
  );
};

export default HRReports;