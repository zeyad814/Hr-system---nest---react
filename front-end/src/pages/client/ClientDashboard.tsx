import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, FileText, Clock, Plus, Eye, Star } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { clientApiService } from "@/services/clientApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import RecentActivities from "@/components/client/RecentActivities";
import { useLanguage } from "@/contexts/LanguageContext";

const ClientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    rawStats?: any;
    stats: any[];
    activeJobs: any[];
    topCandidates: any[];
  } | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  // Load dashboard data
  useEffect(() => {
    // Add valid auth token if not present
    if (!localStorage.getItem('access_token')) {
      localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWY0NGRwb2kwMDAzY3dyY2hmYnQzeWZlIiwiZW1haWwiOiJjbGllbnRAdGVzdC5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiaWF0IjoxNzU3NTkyMjI1LCJleHAiOjE3NTc1OTU4MjV9.MbkltqyK_tv0HyFyVx1t1LdL59JcdkJdKWpfPbNhNXo');
    }
    loadDashboardData();
    loadRecentActivities();
  }, []);

  // Calculate percentage changes based on real data
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  // Format stats for display with current language
  const formatStatsForDisplay = useCallback(() => {
    if (!dashboardData?.rawStats) return;
    
    const stats = dashboardData.rawStats;
    const formattedStats = [
      {
        title: t('client.dashboard.totalJobs'),
        value: stats.totalJobs || 0,
        change: calculatePercentageChange(stats.totalJobs || 0, stats.previousTotalJobs || 0),
        changeType: (stats.totalJobs || 0) >= (stats.previousTotalJobs || 0) ? "positive" : "negative",
        icon: "briefcase"
      },
      {
        title: t('client.dashboard.activeJobs'),
        value: stats.activeJobs || 0,
        change: calculatePercentageChange(stats.activeJobs || 0, stats.previousActiveJobs || 0),
        changeType: (stats.activeJobs || 0) >= (stats.previousActiveJobs || 0) ? "positive" : "negative",
        icon: "users"
      },
      {
        title: t('client.dashboard.totalApplicants'),
        value: stats.totalApplicants || 0,
        change: calculatePercentageChange(stats.totalApplicants || 0, stats.previousTotalApplicants || 0),
        changeType: (stats.totalApplicants || 0) >= (stats.previousTotalApplicants || 0) ? "positive" : "negative",
        icon: "fileText"
      },
      {
        title: t('client.dashboard.hiredCandidates'),
        value: stats.hiredCandidates || 0,
        change: calculatePercentageChange(stats.hiredCandidates || 0, stats.previousHiredCandidates || 0),
        changeType: (stats.hiredCandidates || 0) >= (stats.previousHiredCandidates || 0) ? "positive" : "negative",
        icon: "clock"
      }
    ];
    
    setDashboardData(prev => ({
      ...prev,
      stats: formattedStats
    }));
  }, [dashboardData?.rawStats, t]);

  // Update dashboard data when language changes
  useEffect(() => {
    if (dashboardData && dashboardData.rawStats) {
      formatStatsForDisplay();
    }
  }, [dashboardData?.rawStats, formatStatsForDisplay]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, activeJobs, topCandidates] = await Promise.all([
        clientApiService.getDashboardStats(),
        clientApiService.getActiveJobs(),
        clientApiService.getCandidates()
      ]);
      
      console.log('Active Jobs Data:', activeJobs);
      
      setDashboardData({
        rawStats: stats,
        stats: [], // Will be formatted by formatStatsForDisplay
        activeJobs: Array.isArray(activeJobs) ? activeJobs.filter(job => job && job.status === 'OPEN').slice(0, 5) : [],
        topCandidates: Array.isArray(topCandidates) ? topCandidates.slice(0, 5) : []
      });
      
      // Format stats after setting raw data
      setTimeout(() => formatStatsForDisplay(), 0);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      
      // Check if it's a 403 authentication error
      if (error?.response?.status === 403 || error?.status === 403) {
        toast({
          title: t('errors.authError'),
          description: t('client.dashboard.authErrorDesc'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('errors.error'),
          description: t('client.dashboard.loadError'),
          variant: "destructive",
        });
      }
      // Set empty data on error with proper stat structure
      const defaultStats = [
        { title: t('client.dashboard.totalJobs'), value: 0, change: "0%", changeType: "neutral", icon: "briefcase" },
        { title: t('client.dashboard.activeJobs'), value: 0, change: "0%", changeType: "neutral", icon: "users" },
        { title: t('client.dashboard.totalApplicants'), value: 0, change: "0%", changeType: "neutral", icon: "fileText" },
        { title: t('client.dashboard.hiredCandidates'), value: 0, change: "0%", changeType: "neutral", icon: "clock" }
      ];
      setDashboardData({ stats: defaultStats, activeJobs: [], topCandidates: [] });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await clientApiService.getRecentActivities();
      setRecentActivities(activities);
    } catch (error: any) {
      console.error('Error loading recent activities:', error);
      
      // Check if it's a 403 authentication error
      if (error?.response?.status === 403 || error?.status === 403) {
        toast({
          title: t('errors.authError'),
          description: t('client.dashboard.recentActivitiesAuthError'),
          variant: "destructive",
        });
      }
      setRecentActivities([]);
    }
  };

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'briefcase':
        return Briefcase;
      case 'users':
        return Users;
      case 'user':
        return Users;
      case 'star':
        return Star;
      case 'filetext':
        return FileText;
      case 'clock':
        return Clock;
      default:
        return Briefcase;
    }
  };

  const clientStats = dashboardData?.stats?.map(stat => {
    // Ensure stat is a valid stat object, not a job or other object
    if (!stat || typeof stat !== 'object' || !stat.title || stat.value === undefined) {
      return null;
    }
    
    // Ensure value is always a primitive (string or number)
    let processedValue;
    if (typeof stat.value === 'object' && stat.value !== null) {
      // If value is an object, try to extract a meaningful value
      if (Array.isArray(stat.value)) {
        processedValue = stat.value.length;
      } else if (stat.value.count !== undefined) {
        processedValue = stat.value.count;
      } else if (stat.value.total !== undefined) {
        processedValue = stat.value.total;
      } else {
        processedValue = '0';
      }
    } else {
      processedValue = stat.value;
    }
    
    return {
      title: String(stat.title),
      value: String(processedValue),
      change: stat.change || "0%",
      icon: getIconComponent(stat.icon || 'briefcase'),
      description: stat.description
    };
  }).filter(Boolean) || [];
  const activeJobs = dashboardData?.activeJobs || [];
  const topCandidates = dashboardData?.topCandidates || [];



  const getStatusColor = (status: string) => {
    switch (status) {
      case t('common.active'):
        return "bg-secondary text-secondary-foreground";
      case t('common.completed'):
        return "bg-info text-info-foreground";
      case t('common.pending'):
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <MainLayout userRole="client" userName={t('client.dashboard.defaultUserName')}>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('client.dashboard.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('client.dashboard.subtitle')}
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate('/client/request-job')}>
            <Plus className="h-4 w-4" />
            {t('client.dashboard.requestNewJob')}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="dashboard-grid">
          {loading ? (
            // Loading skeleton for stats
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="crm-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            clientStats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))
          )}
        </div>

        {/* Active Jobs and Top Candidates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Jobs */}
          <Card className="crm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {t('client.dashboard.activeJobsSection')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  // Loading skeleton for jobs
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                          <div className="flex items-center gap-4 mt-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <div className="text-left space-y-2">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : activeJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('client.dashboard.noActiveJobs')}</p>
                  </div>
                ) : activeJobs.filter(job => job && job.id && job.title).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('client.dashboard.incompleteJobData')}</p>
                    <p className="text-xs mt-2">{t('client.dashboard.jobCount')}: {activeJobs.length}</p>
                  </div>
                ) : (
                  activeJobs.filter(job => job && job.id && job.title).map((job) => (
                    <div key={job.id} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{String(job.title || t('client.dashboard.undefinedJob'))}</h4>
                          <p className="text-sm text-muted-foreground">{String(job.department || job.location || t('common.undefined'))}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {Number(job._count?.applications || 0)} {t('client.dashboard.applicant')}
                            </span>
                            <span className="text-muted-foreground">
                              {job.createdAt ? new Date(job.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : t('common.undefined')}
                            </span>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge className={getStatusColor(job.status === 'OPEN' ? t('common.active') : String(job.status || t('common.undefined')))}>
                            {job.status === 'OPEN' ? t('common.active') : String(job.status || t('common.undefined'))}
                          </Badge>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" className="h-8">
                              <Eye className="h-3 w-3 ml-1" />
                              {t('common.view')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Candidates */}
          <Card className="crm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t('client.dashboard.topCandidates')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  // Loading skeleton for candidates
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                          <div className="flex items-center gap-4 mt-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </div>
                        <div className="text-left space-y-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  topCandidates.filter(application => application && (application.applicant || application.name)).map((application, index) => (
                    <div key={application.id || index} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{String(application.applicant?.name || application.name || t('client.dashboard.undefinedCandidate'))}</h4>
                          <p className="text-sm text-muted-foreground">{String(application.job?.title || application.jobTitle || t('client.dashboard.undefinedJob'))}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>{String(application.applicant?.experience || application.experience || t('common.undefined'))} {t('client.dashboard.experience')}</span>
                            <span className="text-muted-foreground">
                              {String(application.applicant?.email || application.email || t('common.undefined'))}
                            </span>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge className={getStatusColor(application.status === 'PENDING' ? t('common.pending') : String(application.status || t('common.undefined')))}>
                            {application.status === 'PENDING' ? t('common.pending') : String(application.status || t('common.undefined'))}
                          </Badge>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" className="h-8">
                              <Eye className="h-3 w-3 ml-1" />
                              {t('client.dashboard.viewProfile')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <RecentActivities activities={recentActivities} loading={loading} />
      </div>
    </MainLayout>
  );
};

export default ClientDashboard;