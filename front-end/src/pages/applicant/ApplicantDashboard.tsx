import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Briefcase, 
  FileText, 
  Clock, 
  Eye, 
  Building2, 
  MapPin, 
  DollarSign,
  Search,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send
} from "lucide-react";
import { applicantApiService, type Job, type JobApplication } from "@/services/applicantApi";

const ApplicantDashboard = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'available' | 'applications'>('available');

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await applicantApiService.getAvailableJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await applicantApiService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToJob = async (jobId: string) => {
    try {
      await applicantApiService.applyToJob({ jobId });
      toast({
        title: "تم التقديم بنجاح",
        description: "تم إرسال طلبك بنجاح. سيتم مراجعته قريباً.",
      });
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "خطأ في التقديم",
        description: error.response?.data?.message || "حدث خطأ أثناء التقديم للوظيفة",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "قيد المراجعة", variant: "secondary" as const, icon: Clock },
      INTERVIEW: { label: "مقابلة مجدولة", variant: "default" as const, icon: Calendar },
      OFFER: { label: "تم العرض", variant: "default" as const, icon: CheckCircle },
      HIRED: { label: "تم التوظيف", variant: "default" as const, icon: CheckCircle },
      REJECTED: { label: "مرفوض", variant: "destructive" as const, icon: XCircle },
      WITHDRAWN: { label: "منسحب", variant: "secondary" as const, icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const notApplied = !applications.some(app => app.job.id === job.id);
    
    return matchesSearch && notApplied;
  });

  const applicantStats = [
    {
      title: t('applicant.dashboard.applicationsSent'),
      value: applications.length.toString(),
      change: `${applications.filter(app => app.status === 'PENDING').length} ${t('applicant.dashboard.underReview')}`,
      changeType: "positive" as const,
      icon: FileText,
      gradient: true,
    },
    {
      title: t('applicant.dashboard.scheduledInterviews'),
      value: applications.filter(app => app.status === 'INTERVIEW').length.toString(),
      change: t('applicant.dashboard.upcomingInterviews'),
      changeType: "neutral" as const,
      icon: Clock,
    },
  ];

  if (loading) {
    return (
      <MainLayout userRole="applicant" userName="المرشح">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="applicant" userName="المرشح">
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('applicant.dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('applicant.dashboard.subtitle')}</p>
        </div>

        <div className="dashboard-grid">
          {applicantStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'available' ? 'default' : 'outline'}
            onClick={() => setActiveTab('available')}
          >
            {t('applicant.dashboard.availableJobs', )} ({filteredJobs.length })
          </Button>
          <Button
            variant={activeTab === 'applications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('applications')}
          >
            {t('applicant.dashboard.myApplications',)}  ({ applications.length })
          </Button>
        </div>

        {activeTab === 'available' && (
          <>
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  {t('applicant.dashboard.searchAndFilter')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('applicant.dashboard.searchForJob')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Available Jobs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Users className="h-4 w-4" />
                          {job.client.name}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{job.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(job.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handleApplyToJob(job.id)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {t('applicant.dashboard.applyForJob')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('applicant.dashboard.noJobsAvailable')}</h3>
                  <p className="text-muted-foreground">{t('applicant.dashboard.tryChangingCriteria')}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{application.job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4" />
                        {application.job.client.name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('applicant.dashboard.jobDescription')}:</p>
                      <p className="text-sm line-clamp-3">{application.job.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {t('applicant.dashboard.applicationDate')}: {new Date(application.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {applications.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('applicant.dashboard.noApplicationsYet')}</h3>
                  <p className="text-muted-foreground mb-4">{t('applicant.dashboard.startSearching')}</p>
                  <Button onClick={() => setActiveTab('available')}>
                    {t('applicant.dashboard.browseAvailableJobs')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ApplicantDashboard;