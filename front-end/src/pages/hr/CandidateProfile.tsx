import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import hrApiService, { Applicant, JobApplication, Interview } from '../../services/hrApi';
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Download,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  Building,
  FileText,
  MessageSquare,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

const CandidateProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchCandidateProfile(id);
    }
  }, [id]);

  const fetchCandidateProfile = async (candidateId: string) => {
    try {
      setLoading(true);
      const profile = await hrApiService.getApplicantProfile(id);
      setCandidate(profile);
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل بيانات المرشح",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED': return 'bg-blue-100 text-blue-800';
      case 'INTERVIEW': return 'bg-purple-100 text-purple-800';
      case 'OFFER': return 'bg-green-100 text-green-800';
      case 'HIRED': return 'bg-emerald-100 text-emerald-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'REVIEWED': return <Eye className="w-4 h-4" />;
      case 'INTERVIEW': return <Video className="w-4 h-4" />;
      case 'OFFER': return <CheckCircle className="w-4 h-4" />;
      case 'HIRED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const downloadResume = () => {
    if (candidate?.resumeUrl) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = candidate.resumeUrl;
      link.download = `${candidate.user.name}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const viewResume = () => {
    if (candidate?.resumeUrl) {
      // Open in a new tab for viewing
      window.open(candidate.resumeUrl, '_blank');
    }
  };

  // Function to get proper PDF viewer URL
  const getPdfViewerUrl = (resumeUrl: string) => {
    // If it's already a full URL, return as is
    if (resumeUrl.startsWith('http')) {
      return resumeUrl;
    }
    // If it's a relative path, construct the full URL
    const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    // Remove '/api' from base URL for file serving
    const fileBaseUrl = baseUrl.replace('/api', '');
    return `${fileBaseUrl}/${resumeUrl.startsWith('/') ? resumeUrl.slice(1) : resumeUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات المرشح...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">المرشح غير موجود</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على بيانات هذا المرشح</p>
          <Button onClick={() => navigate('/hr/candidates')}>
            <ArrowRight className="w-4 h-4 mr-2" />
            العودة إلى قائمة المرشحين
          </Button>
        </div>
      </div>
    );
  }

  const skills = candidate.skills ? candidate.skills.split(',').map(skill => skill.trim()) : [];

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Button
            variant="outline"
            onClick={() => navigate('/hr/candidates')}
            className="flex items-center"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            العودة إلى قائمة المرشحين
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 md:space-x-reverse">
            <Avatar className="w-24 h-24">
              <AvatarImage src={candidate.avatar} alt={candidate.user.name} />
              <AvatarFallback className="text-2xl">
                {candidate.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-4 space-x-reverse">
                <h1 className="text-3xl font-bold">{candidate.user.name}</h1>

              </div>
              
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Mail className="w-4 h-4" />
                  <span>{candidate.user.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="w-4 h-4" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-4 h-4" />
                  <span>انضم في {new Date(candidate.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {candidate.resumeUrl && (
                <>
                  <Button onClick={viewResume} className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    عرض السيرة الذاتية
                  </Button>
                  <Button variant="outline" onClick={downloadResume} className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    تحميل السيرة الذاتية
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="experience">الخبرات</TabsTrigger>
          <TabsTrigger value="applications">الطلبات</TabsTrigger>
          <TabsTrigger value="interviews">المقابلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  المهارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">لم يتم تحديد المهارات</p>
                )}
              </CardContent>
            </Card>

            {/* Experience Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  ملخص الخبرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {candidate.experience || 'لم يتم تحديد الخبرة'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Education Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                التعليم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {candidate.education || 'لم يتم تحديد التعليم'}
              </p>
            </CardContent>
          </Card>

          {/* CV Viewer */}
          {candidate.resumeUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  السيرة الذاتية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={viewResume} className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      عرض في نافذة جديدة
                    </Button>
                    <Button variant="outline" onClick={downloadResume} className="flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      تحميل السيرة الذاتية
                    </Button>
                  </div>
                  
                  {/* Embedded PDF Viewer */}
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      src={getPdfViewerUrl(candidate.resumeUrl)}
                      className="w-full h-96"
                      title="السيرة الذاتية"
                      style={{ minHeight: '600px' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                الخبرات العملية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {candidate.experience || 'لا توجد خبرات مسجلة'}
              </p>
            </CardContent>
          </Card>

          {/* Education Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                التعليم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {candidate.education || 'لا توجد بيانات تعليمية مسجلة'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                طلبات التوظيف
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.applications && candidate.applications.length > 0 ? (
                <div className="space-y-4">
                  {candidate.applications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{app.job.title}</h3>
                          <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                            <Building className="w-4 h-4" />
                            <span>{app.job.client?.name || 'غير محدد'}</span>
                            <MapPin className="w-4 h-4" />
                            <span>{app.job.location}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge className={getStatusColor(app.status)}>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              {getStatusIcon(app.status)}
                              <span>{app.status}</span>
                            </div>
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            تقدم في {new Date(app.appliedAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد طلبات توظيف</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="w-5 h-5 mr-2" />
                المقابلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.interviews && candidate.interviews.length > 0 ? (
                <div className="space-y-4">
                  {candidate.interviews.map((interview) => (
                    <div key={interview.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">مقابلة {interview.type}</h3>
                          <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(interview.scheduledAt).toLocaleString('ar-SA')}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </div>
                      {interview.notes && (
                        <div className="mt-3 p-3 bg-muted rounded">
                          <p className="text-sm">{interview.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد مقابلات مجدولة</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateProfile;