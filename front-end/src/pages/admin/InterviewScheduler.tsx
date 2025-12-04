import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, Users, Video, Mail, User, FileText, Plus, Edit, Trash2, ExternalLink, Play, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';

interface InterviewSchedule {
  id: string;
  title: string;
  description?: string;
  candidateName: string;
  candidateEmail: string;
  interviewerName: string;
  interviewerEmail: string;
  scheduledDate: string;
  duration: number;
  meetingType: 'GOOGLE_MEET' | 'ZOOM';
  meetingLink?: string;
  meetingId?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const InterviewScheduler: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewSchedule | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    candidateName: '',
    candidateEmail: '',
    interviewerName: '',
    interviewerEmail: '',
    scheduledDate: '',
    duration: 60,
    meetingType: 'ZOOM' as 'GOOGLE_MEET' | 'ZOOM', // Changed from GOOGLE_MEET to ZOOM
    notes: '',
  });

  useEffect(() => {
    loadInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/interviews/schedule');
      setInterviews(response.data);
    } catch (error) {
      console.error('Error loading interviews:', error);
      toast({
        title: t('common.error'),
        description: t('admin.interviews.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      description: '',
      candidateName: '',
      candidateEmail: '',
      interviewerName: '',
      interviewerEmail: '',
      scheduledDate: '',
      duration: 60,
      meetingType: 'ZOOM', // Changed from GOOGLE_MEET to ZOOM
      notes: '',
    });
    setIsAddOpen(true);
  };

  const handleEdit = (interview: InterviewSchedule) => {
    setSelectedInterview(interview);
    setFormData({
      title: interview.title,
      description: interview.description || '',
      candidateName: interview.candidateName,
      candidateEmail: interview.candidateEmail,
      interviewerName: interview.interviewerName,
      interviewerEmail: interview.interviewerEmail,
      scheduledDate: new Date(interview.scheduledDate).toISOString().slice(0, 16),
      duration: interview.duration,
      meetingType: interview.meetingType,
      notes: interview.notes || '',
    });
    setIsEditOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let response;
      if (isEditOpen) {
        response = await api.put(`/interviews/schedule/${selectedInterview?.id}`, formData);
        toast({
          title: t('common.success'),
          description: t('admin.interviews.updateSuccess'),
        });
      } else {
        response = await api.post('/interviews/schedule', formData);
        
        // Check if Zoom fallback was used
        if (response.data?.fallbackUsed && formData.meetingType === 'ZOOM') {
          toast({
            title: t('admin.interviews.zoomNotConfigured'),
            description: response.data.fallbackReason || t('admin.interviews.zoomFallbackWarning'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('common.success'),
            description: t('admin.interviews.createSuccess'),
          });
        }
      }
      loadInterviews();
      setIsAddOpen(false);
      setIsEditOpen(false);
      setSelectedInterview(null);
    } catch (error: unknown) {
      console.error('Error saving interview:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError?.response?.data?.message || t('admin.interviews.saveError');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.delete(`/interviews/schedule/${id}`);
      toast({
        title: t('common.success'),
        description: t('admin.interviews.cancelSuccess'),
      });
      loadInterviews();
    } catch (error) {
      console.error('Error cancelling interview:', error);
      toast({
        title: t('common.error'),
        description: t('admin.interviews.cancelError'),
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'RESCHEDULED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    return type === 'GOOGLE_MEET' ? '🎥' : '📹';
  };

  const handleStartInterview = (interview: InterviewSchedule) => {
    if (interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    } else {
      toast({
        title: t('common.error'),
        description: t('admin.interviews.noMeetingLink'),
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async (interview: InterviewSchedule) => {
    if (interview.meetingLink) {
      try {
        await navigator.clipboard.writeText(interview.meetingLink);
        setCopiedLinkId(interview.id);
        toast({
          title: t('common.success'),
          description: t('admin.interviews.linkCopied'),
        });
        setTimeout(() => setCopiedLinkId(null), 2000);
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('admin.interviews.copyError'),
          variant: 'destructive',
        });
      }
    }
  };

  const canStartInterview = (interview: InterviewSchedule) => {
    const now = new Date();
    const scheduledDate = new Date(interview.scheduledDate);
    const timeDiff = scheduledDate.getTime() - now.getTime();
    const minutesUntil = timeDiff / (1000 * 60);
    
    // يمكن بدء المقابلة قبل 15 دقيقة من الموعد المحدد
    return interview.status === 'SCHEDULED' && interview.meetingLink && minutesUntil <= 15;
  };

  const canJoinMeeting = (interview: InterviewSchedule) => {
    const now = new Date();
    const scheduledDate = new Date(interview.scheduledDate);
    // يمكن الانضمام قبل دقيقة واحدة من الموعد
    const minutesUntil = (scheduledDate.getTime() - now.getTime()) / (1000 * 60);
    return minutesUntil <= 1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('admin.interviews.title')}</h1>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.interviews.scheduleInterview')}
          </Button>
        </div>

      {/* Interview List */}
      <div className="grid gap-4">
        {interviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('admin.interviews.noInterviews')}</h3>
              <p className="text-muted-foreground mb-4">{t('admin.interviews.noInterviewsDesc')}</p>
              <Button onClick={handleAdd}>{t('admin.interviews.scheduleInterview')}</Button>
            </CardContent>
          </Card>
        ) : (
          interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getMeetingTypeIcon(interview.meetingType)}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{interview.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(interview.scheduledDate), 'PPP p')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(interview.status)}>
                      {t(`admin.interviews.status.${interview.status.toLowerCase()}`)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(interview)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {interview.status === 'SCHEDULED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(interview.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{interview.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{interview.candidateEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{interview.interviewerName}</p>
                      <p className="text-xs text-muted-foreground">{interview.interviewerEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {interview.duration} {t('admin.interviews.minutes')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <Badge variant="outline" className="text-xs">
                      {interview.meetingType === 'GOOGLE_MEET' 
                        ? t('admin.interviews.meetingType.google_meet') 
                        : t('admin.interviews.meetingType.zoom')}
                    </Badge>
                  </div>
                </div>
                
                {!interview.meetingLink && interview.status === 'SCHEDULED' && (
                  <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    {t('admin.interviews.meetingLinkPending')}
                  </div>
                )}

                {interview.meetingLink && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    {interview.meetingType === 'ZOOM' && interview.meetingLink.includes('meet.jit.si') && (
                      <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        ⚠️ {t('admin.interviews.zoomFallbackWarning')}
                      </div>
                    )}
                    {!canJoinMeeting(interview) && (
                      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        ℹ️ {t('admin.interviews.meetingNotStarted')}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {canStartInterview(interview) && (
                        <Button
                          onClick={() => handleStartInterview(interview)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Play className="h-4 w-4" />
                          {interview.meetingType === 'GOOGLE_MEET' 
                            ? t('admin.interviews.startGoogleMeet') 
                            : interview.meetingLink.includes('meet.jit.si')
                            ? t('admin.interviews.startJitsi')
                            : t('admin.interviews.startZoom')}
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStartInterview(interview)}
                        className="flex items-center gap-2"
                        disabled={!canJoinMeeting(interview)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('admin.interviews.joinMeeting')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(interview)}
                        className="flex items-center gap-2"
                        disabled={!canJoinMeeting(interview)}
                      >
                        {copiedLinkId === interview.id ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            {t('admin.interviews.copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            {t('admin.interviews.copyLink')}
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      <span className="break-all">{interview.meetingLink}</span>
                    </div>
                  </div>
                )}

                {interview.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{t('admin.interviews.notes')}</p>
                        <p className="text-sm text-muted-foreground">{interview.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {isEditOpen ? t('admin.interviews.editInterview') : t('admin.interviews.scheduleInterview')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('admin.interviews.title')} *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder={t('admin.interviews.titlePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingType">{t('admin.interviews.meetingType')} *</Label>
                  <Select
                    value={formData.meetingType}
                    onValueChange={(value) => setFormData({...formData, meetingType: value as 'GOOGLE_MEET' | 'ZOOM'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="GOOGLE_MEET">{t('admin.interviews.meetingType.google_meet')}</SelectItem> */}
                      <SelectItem value="ZOOM">{t('admin.interviews.meetingType.zoom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('admin.interviews.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={t('admin.interviews.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateName">{t('admin.interviews.candidateName')} *</Label>
                  <Input
                    id="candidateName"
                    value={formData.candidateName}
                    onChange={(e) => setFormData({...formData, candidateName: e.target.value})}
                    placeholder={t('admin.interviews.candidateNamePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidateEmail">{t('admin.interviews.candidateEmail')} *</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    value={formData.candidateEmail}
                    onChange={(e) => setFormData({...formData, candidateEmail: e.target.value})}
                    placeholder={t('admin.interviews.candidateEmailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interviewerName">{t('admin.interviews.interviewerName')} *</Label>
                  <Input
                    id="interviewerName"
                    value={formData.interviewerName}
                    onChange={(e) => setFormData({...formData, interviewerName: e.target.value})}
                    placeholder={t('admin.interviews.interviewerNamePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interviewerEmail">{t('admin.interviews.interviewerEmail')} *</Label>
                  <Input
                    id="interviewerEmail"
                    type="email"
                    value={formData.interviewerEmail}
                    onChange={(e) => setFormData({...formData, interviewerEmail: e.target.value})}
                    placeholder={t('admin.interviews.interviewerEmailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">{t('admin.interviews.scheduledDate')} *</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">{t('admin.interviews.duration')} *</Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 {t('admin.interviews.minutes')}</SelectItem>
                      <SelectItem value="60">60 {t('admin.interviews.minutes')}</SelectItem>
                      <SelectItem value="90">90 {t('admin.interviews.minutes')}</SelectItem>
                      <SelectItem value="120">120 {t('admin.interviews.minutes')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('admin.interviews.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder={t('admin.interviews.notesPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                    setSelectedInterview(null);
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {isEditOpen ? t('common.update') : t('admin.interviews.scheduleInterview')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
};

export default InterviewScheduler;
