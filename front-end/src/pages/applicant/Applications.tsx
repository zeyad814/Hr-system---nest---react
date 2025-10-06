import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Building2, 
  Calendar,
  User
} from "lucide-react";
import { type JobApplication, applicantApiService } from "@/services/applicantApi";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Applications = () => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Load applications from API
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const userApplications = await applicantApiService.getMyApplications();
        setApplications(userApplications);
      } catch (error) {
        console.error('Error loading applications:', error);
        toast.error(t('applicant.applications.loadingError'));
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('applicant.applications.under_review');
      case 'ACCEPTED':
        return t('applicant.applications.hired');
      case 'REJECTED':
        return t('applicant.applications.rejected');
      case 'INTERVIEW_SCHEDULED':
        return t('applicant.applications.interview');
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'INTERVIEW_SCHEDULED':
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout userRole="applicant" userName="علي محمد">
      <div className="space-y-6" dir="rtl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('applicant.applications.title')}</h1>
          <p className="text-muted-foreground">{t('applicant.applications.subtitle')}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('common.loading')}...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('applicant.applications.noApplications')}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <Card key={application.id} className="crm-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{application.job?.title || t('applicant.applications.notSpecified')}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{application.job?.client?.name || t('applicant.applications.notSpecified')}</span>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(application.status)} px-3 py-1`}>
                      {getStatusIcon(application.status)}
                      <span className="mr-2">{getStatusText(application.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{t('applicant.applications.appliedOn', { date: new Date(application.createdAt).toLocaleDateString('ar-SA') })}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">آخر تحديث:</h4>
                        <p className="text-sm text-muted-foreground">{new Date(application.updatedAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">الحالة:</h4>
                        <p className="text-sm text-muted-foreground">{getStatusText(application.status)}</p>
                      </div>
                    </div>
                  </div>
                
                   <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                     <Button size="sm" variant="outline" className="flex items-center gap-2">
                       <Eye className="h-4 w-4" />
                       عرض التفاصيل
                     </Button>
                     {application.status === 'INTERVIEW' && (
                       <Button size="sm" className="flex items-center gap-2">
                         <Calendar className="h-4 w-4" />
                         تأكيد المقابلة
                       </Button>
                     )}
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
      </div>
    </MainLayout>
  );
};

export default Applications;
