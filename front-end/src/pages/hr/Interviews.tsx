import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveTable, ResponsiveTableHeader, ResponsiveTableBody, ResponsiveTableRow, ResponsiveTableHead, ResponsiveTableCell } from "@/components/ui/responsive-table";
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Building2,
  CheckCircle,
  XCircle,
  Send,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { hrApiService } from "@/services/hrApi";
import { useLanguage } from "@/contexts/LanguageContext";

interface Interview {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  position: string;
  company: string;
  type: string;
  method: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  interviewer: string;
  status: string;
  notes: string;
  priority: string;
  applicantId: string;
  jobApplicationId: string;
  scheduledBy: string;
  agoraChannelName?: string;
  agoraToken?: string;
}

const HRInterviews = () => {
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [videoCallInterview, setVideoCallInterview] = useState<Interview | null>(null);
  const [newInterview, setNewInterview] = useState({
    applicantId: "",
    jobApplicationId: "",
    scheduledTime: "",
    duration: 60,
    location: "",
    interviewType: "PHONE",
    notes: ""
  });



  // API Functions
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await hrApiService.getInterviews();
      // Transform API data to match our interface
      const transformedData = response.data.map((interview: any) => ({
        id: interview.id,
        candidateName: interview.applicant?.name || t('hr.interviews.notSpecified'),
        candidateAvatar: interview.applicant?.name?.charAt(0) || 'م',
        position: interview.jobApplication?.job?.title || t('hr.interviews.notSpecified'),
        company: interview.jobApplication?.job?.company || t('hr.interviews.notSpecified'),
        type: interview.interviewType === 'PHONE' ? t('hr.interviews.phoneInterview') : 
              interview.interviewType === 'VIDEO' ? t('hr.interviews.videoInterview') : 
              interview.interviewType === 'IN_PERSON' ? t('hr.interviews.inPersonInterview') : t('hr.interviews.firstInterview'),
        method: interview.interviewType === 'PHONE' ? t('hr.interviews.phone') : 
                interview.interviewType === 'VIDEO' ? t('hr.interviews.video') : t('hr.interviews.inPerson'),
        date: new Date(interview.scheduledTime).toLocaleDateString('ar-SA'),
        time: new Date(interview.scheduledTime).toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: `${interview.duration} دقيقة`,
        location: interview.location || 'غير محدد',
        interviewer: interview.scheduledBy?.name || 'غير محدد',
        status: interview.status === 'SCHEDULED' ? 'مجدولة' : 
                interview.status === 'COMPLETED' ? 'مكتملة' : 
                interview.status === 'CANCELLED' ? 'ملغية' : 'مؤجلة',
        notes: interview.notes || '',
        priority: 'متوسطة',
        applicantId: interview.applicantId,
        jobApplicationId: interview.jobApplicationId,
        scheduledBy: interview.scheduledBy?.name || 'غير محدد',
        agoraChannelName: interview.agoraChannelName,
        agoraToken: interview.agoraToken
      }));
      setInterviews(transformedData);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setInterviews([]);
      toast.error('فشل في تحميل المقابلات');
    } finally {
      setLoading(false);
    }
  };

  const scheduleInterview = async () => {
    try {
      // Validation
      if (!newInterview.jobApplicationId) {
        toast.error('يرجى إدخال معرف طلب الوظيفة');
        return;
      }
      if (!newInterview.scheduledTime) {
        toast.error('يرجى تحديد موعد المقابلة');
        return;
      }
      
      const title = `مقابلة ${newInterview.interviewType === 'PHONE' ? 'هاتفية' : newInterview.interviewType === 'VIDEO' ? 'مرئية' : 'حضورية'}`;
      
      const interviewData = {
        applicationId: newInterview.jobApplicationId.trim(),
        title: title,
        type: newInterview.interviewType as 'PHONE' | 'VIDEO' | 'IN_PERSON',
        scheduledAt: newInterview.scheduledTime,
        ...(newInterview.duration && { duration: newInterview.duration }),
        ...(newInterview.location && { location: newInterview.location.trim() }),
        ...(newInterview.notes && { notes: newInterview.notes.trim() })
      };
      
      console.log('Sending interview data:', interviewData);
      await hrApiService.scheduleInterview(interviewData);
      
      toast.success(t('hr.interviews.scheduleSuccess'));
      setIsScheduleDialogOpen(false);
      setNewInterview({
        applicantId: "",
        jobApplicationId: "",
        scheduledTime: "",
        duration: 60,
        location: "",
        interviewType: "PHONE",
        notes: ""
      });
      fetchInterviews();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error(t('hr.interviews.scheduleError'));
    }
  };



  const updateInterviewStatus = async (interviewId: string, status: string) => {
    try {
      const apiStatus = status === t('hr.interviews.scheduled') ? 'SCHEDULED' : 
                       status === t('hr.interviews.completed') ? 'COMPLETED' : 
                       status === t('hr.interviews.cancelled') ? 'CANCELLED' : 'RESCHEDULED';
      
      await hrApiService.updateInterviewStatus(interviewId, apiStatus);
      toast.success(t('hr.interviews.updateSuccess'));
      fetchInterviews();
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast.error(t('hr.interviews.updateError'));
    }
  };

  const sendReminder = async (interviewId: string, type: 'email' | 'whatsapp') => {
    try {
      const token = localStorage.getItem('access_token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE}/notifications/reminder/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interviewId })
      });
      
      if (response.ok) {
        toast.success(`${t('hr.interviews.reminderSent')} ${type === 'email' ? t('hr.interviews.email') : t('hr.interviews.whatsapp')}`);
      } else {
        toast.error(t('hr.interviews.reminderFailed'));
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error(t('hr.interviews.connectionFailed'));
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Filter interviews based on search and status
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case t('hr.interviews.scheduled'):
        return "bg-info text-info-foreground";
      case t('hr.interviews.completed'):
        return "bg-secondary text-secondary-foreground";
      case t('hr.interviews.postponed'):
        return "bg-warning text-warning-foreground";
      case t('hr.interviews.cancelled'):
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case t('hr.interviews.video'):
        return <Video className="h-3 w-3" />;
      case t('hr.interviews.phone'):
        return <Phone className="h-3 w-3" />;
      case t('hr.interviews.inPerson'):
        return <Building2 className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case t('hr.interviews.high'):
        return "bg-destructive text-destructive-foreground";
      case t('hr.interviews.medium'):
        return "bg-warning text-warning-foreground";
      case t('hr.interviews.low'):
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <MainLayout userRole="hr" userName="سارة أحمد">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{t('hr.interviews.title')}</h1>
            <p className="text-muted-foreground">{t('hr.interviews.subtitle')}</p>
          </div>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('hr.interviews.scheduleNew')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('hr.interviews.scheduleInterview')}</DialogTitle>
                <DialogDescription>
                  {t('hr.interviews.addNewInterview')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="applicantId">{t('hr.interviews.applicantId')}</Label>
                  <Input
                    id="applicantId"
                    value={newInterview.applicantId}
                    onChange={(e) => setNewInterview({...newInterview, applicantId: e.target.value})}
                    placeholder={t('hr.interviews.applicantIdPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="jobApplicationId">{t('hr.interviews.jobApplication')}</Label>
                  <Input
                    id="jobApplicationId"
                    value={newInterview.jobApplicationId}
                    onChange={(e) => setNewInterview({...newInterview, jobApplicationId: e.target.value})}
                    placeholder={t('hr.interviews.jobApplicationPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime">{t('hr.interviews.scheduledTime')}</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={newInterview.scheduledTime}
                    onChange={(e) => setNewInterview({...newInterview, scheduledTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">{t('hr.interviews.interviewDuration')} ({t('hr.interviews.minutes')})</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newInterview.duration}
                    onChange={(e) => setNewInterview({...newInterview, duration: parseInt(e.target.value)})}
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label htmlFor="interviewType">{t('hr.interviews.interviewType')}</Label>
                  <Select value={newInterview.interviewType} onValueChange={(value) => setNewInterview({...newInterview, interviewType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHONE">{t('hr.interviews.phone')}</SelectItem>
                      <SelectItem value="VIDEO">{t('hr.interviews.video')}</SelectItem>
                      <SelectItem value="IN_PERSON">{t('hr.interviews.inPerson')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">{t('hr.interviews.location')}</Label>
                  <Input
                    id="location"
                    value={newInterview.location}
                    onChange={(e) => setNewInterview({...newInterview, location: e.target.value})}
                    placeholder={t('hr.interviews.locationPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">{t('hr.interviews.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={newInterview.notes}
                    onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})}
                    placeholder={t('hr.interviews.notesPlaceholder')}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={scheduleInterview} className="flex-1">
                    {t('hr.interviews.scheduleInterview')}
                  </Button>
                  <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)} className="flex-1">
                    {t('hr.interviews.cancel')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('hr.interviews.totalInterviews')}</p>
                <p className="text-2xl font-bold">{loading ? '-' : interviews.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('hr.interviews.scheduled')}</p>
                <p className="text-2xl font-bold">{loading ? '-' : interviews.filter(i => i.status === t('hr.interviews.scheduled')).length}</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('hr.interviews.completed')}</p>
                <p className="text-2xl font-bold">{loading ? '-' : interviews.filter(i => i.status === t('hr.interviews.completed')).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-secondary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('hr.interviews.postponed')}</p>
                <p className="text-2xl font-bold">{loading ? '-' : interviews.filter(i => i.status === t('hr.interviews.postponed')).length}</p>
              </div>
              <XCircle className="h-8 w-8 text-warning" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('hr.interviews.searchPlaceholder')}
                    className="pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('hr.interviews.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hr.interviews.allStatuses')}</SelectItem>
                  <SelectItem value="مجدولة">{t('hr.interviews.scheduled')}</SelectItem>
                  <SelectItem value="مكتملة">{t('hr.interviews.completed')}</SelectItem>
                  <SelectItem value="مؤجلة">{t('hr.interviews.postponed')}</SelectItem>
                  <SelectItem value="ملغية">{t('hr.interviews.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interviews Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('hr.interviews.interviewsList')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>{t('hr.interviews.candidate')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.interviews.jobAndCompany')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.interviews.interviewType')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.interviews.dateAndTime')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.interviews.locationMethod')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.interviews.interviewer')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.interviews.priority')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.interviews.status')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.interviews.actions')}</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                  {loading ? (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell className="p-8 text-center" colSpan={9}>
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>جاري تحميل المقابلات...</span>
                        </div>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ) : filteredInterviews.length === 0 ? (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell className="p-8 text-center text-muted-foreground" colSpan={9}>
                        {searchTerm || statusFilter !== 'all' ? 'لا توجد مقابلات تطابق معايير البحث' : 'لا توجد مقابلات مجدولة'}
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ) : (
                    filteredInterviews.map((interview) => (
                    <ResponsiveTableRow key={interview.id} headers={['المرشح', 'الوظيفة والشركة', 'نوع المقابلة', 'الموعد والوقت', 'المكان/الطريقة', 'المحاور', 'الأولوية', 'الحالة', 'الإجراءات']}>
                      <ResponsiveTableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="" alt={interview.candidateName} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {interview.candidateAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-xs">{interview.candidateName}</div>
                            <div className="text-xs text-muted-foreground">{interview.id}</div>
                          </div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-xs">{interview.position}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-2 w-2" />
                            <span className="truncate">{interview.company}</span>
                          </div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <Badge variant="outline" className="text-xs">
                          {interview.type}
                        </Badge>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-2 w-2 text-muted-foreground" />
                            <span className="truncate">{interview.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-2 w-2 text-muted-foreground" />
                            <span className="truncate">{interview.time} ({interview.duration})</span>
                          </div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="flex items-center gap-1 text-xs">
                          {getMethodIcon(interview.method)}
                          <div>
                            <div className="truncate">{interview.method}</div>
                            <div className="text-muted-foreground truncate">{interview.location}</div>
                          </div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <Users className="h-2 w-2 text-muted-foreground" />
                          <span className="truncate">{interview.interviewer}</span>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <Badge className={getPriorityColor(interview.priority)}>
                          {interview.priority}
                        </Badge>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-2 w-2" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-2 w-2" />
                          </Button>
                          {interview.status === t('hr.interviews.scheduled') && (
                            <>
                              {interview.method === t('hr.interviews.video') && (
                                <Button 
                                size="sm" 
                                className="h-6 px-1 text-xs bg-red-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  setVideoCallInterview(interview);
                                  setIsVideoCallOpen(true);
                                }}
                              >
                                <Video className="h-2 w-2 mr-1" />
                                {t('hr.interviews.join')}
                              </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 px-1 text-xs"
                                onClick={() => sendReminder(interview.id, 'email')}
                              >
                                <Send className="h-2 w-2 mr-1" />
                                {t('hr.interviews.emailShort')}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 px-1 text-xs"
                                onClick={() => sendReminder(interview.id, 'whatsapp')}
                              >
                                <Phone className="h-2 w-2 mr-1" />
                                {t('hr.interviews.whatsappShort')}
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-6 px-1 text-xs bg-secondary hover:bg-secondary/90"
                                onClick={() => updateInterviewStatus(interview.id, t('hr.interviews.completed'))}
                              >
                                <CheckCircle className="h-2 w-2 mr-1" />
                                {t('hr.interviews.complete')}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-6 px-1 text-xs"
                                onClick={() => updateInterviewStatus(interview.id, t('hr.interviews.cancelled'))}
                              >
                                <XCircle className="h-2 w-2 mr-1" />
                                {t('hr.interviews.cancel')}
                              </Button>
                            </>
                          )}
                        </div>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  )))
                  }
              </ResponsiveTableBody>
            </ResponsiveTable>


          </CardContent>
        </Card>

        {/* Interview Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('hr.interviews.interviewNotes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interviews.filter(i => i.notes).map((interview) => (
                <div key={interview.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{interview.candidateName} - {interview.position}</div>
                    <Badge className={getStatusColor(interview.status)} variant="outline">
                      {interview.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{interview.notes}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Interview Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل المقابلة</DialogTitle>
              <DialogDescription>
                عرض تفاصيل المقابلة المحددة
              </DialogDescription>
            </DialogHeader>
            {selectedInterview && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('hr.interviews.candidateName')}</Label>
                    <p className="text-sm font-medium">{selectedInterview.candidateName}</p>
                  </div>
                  <div>
                    <Label>الوظيفة</Label>
                    <p className="text-sm font-medium">{selectedInterview.position}</p>
                  </div>
                  <div>
                    <Label>الشركة</Label>
                    <p className="text-sm font-medium">{selectedInterview.company}</p>
                  </div>
                  <div>
                    <Label>نوع المقابلة</Label>
                    <p className="text-sm font-medium">{selectedInterview.type}</p>
                  </div>
                  <div>
                    <Label>التاريخ</Label>
                    <p className="text-sm font-medium">{selectedInterview.date}</p>
                  </div>
                  <div>
                    <Label>الوقت</Label>
                    <p className="text-sm font-medium">{selectedInterview.time}</p>
                  </div>
                  <div>
                    <Label>المدة</Label>
                    <p className="text-sm font-medium">{selectedInterview.duration}</p>
                  </div>
                  <div>
                    <Label>المكان/الطريقة</Label>
                    <p className="text-sm font-medium">{selectedInterview.location}</p>
                  </div>
                  <div>
                    <Label>المحاور</Label>
                    <p className="text-sm font-medium">{selectedInterview.interviewer}</p>
                  </div>
                  <div>
                    <Label>الحالة</Label>
                    <Badge className={getStatusColor(selectedInterview.status)}>
                      {selectedInterview.status}
                    </Badge>
                  </div>
                </div>
                {selectedInterview.notes && (
                  <div>
                    <Label>الملاحظات</Label>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedInterview.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  {selectedInterview.status === 'مجدولة' && (
                    <>
                      <Button onClick={() => sendReminder(selectedInterview.id, 'email')} className="gap-2">
                        <Send className="h-4 w-4" />
                        إرسال تذكير بالبريد
                      </Button>
                      <Button onClick={() => sendReminder(selectedInterview.id, 'whatsapp')} variant="outline" className="gap-2">
                        <Phone className="h-4 w-4" />
                        إرسال تذكير بالواتساب
                      </Button>
                    </>
                  )}
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="mr-auto">
                    إغلاق
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Video Call Dialog */}
        <Dialog open={isVideoCallOpen} onOpenChange={setIsVideoCallOpen}>
          <DialogContent className="max-w-6xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{t('hr.interviews.videoInterview')} - {videoCallInterview?.candidateName}</DialogTitle>
              <DialogDescription>
                {t('hr.interviews.conductVideoInterview')}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Edit Interview Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('hr.interviews.editInterview')}</DialogTitle>
              <DialogDescription>
                {t('hr.interviews.updateInterviewDetails')}
              </DialogDescription>
            </DialogHeader>
            {selectedInterview && (
              <div className="space-y-4">
                <div>
                  <Label>اسم المرشح</Label>
                  <p className="text-sm font-medium text-muted-foreground">{selectedInterview.candidateName}</p>
                </div>
                <div>
                  <Label htmlFor="editLocation">{t('hr.interviews.location')}</Label>
                  <Input
                    id="editLocation"
                    defaultValue={selectedInterview.location}
                    placeholder={t('hr.interviews.locationPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="editNotes">{t('hr.interviews.notes')}</Label>
                  <Textarea
                    id="editNotes"
                    defaultValue={selectedInterview.notes}
                    placeholder={t('hr.interviews.notesPlaceholder')}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    {t('hr.interviews.saveChanges')}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default HRInterviews;