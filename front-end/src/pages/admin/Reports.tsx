import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Target,
  Filter
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ComponentType, SVGProps } from 'react';
import { useNavigate } from "react-router-dom";

// Types
type AdminStats = {
  totalUsers: number;
  totalClients: number;
  totalJobs: number;
  monthlyRevenue: number;
};

type RevenuePoint = { monthNumber: number; label: string; revenue: number };

type JobStatusPoint = { status: string; count: number };

type ReportItem = { id: string; name: string; description: string };

type ReportCategory = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
  reports: ReportItem[];
};

// Constants
const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const ENGLISH_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ENG_MONTH_TO_NUMBER: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
};

const AdminReports = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [revenueChart, setRevenueChart] = useState<RevenuePoint[]>([]);
  const [jobStatusChart, setJobStatusChart] = useState<JobStatusPoint[]>([]);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'SAR' }), [language]);
  const formatSAR = (value: number) => currencyFormatter.format(Number(value || 0));

  // Refs to sections for View scrolling
  const firstHalfRef = useRef<HTMLDivElement | null>(null);
  const secondHalfRef = useRef<HTMLDivElement | null>(null);
  const jobStatusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, revenueRes, jobRes] = await Promise.all([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/dashboard/revenue-chart?months=12"),
          api.get("/admin/dashboard/job-status-chart"),
        ]);
        setStats(statsRes.data);

        // Build full-year (Jan-Dec) series for the current year with localized month labels
        const currentYear = new Date().getFullYear();
        const incoming: Array<{ month?: string; revenue?: number }> = revenueRes.data ?? [];

        const monthRevenueForCurrentYear = new Map<number, number>();
        for (const item of incoming) {
          const label = String(item?.month ?? ''); // e.g., "Oct 2025"
          const [abbr, yearStr] = label.split(' ');
          const monthNum = ENG_MONTH_TO_NUMBER[abbr as keyof typeof ENG_MONTH_TO_NUMBER];
          const yearNum = Number(yearStr);
          if (monthNum && yearNum === currentYear) {
            monthRevenueForCurrentYear.set(monthNum, Number(item?.revenue ?? 0));
          }
        }

        const monthsByLang = language === 'ar' ? ARABIC_MONTHS : ENGLISH_MONTHS;
        const normalizedRevenue: RevenuePoint[] = Array.from({ length: 12 }, (_, i) => {
          const monthNum = i + 1;
          const revenue = monthRevenueForCurrentYear.get(monthNum) ?? 0;
          return {
            monthNumber: monthNum,
            label: monthsByLang[i],
            revenue,
          };
        });

        setRevenueChart(normalizedRevenue);
        const jobRaw: Array<{ status: string; count: number }> = jobRes.data ?? [];
        setJobStatusChart(jobRaw.map((j) => ({ status: j.status, count: Number(j.count || 0) })));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [language]);

  const firstHalf = revenueChart.filter((m) => m.monthNumber >= 1 && m.monthNumber <= 6);
  const secondHalf = revenueChart.filter((m) => m.monthNumber >= 7 && m.monthNumber <= 12);

  const firstHalfTitle = language === 'ar' ? 'النصف الأول (يناير–يونيو)' : 'First Half (Jan–Jun)';
  const secondHalfTitle = language === 'ar' ? 'النصف الثاني (يوليو–ديسمبر)' : 'Second Half (Jul–Dec)';

  const quickStats = [
    {
      title: t('admin.reports.totalUsers'),
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: t('admin.reports.totalClients'),
      value: stats?.totalClients ?? 0,
      icon: Briefcase,
      color: "text-green-500"
    },
    {
      title: t('admin.reports.totalJobs'),
      value: stats?.totalJobs ?? 0,
      icon: Target,
      color: "text-purple-500"
    },
    {
      title: t('admin.reports.monthlyRevenue'),
      value: `$${stats?.monthlyRevenue ?? 0}`,
      icon: DollarSign,
      color: "text-yellow-500"
    }
  ];

  const reportCategories: ReportCategory[] = [
    {
      title: t('admin.reports.salesReports'),
      description: t('admin.reports.salesReportsDesc'),
      icon: DollarSign,
      color: "bg-accent",
      reports: [
        {
          id: 'revenue',
          name: t('admin.reports.revenueReport'),
          description: t('admin.reports.revenueReportDesc')
        },
        {
          id: 'contracts',
          name: t('admin.reports.contractsReport'),
          description: t('admin.reports.contractsReportDesc')
        }
      ]
    },
    {
      title: t('admin.reports.recruitmentReports'),
      description: t('admin.reports.recruitmentReportsDesc'),
      icon: Briefcase,
      color: "bg-secondary",
      reports: [
        {
          id: 'jobs',
          name: t('admin.reports.jobsReport'),
          description: t('admin.reports.jobsReportDesc')
        },
        {
          id: 'applicants',
          name: t('admin.reports.applicantsReport'),
          description: t('admin.reports.applicantsReportDesc')
        }
      ]
    },
    {
      title: t('admin.reports.clientReports'),
      description: t('admin.reports.clientReportsDesc'),
      icon: Users,
      color: "bg-primary",
      reports: [
        {
          id: 'clientStatus',
          name: t('admin.reports.clientStatusReport'),
          description: t('admin.reports.clientStatusReportDesc')
        },
        {
          id: 'clientActivity',
          name: t('admin.reports.clientActivityReport'),
          description: t('admin.reports.clientActivityReportDesc')
        }
      ]
    },
    {
      title: t('admin.reports.generalPerformance'),
      description: t('admin.reports.generalPerformanceDesc'),
      icon: Target,
      color: "bg-info",
      reports: [
        {
          id: 'overall',
          name: t('admin.reports.overallPerformance'),
          description: t('admin.reports.overallPerformanceDesc')
        },
        {
          id: 'targets',
          name: t('admin.reports.targetProgress'),
          description: t('admin.reports.targetProgressDesc')
        }
      ]
    }
  ];

  // Helpers for actions
  const downloadCSV = (filename: string, headers: string[], rows: Array<(string | number)[]>) => {
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (reportId: string) => {
    switch (reportId) {
      case 'revenue': {
        const rows = revenueChart.map(p => [p.label, p.revenue]);
        downloadCSV('revenue-current-year.csv', [language === 'ar' ? 'الشهر' : 'Month', language === 'ar' ? 'الإيراد (SAR)' : 'Revenue (SAR)'], rows);
        break;
      }
      case 'jobs': {
        const rows = jobStatusChart.map(p => [p.status, p.count]);
        downloadCSV('job-status.csv', [language === 'ar' ? 'الحالة' : 'Status', language === 'ar' ? 'العدد' : 'Count'], rows);
        break;
      }
      default: {
        // Fallback empty file to indicate not implemented yet
        downloadCSV(`${reportId}.csv`, ['Field', 'Value'], []);
      }
    }
  };

  const handleView = (reportId: string) => {
    switch (reportId) {
      case 'revenue': {
        navigate('/admin/reports/revenue');
        break;
      }
      case 'contracts': {
        navigate('/admin/reports/contracts');
        break;
      }
      case 'jobs': {
        navigate('/admin/reports/jobs');
        break;
      }
      case 'applicants': {
        navigate('/admin/reports/applicants');
        break;
      }
      case 'clientStatus': {
        navigate('/admin/reports/client-status');
        break;
      }
      case 'clientActivity': {
        navigate('/admin/reports/client-activity');
        break;
      }
      case 'overall': {
        navigate('/admin/reports/overall');
        break;
      }
      case 'targets': {
        navigate('/admin/reports/targets');
        break;
      }
      default: {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <MainLayout userRole="admin" >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">{t('admin.reports.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t('admin.reports.subtitle')}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {t('admin.reports.filter')}
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              {t('admin.reports.exportAll')}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">{t('common.loading')}...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index} className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{String(stat.value)}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 ${stat.color} shrink-0`} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Time Series Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg break-words">{firstHalfTitle}</CardTitle>
            </CardHeader>
            <CardContent ref={firstHalfRef} className="h-48 sm:h-64 lg:h-72 p-3 sm:p-6">
              {firstHalf.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={firstHalf} margin={{ left: 4, right: 4, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" minTickGap={16} fontSize={10} />
                    <YAxis fontSize={10} tickFormatter={(v: number) => formatSAR(v)} />
                    <Tooltip formatter={(value: unknown) => [formatSAR(Number(value ?? 0)), firstHalfTitle]} labelFormatter={(label: unknown) => String(label)} />
                    <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {t('common.noData')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg break-words">{secondHalfTitle}</CardTitle>
            </CardHeader>
            <CardContent ref={secondHalfRef} className="h-48 sm:h-64 lg:h-72 p-3 sm:p-6">
              {secondHalf.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={secondHalf} margin={{ left: 4, right: 4, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" minTickGap={16} fontSize={10} />
                    <YAxis fontSize={10} tickFormatter={(v: number) => formatSAR(v)} />
                    <Tooltip formatter={(value: unknown) => [formatSAR(Number(value ?? 0)), secondHalfTitle]} labelFormatter={(label: unknown) => String(label)} />
                    <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {t('common.noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Job Status Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg break-words">{t('admin.reports.jobStatusDistribution')}</CardTitle>
            </CardHeader>
            <CardContent ref={jobStatusRef} className="h-48 sm:h-64 lg:h-72 p-3 sm:p-6">
              {jobStatusChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobStatusChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {jobStatusChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {t('common.noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {reportCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className={`${category.color} p-1.5 sm:p-2 rounded-lg text-white shrink-0`}>
                    <category.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold break-words">{category.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-normal">{category.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {category.reports.map((report) => (
                    <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors gap-2 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm break-words">{report.name}</h4>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                      </div>
                      <div className="flex gap-1 sm:gap-2 shrink-0">
                        <Button onClick={() => handleDownload(report.id)} size="sm" variant="outline" className="h-7 sm:h-8 px-1 sm:px-2 text-xs">
                          <Download className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                          <span className="hidden sm:inline">{t('common.download')}</span>
                          <span className="sm:hidden">DL</span>
                        </Button>
                        <Button onClick={() => handleView(report.id)} size="sm" variant="ghost" className="h-7 sm:h-8 px-1 sm:px-2 text-xs">
                          <span className="hidden sm:inline">{t('common.view')}</span>
                          <span className="sm:hidden">{t('common.view')}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </MainLayout>
  );
};

export default AdminReports;