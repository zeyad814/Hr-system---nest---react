import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Star,
  Download,
  FileText,
  User,
  Building,
  Clock,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { hrApiService, type Applicant } from '../../services/hrApi';
import { MainLayout } from '../../components/layout/MainLayout';

const AdminApplicantProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchApplicantProfile();
    }
  }, [id]);

  const fetchApplicantProfile = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const profile = await hrApiService.getApplicantProfile(id);
      setApplicant(profile);
    } catch (error) {
      console.error('Error fetching applicant profile:', error);
      setError('فشل في تحميل بيانات المتقدم');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDownloadResume = async (resumeUrl: string, applicantName: string) => {
    try {
      const response = await hrApiService.downloadResume(resumeUrl);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${applicantName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
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
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'نشط';
      case 'PENDING':
        return 'قيد المراجعة';
      case 'REVIEWED':
        return 'تمت المراجعة';
      case 'INTERVIEW':
        return 'مقابلة';
      case 'OFFER':
        return 'عرض عمل';
      case 'HIRED':
        return 'تم التوظيف';
      case 'REJECTED':
        return 'مرفوض';
      case 'INACTIVE':
        return 'غير نشط';
      default:
        return status || 'غير محدد';
    }
  };

  if (loading) {
    return (
      <MainLayout userRole="admin" userName={user?.name || 'المدير'}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !applicant) {
    return (
      <MainLayout userRole="admin" userName={user?.name || 'المدير'}>
        <div className="space-y-6">
          <Button variant="ghost" onClick={handleGoBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <Alert>
            <AlertDescription>
              {error || 'لم يتم العثور على بيانات المتقدم'}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="admin" userName={user?.name || 'المدير'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={applicant.avatar} alt={applicant.user?.name} />
                <AvatarFallback className="text-2xl">
                  {applicant.user?.name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {applicant.user?.name || 'غير محدد'}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    متقدم للوظائف
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {applicant.user?.email || 'غير محدد'}
                  </div>
                  {applicant.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {applicant.phone}
                    </div>
                  )}
                  {applicant.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {applicant.location}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">

                </div>
              </div>
              
              <div className="flex gap-2">
                {applicant.resumeUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadResume(applicant.resumeUrl!, applicant.user?.name || 'المتقدم')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    تحميل السيرة الذاتية
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            {applicant.experience && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    الخبرات العملية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-700">{applicant.experience}</div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {applicant.education && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    التعليم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-700">{applicant.education}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicant.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">رقم الهاتف</span>
                    <span className="font-medium">{applicant.phone}</span>
                  </div>
                )}
                {applicant.address && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">العنوان</span>
                    <span className="font-medium">{applicant.address}</span>
                  </div>
                )}
                {applicant.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">الموقع</span>
                    <span className="font-medium">{applicant.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">تاريخ التسجيل</span>
                  <span className="font-medium">
                    {new Date(applicant.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {applicant.skills && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    المهارات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-700">{applicant.skills}</div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {applicant.portfolio && (
              <Card>
                <CardHeader>
                  <CardTitle>الأعمال السابقة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-700">{applicant.portfolio}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminApplicantProfile;