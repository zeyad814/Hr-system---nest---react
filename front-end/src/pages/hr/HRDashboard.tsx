import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Calendar, Target, TrendingUp, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { hrApiService, type Job, type Interview, type HRStats } from "@/services/hrApi";
import { useLanguage } from "@/contexts/LanguageContext";

const HRDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<HRStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch HR statistics
        const hrStats = await hrApiService.getHRStats();
        setStats(hrStats);
        
        // Fetch recent jobs (limit to 3)
        const jobs = await hrApiService.getJobs();
        setRecentJobs(jobs.data.slice(0, 3));
        
        // Fetch upcoming interviews (limit to 3)
        const interviews = await hrApiService.getUpcomingInterviews(168); // Next 7 days
        setUpcomingInterviews(interviews.slice(0, 3));
        
      } catch (error) {
        console.error('Error fetching HR dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hrStats = stats ? [
    {
      title: t('hr.dashboard.activeJobs'),
      value: stats.activeJobs.toString(),
      change: `${stats.totalJobs} ${t('hr.dashboard.totalJobs')}`,
      changeType: "positive" as const,
      icon: Briefcase,
      gradient: true,
    },
    {
      title: t('hr.dashboard.newApplications'),
      value: stats.newApplications.toString(),
      change: `${stats.totalApplications} ${t('hr.dashboard.totalApplications')}`,
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: t('hr.dashboard.scheduledInterviews'),
      value: stats.scheduledInterviews.toString(),
      change: `${stats.completedInterviews} ${t('hr.dashboard.completedInterviews')}`,
      changeType: "neutral" as const,
      icon: Calendar,
    },
    {
      title: t('hr.dashboard.hiredCandidates'),
      value: stats.hiredCandidates.toString(),
      change: `${stats.rejectedApplications} ${t('hr.dashboard.rejectedApplications')}`,
      changeType: "positive" as const,
      icon: Target,
      gradient: true,
    },
  ] : [];

  return (
    <MainLayout userRole="hr">
      <div className="space-y-6" dir="rtl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {t('hr.dashboard.title')}
        </h1>
          <p className="text-muted-foreground">
            {t('hr.dashboard.subtitle')}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="dashboard-grid">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 bg-muted animate-pulse rounded-lg"></div>
            ))
          ) : (
            hrStats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))
          )}
        </div>

        {/* Recent Jobs and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card className="crm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {t('hr.dashboard.recentJobs')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  // Loading skeleton for jobs
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 border border-border rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))
                ) : recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <div key={job.id} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.client?.name || 'غير محدد'}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            job.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                            job.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {job.status === 'OPEN' ? 'مفتوحة' :
                             job.status === 'CLOSED' ? 'مغلقة' : 'تم التوظيف'}
                          </span>
                        </div>

                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    {t('hr.dashboard.noJobs')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="crm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t('hr.dashboard.upcomingInterviews')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  // Loading skeleton for interviews
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 border border-border rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))
                ) : upcomingInterviews.length > 0 ? (
                  upcomingInterviews.map((interview) => {
                    const interviewDate = new Date(interview.scheduledAt);
                    const now = new Date();
                    const isToday = interviewDate.toDateString() === now.toDateString();
                    const isTomorrow = interviewDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
                    
                    let dateLabel = interviewDate.toLocaleDateString('ar-SA');
                    if (isToday) dateLabel = t('hr.dashboard.today');
                    else if (isTomorrow) dateLabel = t('hr.dashboard.tomorrow');
                    
                    return (
                      <div key={interview.id} className="p-3 border border-border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{interview.candidate.user.name}</h4>
                            <p className="text-sm text-muted-foreground">{interview.application.job.title}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              interview.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                              interview.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {interview.status === 'SCHEDULED' ? t('hr.dashboard.statusScheduled') :
                               interview.status === 'CONFIRMED' ? t('hr.dashboard.statusConfirmed') : 
                               t('hr.dashboard.undefined')}
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="text-xs text-primary font-medium">{dateLabel}</span>
                            <p className="text-xs text-muted-foreground">
                              {interviewDate.toLocaleTimeString('ar-SA', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    {t('hr.dashboard.noInterviews')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default HRDashboard;