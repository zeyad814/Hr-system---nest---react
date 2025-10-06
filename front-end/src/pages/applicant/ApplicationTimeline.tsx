import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Users,
  MapPin,
  DollarSign,
  FileText,
  MessageSquare
} from "lucide-react";
import { 
  applicantApiService, 
  JobApplication, 
  ApplicationTimeline as TimelineEntry, 
  Feedback 
} from "@/services/applicantApi";

const ApplicationTimeline = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails();
      fetchTimeline();
      fetchFeedback();
    }
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      const data = await applicantApiService.getApplicationById(applicationId!);
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب تفاصيل الطلب",
        variant: "destructive"
      });
    }
  };

  const fetchTimeline = async () => {
    try {
      const data = await applicantApiService.getApplicationTimeline(applicationId!);
      setTimeline(data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const data = await applicantApiService.getApplicationFeedback(applicationId!);
      setFeedback(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      PENDING: { 
        label: "قيد المراجعة", 
        variant: "secondary" as const, 
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        description: "تم استلام طلبك وهو قيد المراجعة من قبل فريق الموارد البشرية"
      },
      REVIEWED: { 
        label: "تمت المراجعة", 
        variant: "default" as const, 
        icon: Eye,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        description: "تمت مراجعة طلبك من قبل فريق الموارد البشرية"
      },
      SHORTLISTED: { 
        label: "مرشح", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        description: "تهانينا! تم ترشيحك للمرحلة التالية"
      },
      INTERVIEW: { 
        label: "مقابلة مجدولة", 
        variant: "default" as const, 
        icon: Calendar,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        description: "تم جدولة مقابلة معك. ستتلقى تفاصيل المقابلة قريباً"
      },
      INTERVIEWED: { 
        label: "تمت المقابلة", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        description: "تمت المقابلة بنجاح. ننتظر نتائج التقييم"
      },
      OFFER: { 
        label: "تم العرض", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        description: "تهانينا! تم قبولك للوظيفة وسيتم التواصل معك لإتمام الإجراءات"
      },
      HIRED: { 
        label: "تم التوظيف", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "text-green-700",
        bgColor: "bg-green-100",
        description: "مبروك! تم توظيفك رسمياً في الوظيفة"
      },
      REJECTED: { 
        label: "مرفوض", 
        variant: "destructive" as const, 
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        description: "نعتذر، لم يتم قبول طلبك هذه المرة. نشكرك على اهتمامك"
      },
      WITHDRAWN: { 
        label: "منسحب", 
        variant: "secondary" as const, 
        icon: AlertCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        description: "تم سحب الطلب"
      }
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  };

  const getFeedbackBadge = (decision?: string) => {
    const decisionConfig = {
      ACCEPT: { label: "موافق", variant: "default" as const },
      REJECT: { label: "رفض", variant: "destructive" as const },
      INTERVIEW: { label: "مقابلة", variant: "default" as const },
      PENDING: { label: "قيد المراجعة", variant: "secondary" as const }
    };

    const config = decisionConfig[decision as keyof typeof decisionConfig] || decisionConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <MainLayout userRole="applicant" userName="المرشح">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!application) {
    return (
      <MainLayout userRole="applicant" userName="المرشح">
        <div className="container mx-auto p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لم يتم العثور على الطلب المطلوب
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const currentStatusInfo = getStatusInfo(application.status);
  const StatusIcon = currentStatusInfo.icon;

  return (
    <MainLayout userRole="applicant" userName="المرشح">
      <div className="container mx-auto p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/applicant/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للوحة التحكم
          </Button>
          <div>
            <h1 className="text-3xl font-bold">متابعة الطلب</h1>
            <p className="text-muted-foreground">تتبع حالة طلبك وآخر التحديثات</p>
          </div>
        </div>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{application.job.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Users className="h-4 w-4" />
                  {application.job.client.name}
                </CardDescription>
              </div>
              <div className={`p-3 rounded-lg ${currentStatusInfo.bgColor}`}>
                <StatusIcon className={`h-6 w-6 ${currentStatusInfo.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">وصف الوظيفة</h4>
                <p className="text-sm text-muted-foreground">{application.job.description || 'لا يوجد وصف متاح'}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>تاريخ التقديم: {new Date(application.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${currentStatusInfo.color}`} />
              الحالة الحالية: {currentStatusInfo.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{currentStatusInfo.description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                سجل الأحداث
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.length > 0 ? (
                  timeline.map((entry, index) => {
                    const statusInfo = getStatusInfo(entry.status);
                    const EntryIcon = statusInfo.icon;
                    
                    return (
                      <div key={entry.id} className="flex gap-3">
                        <div className={`p-2 rounded-full ${statusInfo.bgColor} flex-shrink-0`}>
                          <EntryIcon className={`h-4 w-4 ${statusInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{statusInfo.label}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            بواسطة: {entry.createdByUser.name} ({entry.createdByUser.role})
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد أحداث في السجل بعد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                التقييمات والملاحظات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.length > 0 ? (
                  feedback.map((fb) => (
                    <div key={fb.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">التقييم:</span>
                          {fb.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < fb.rating! ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                          {getFeedbackBadge(fb.decision)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(fb.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      {fb.comments && (
                        <p className="text-sm text-muted-foreground mb-2">{fb.comments}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        بواسطة: {fb.createdByUser.name} ({fb.createdByUser.role})
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
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

export default ApplicationTimeline;