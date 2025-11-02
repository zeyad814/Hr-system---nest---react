import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Building, 
  Clock, 
  Mail, 
  Phone, 
  FileText,
  Download,
  Eye,
  User,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { hrApiService } from '../../services/hrApi';
import { ActiveJobsApiService, ActiveJob } from '../../services/activeJobsApi';

interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  applicant: {
    id: string;
    userId: string;
    resumeUrl?: string;
    skills?: string;
    experience?: string;
    education?: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    experiences?: Array<{
      id: string;
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      description?: string;
    }>;
  };
}

interface JobDetailsData {
  id: string;
  title: string;
  company: string;
  location: string;
  locationLink?: string;
  jobType: string;
  department: string;
  experienceLevel: string;
  remoteWorkAvailable: boolean;
  description: string;
  requirements: string;
  requiredSkills: string;
  salaryRange: string;
  applicationDeadline: string;
  clientId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  benefits?: string;
  workingHours?: string;
  client: {
    id: string;
    userId: string;
    name: string;
    companyName: string;
    companySize: string;
    industry: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    location: string;
    description: string;
    logo: string;
    establishedYear: number;
    employees: string;
    revenue: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  _count?: {
    applications: number;
  };
  applications?: JobApplication[];
}

const AdminJobDetails: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch job details from API - this already includes applications data
      const jobData = await hrApiService.getJobById(jobId!);
      
      setJob(jobData);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'فشل في تحميل تفاصيل الوظيفة');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'INTERVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'OFFER':
        return 'bg-indigo-100 text-indigo-800';
      case 'HIRED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType.toLowerCase()) {
      case 'full_time':
        return 'bg-blue-100 text-blue-800';
      case 'part_time':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'internship':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'قيد المراجعة';
      case 'REVIEWED': return 'تمت المراجعة';
      case 'INTERVIEW': return 'مرشح للمقابلة';
      case 'OFFER': return 'عرض عمل';
      case 'HIRED': return 'تم التوظيف';
      case 'REJECTED': return 'مرفوض';
      default: return status;
    }
  };

  const handleDownloadResume = async (resumeUrl: string, applicantName: string) => {
    try {
      const response = await hrApiService.downloadResume(resumeUrl);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${applicantName}-resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  const handleGoBack = () => {
    navigate('/admin/jobs');
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      await hrApiService.updateApplicationStatus(applicationId, status);
      // Refresh job details to get updated applications
      fetchJobDetails();
    } catch (error: unknown) {
      console.error('Error updating application status:', error);
    }
  };

  const extractSkills = (j: unknown): string[] => {
    const obj = j as Record<string, unknown> | null | undefined;
    let skillsStr = obj && (obj['requiredSkills'] || obj['skills'] || (obj && (obj as Record<string, unknown>)['required_skills']));
    // Fallback: try to infer from requirements field
    if (!skillsStr && obj && obj['requirements']) {
      skillsStr = obj['requirements'];
    }
    if (!skillsStr) return [];
    const raw = String(skillsStr);
    // Split by Arabic comma، English comma, semicolon, or newline
    const parts = raw
      .split(/[,،;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    // De-duplicate case-insensitively
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of parts) {
      const key = p.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
      }
    }
    return result;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          onClick={() => navigate('/admin')} 
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للوحة التحكم
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'لم يتم العثور على الوظيفة'}</AlertDescription>
        </Alert>
        <Button 
          onClick={fetchJobDetails} 
          className="mt-4"
          variant="outline"
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => navigate('/admin')} 
          variant="outline" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للوحة التحكم
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{job._count?.applications || job.applications?.length || 0} متقدم</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(job.status)}>
              {job.status === 'active' ? 'نشط' : job.status}
            </Badge>
            <Badge className={getJobTypeColor(job.jobType)}>
              {job.jobType === 'full_time' ? 'دوام كامل' : 
               job.jobType === 'part_time' ? 'دوام جزئي' : 
               job.jobType === 'contract' ? 'عقد' : 
               job.jobType === 'internship' ? 'تدريب' : job.jobType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">تفاصيل الوظيفة</TabsTrigger>
          <TabsTrigger value="applications">المتقدمين ({job.applications?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>وصف الوظيفة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{job.description}</p>
                </CardContent>
              </Card>

              {job.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle>المتطلبات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-gray-700">{job.requirements}</div>
                  </CardContent>
                </Card>
              )}

              {/* Skills as badges (from any available field) */}
              {(() => {
                const skills = extractSkills(job);
                if (!skills.length) return null;
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle>المهارات المطلوبة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill: string, idx: number) => (
                          <Badge key={`${skill}-${idx}`} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {job.benefits && (
                <Card>
                  <CardHeader>
                    <CardTitle>المزايا</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-gray-700">{job.benefits}</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Job Info Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الوظيفة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">الراتب</div>
                      <div className="text-sm text-gray-600">{job.salaryRange}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="font-medium">آخر موعد للتقديم</div>
                      <div className="text-sm text-gray-600">{formatDate(job.applicationDeadline)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="font-medium">تاريخ النشر</div>
                      <div className="text-sm text-gray-600">{formatDate(job.createdAt)}</div>
                    </div>
                  </div>

                  {job.department && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">القسم</div>
                        <div className="text-sm text-gray-600">{job.department}</div>
                      </div>
                    </div>
                  )}

                  {job.workingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      <div>
                        <div className="font-medium">ساعات العمل</div>
                        <div className="text-sm text-gray-600">{job.workingHours}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Keep sidebar skills section too (using same detection) */}
              {(() => {
                const skills = extractSkills(job);
                if (!skills.length) return null;
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle>المهارات المطلوبة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill: string, idx: number) => (
                          <Badge key={`${skill}-${idx}`} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <div className="space-y-4">
            {!job.applications || job.applications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">لا توجد طلبات تقديم حتى الآن</p>
                </CardContent>
              </Card>
            ) : (
              job.applications?.map((application) => {
                // Add null checks to prevent errors
                const applicant = application.applicant;
                const user = applicant?.user;
                
                if (!applicant || !user) {
                  console.warn('Missing applicant or user data for application:', application.id);
                  return null;
                }
                
                return (
                  <Card key={application.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{user.name || 'غير محدد'}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                <span>{user.email || 'غير محدد'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(application.status)}>
                          {getApplicationStatusText(application.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(application.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {applicant.experience && (
                        <div>
                          <div className="font-medium text-sm mb-1">الخبرة</div>
                          <div className="text-sm text-gray-600">{applicant.experience}</div>
                        </div>
                      )}
                      {applicant.education && (
                        <div>
                          <div className="font-medium text-sm mb-1">التعليم</div>
                          <div className="text-sm text-gray-600">{applicant.education}</div>
                        </div>
                      )}
                      {applicant.skills && (
                        <div className="md:col-span-2">
                          <div className="font-medium text-sm mb-1">المهارات</div>
                          <div className="flex flex-wrap gap-1">
                            {applicant.skills.split(',').map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>



                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex gap-2">
                        {applicant.resumeUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadResume(applicant.resumeUrl!, user.name)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            تحميل السيرة الذاتية
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/admin/applicants/${applicant.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          عرض الملف الشخصي
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateApplicationStatus(application.id, 'REJECTED')}
                        >
                          رفض
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateApplicationStatus(application.id, 'INTERVIEW')}
                        >
                          قبول
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminJobDetails;