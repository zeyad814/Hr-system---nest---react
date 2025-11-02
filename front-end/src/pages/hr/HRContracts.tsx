import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { hrApiService } from "@/services/hrApi";
import { Calendar, Clock, Phone, Video, MapPin, User, AlertCircle, FileText } from "lucide-react";
import { applicantApiService, Interview } from "@/services/applicantApi";
import { toast } from "@/hooks/use-toast";

export default function HRContracts() {
  const { t } = useLanguage();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [interviewRequests, setInterviewRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewResponse, setReviewResponse] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewDate, setReviewDate] = useState("");
  const [reviewTime, setReviewTime] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    fetchInterviews();
    fetchInterviewRequests();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      // جلب جميع المقابلات من HR
      const response = await hrApiService.getInterviews();
      setInterviews(response.data || []);
    } catch (e) {
      console.error('Error fetching interviews:', e);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewRequests = async () => {
    try {
      setRequestsLoading(true);
      const requests = await hrApiService.getPendingInterviewRequests();
      setInterviewRequests(requests);
    } catch (e) {
      setInterviewRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'PHONE': return <Phone className="h-4 w-4" />;
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'IN_PERSON': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getInterviewStatusBadge = (interview: Interview) => {
    if (interview.applicantResponse === 'ACCEPTED') {
      return <Badge className="bg-green-100 text-green-800">✓ مقبول من المتقدم</Badge>;
    }
    if (interview.applicantResponse === 'REJECTED' && interview.hrResponse === 'PENDING') {
      return <Badge className="bg-yellow-100 text-yellow-800">⏳ في انتظار المراجعة</Badge>;
    }
    if (interview.applicantResponse === 'REJECTED' && interview.hrResponse === 'APPROVED') {
      return <Badge className="bg-blue-100 text-blue-800">✓ تم إعادة الجدولة</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">مجدولة</Badge>;
  };

  const openReviewDialog = (request: any) => {
    setSelectedRequest(request);
    setReviewResponse('APPROVED');
    setReviewDate("");
    setReviewTime("");
    setReviewNotes("");
    setIsReviewDialogOpen(true);
  };

  const confirmReview = async () => {
    if (!selectedRequest) return;
    try {
      const suggestedDate = reviewDate && reviewTime 
        ? new Date(`${reviewDate}T${reviewTime}`).toISOString()
        : undefined;

      await hrApiService.hrReviewInterviewRequest(
        selectedRequest.id,
        reviewResponse,
        suggestedDate,
        reviewNotes || undefined
      );
      
      toast({ title: t('common.success'), description: 'تم معالجة الطلب بنجاح' });
      setIsReviewDialogOpen(false);
      setSelectedRequest(null);
      fetchInterviewRequests();
      fetchInterviews();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.response?.data?.message || 'فشل معالجة الطلب', variant: 'destructive' });
    }
  };

  return (
    <MainLayout userRole="hr" userName="HR">
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">المقابلات المجدولة</h1>
        </div>

        {/* المقابلات المجدولة */}
        <Card>
          <CardHeader>
            <CardTitle>المقابلات ({interviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-6 text-center">جاري التحميل...</div>
            ) : interviews.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">لا توجد مقابلات مجدولة حالياً</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviews.map(interview => (
                  <Card key={interview.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{interview.title}</div>
                        {getInterviewStatusBadge(interview)}
                      </div>
                      {interview.application?.job?.title && (
                        <div className="text-sm text-muted-foreground">
                          الوظيفة: {interview.application.job.title}
                        </div>
                      )}
                      {interview.candidate?.user && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          المتقدم: {interview.candidate.user.name}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(interview.scheduledAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(interview.scheduledAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {getInterviewTypeIcon(interview.type)}
                        <span>
                          {interview.type === 'PHONE' ? 'هاتف' : 
                           interview.type === 'VIDEO' ? 'فيديو' : 
                           interview.type === 'IN_PERSON' ? 'وجاهي' : 
                           interview.type}
                        </span>
                      </div>
                      {interview.description && (
                        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded line-clamp-2">
                          {interview.description}
                        </div>
                      )}
                      {interview.scheduledByUser && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span>جدول بواسطة: {interview.scheduledByUser.name}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interview Requests Section */}
        <Card>
          <CardHeader>
            <CardTitle>طلبات رفض المقابلات ({interviewRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="py-6 text-center">جاري التحميل...</div>
            ) : interviewRequests.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">لا توجد طلبات حالياً</div>
            ) : (
              <div className="space-y-4">
                {interviewRequests.map((req) => (
                  <Card key={req.id} className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">{req.candidate?.user?.name || 'غير محدد'}</span>
                            <Badge className="bg-yellow-100 text-yellow-800">مرفوض</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            الوظيفة: {req.application?.job?.title || '-'}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>الميعاد الأصلي: {new Date(req.scheduledAt).toLocaleString('ar-SA')}</span>
                            </div>
                            {req.applicantSuggestedDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>ميعاد مقترح: {new Date(req.applicantSuggestedDate).toLocaleString('ar-SA')}</span>
                              </div>
                            )}
                          </div>
                          {req.applicantRejectedNotes && (
                            <div className="bg-white p-2 rounded text-xs text-gray-700">
                              <strong>ملاحظات المتقدم:</strong> {req.applicantRejectedNotes}
                            </div>
                          )}
                        </div>
                        <Button size="sm" onClick={() => openReviewDialog(req)}>
                          <FileText className="h-4 w-4 ml-2" />
                          مراجعة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Interview Request Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>مراجعة طلب رفض المقابلة</DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>المتقدم:</strong> {selectedRequest.candidate?.user?.name}</p>
                    <p><strong>الوظيفة:</strong> {selectedRequest.application?.job?.title}</p>
                    <p><strong>الميعاد الأصلي:</strong> {new Date(selectedRequest.scheduledAt).toLocaleString('ar-SA')}</p>
                    {selectedRequest.applicantSuggestedDate && (
                      <p><strong>الميعاد المقترح:</strong> {new Date(selectedRequest.applicantSuggestedDate).toLocaleString('ar-SA')}</p>
                    )}
                    {selectedRequest.applicantRejectedNotes && (
                      <div className="bg-gray-50 p-2 rounded mt-2">
                        <strong>ملاحظات:</strong> {selectedRequest.applicantRejectedNotes}
                      </div>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>القرار</Label>
                <Select value={reviewResponse} onValueChange={(v: any) => setReviewResponse(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">موافقة (تحديث الميعاد)</SelectItem>
                    <SelectItem value="REJECTED">رفض (اقتراح ميعاد جديد)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reviewResponse === 'APPROVED' && selectedRequest?.applicantSuggestedDate && (
                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <p className="text-green-800">سيتم قبول الميعاد المقترح من المتقدم: {new Date(selectedRequest.applicantSuggestedDate).toLocaleString('ar-SA')}</p>
                </div>
              )}

              {reviewResponse === 'REJECTED' && (
                <>
                  <div className="space-y-2">
                    <Label>ميعاد جديد مقترح (اختياري)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">التاريخ</Label>
                        <Input 
                          type="date" 
                          value={reviewDate}
                          onChange={(e) => setReviewDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">الوقت</Label>
                        <Input 
                          type="time" 
                          value={reviewTime}
                          onChange={(e) => setReviewTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ملاحظات (اختياري)</Label>
                    <Textarea 
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="اكتب ملاحظاتك..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={confirmReview}>
                  {reviewResponse === 'APPROVED' ? 'موافقة' : 'رفض'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

