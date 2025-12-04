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
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
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
    meetingType: "ZOOM" as "GOOGLE_MEET" | "ZOOM", // Changed from GOOGLE_MEET to ZOOM
    notes: ""
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [availableApplications, setAvailableApplications] = useState<Array<{id: string; jobTitle?: string; applicant?: {user?: {name?: string; email?: string}}; clientName?: string; status?: string}>>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [availableApplicants, setAvailableApplicants] = useState<Array<{id: string; user?: {name?: string; email?: string}; phone?: string}>>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Validation function
  const validateField = (name: string, value: string | number) => {
    const errors = { ...formErrors };
    
    switch (name) {
      case 'applicantId': {
        const applicantIdStr = String(value);
        if (!applicantIdStr.trim()) {
          errors.applicantId = t('hr.interviews.applicantId') + ' مطلوب';
        } else if (applicantIdStr.trim().length < 5) {
          errors.applicantId = t('hr.interviews.applicantId') + ' قصير جداً';
        } else {
          delete errors.applicantId;
        }
        break;
      }
      case 'jobApplicationId': {
        const jobAppIdStr = String(value);
        if (!jobAppIdStr.trim()) {
          errors.jobApplicationId = t('hr.interviews.jobApplication') + ' مطلوب';
        } else if (jobAppIdStr.trim().length < 10) {
          errors.jobApplicationId = t('hr.interviews.jobApplication') + ' قصير جداً';
        } else {
          delete errors.jobApplicationId;
        }
        break;
      }
      case 'scheduledTime': {
        const timeStr = String(value);
        if (!timeStr) {
          errors.scheduledTime = t('hr.interviews.scheduledTime') + ' مطلوب';
        } else if (new Date(timeStr) <= new Date()) {
          errors.scheduledTime = t('hr.interviews.timeRequired');
        } else {
          delete errors.scheduledTime;
        }
        break;
      }
      case 'duration': {
        const durationNum = typeof value === 'number' ? value : Number(value);
        if (!durationNum || durationNum < 15) {
          errors.duration = t('hr.interviews.requiredDuration');
        } else if (durationNum > 480) {
          errors.duration = t('hr.interviews.requiredDuration');
        } else {
          delete errors.duration;
        }
        break;
      }
      case 'interviewType': {
        if (!value) {
          errors.interviewType = t('hr.interviews.interviewType') + ' مطلوب';
        } else {
          delete errors.interviewType;
        }
        break;
      }
    }
    
    setFormErrors(errors);
  };

  // Handle input change with validation
  const handleInputChange = (name: string, value: string | number) => {
    setNewInterview(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await hrApiService.getInterviews();
      console.log('API connection test successful:', response);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  };

  // Fetch available job applications
  const fetchAvailableApplications = async () => {
    try {
      setLoadingApplications(true);
      // Get all jobs first
      const jobsResponse = await hrApiService.getJobs();
      const jobs = jobsResponse.data || [];
      
      // Get applications for each job
      const allApplications = [];
      for (const job of jobs) {
        try {
          const applicationsResponse = await hrApiService.getJobApplications(job.id);
          const applications = applicationsResponse.map((app: {id: string; applicant?: {user?: {name?: string; email?: string}}; status?: string}) => ({
            ...app,
            jobTitle: job.title,
            jobId: job.id,
            clientName: job.client?.name || 'غير محدد'
          }));
          allApplications.push(...applications);
        } catch (error) {
          console.warn(`Failed to fetch applications for job ${job.id}:`, error);
        }
      }
      
      setAvailableApplications(allApplications);
      console.log('Available applications:', allApplications);
      console.log('Applications count:', allApplications.length);
      
      // Log detailed information for debugging
      allApplications.forEach((app, index) => {
        console.log(`Application ${index + 1}:`, {
          id: app.id,
          jobTitle: app.jobTitle,
          applicantName: app.applicant?.user?.name,
          applicantEmail: app.applicant?.user?.email,
          clientName: app.clientName,
          status: app.status,
          appliedAt: app.appliedAt
        });
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      setAvailableApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Fetch available applicants
  const fetchAvailableApplicants = async () => {
    try {
      setLoadingApplicants(true);
      const response = await hrApiService.getApplicants();
      setAvailableApplicants(response.data || []);
      console.log('Available applicants:', response.data);
      console.log('Applicants count:', response.data?.length || 0);
      
      // Log detailed information for debugging
      (response.data || []).forEach((applicant, index) => {
        console.log(`Applicant ${index + 1}:`, {
          id: applicant.id,
          name: applicant.user?.name,
          email: applicant.user?.email,
          phone: applicant.phone,
          skills: applicant.skills,
          experience: applicant.experience
        });
      });
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setAvailableApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Validate job application ID exists
  const validateJobApplicationId = async (applicationId: string) => {
    if (!applicationId.trim()) return;
    
    try {
      // You can add an API call here to validate the application ID
      // For now, we'll just do basic validation
      if (applicationId.length < 10) {
        setFormErrors(prev => ({ ...prev, jobApplicationId: 'معرف طلب الوظيفة قصير جداً' }));
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.jobApplicationId;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error validating job application ID:', error);
    }
  };

  // API Functions
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await hrApiService.getInterviews();
      // Transform API data to match our interface
      const transformedData = (response.data as Array<{id: string; applicant?: {name?: string}; jobApplication?: {job?: {title?: string; company?: string}}; interviewType?: string; scheduledTime?: string; duration?: number; location?: string; scheduledBy?: {name?: string} | string; status?: string; notes?: string; applicantId?: string; jobApplicationId?: string; agoraChannelName?: string; agoraToken?: string}>).map((interview) => ({
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
        date: interview.scheduledTime ? new Date(interview.scheduledTime).toLocaleDateString('ar-SA') : '',
        time: interview.scheduledTime ? new Date(interview.scheduledTime).toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '',
        duration: interview.duration ? `${interview.duration} ${t('hr.interviews.minutes')}` : '',
        location: interview.location || t('hr.interviews.notSpecified'),
        interviewer: typeof interview.scheduledBy === 'object' ? (interview.scheduledBy?.name || t('hr.interviews.notSpecified')) : (interview.scheduledBy || t('hr.interviews.notSpecified')),
        status: interview.status === 'SCHEDULED' ? 'مجدولة' : 
                interview.status === 'COMPLETED' ? 'مكتملة' : 
                interview.status === 'CANCELLED' ? 'ملغية' : 'مؤجلة',
        notes: interview.notes || '',
        priority: 'متوسطة',
        applicantId: interview.applicantId,
        jobApplicationId: interview.jobApplicationId,
        scheduledBy: typeof interview.scheduledBy === 'object' ? (interview.scheduledBy?.name || t('hr.interviews.notSpecified')) : (interview.scheduledBy || t('hr.interviews.notSpecified')),
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
    console.log('=== scheduleInterview function called ===');
    console.log('Current form data:', newInterview);
    console.log('Available applications:', availableApplications.length);
    console.log('Available applicants:', availableApplicants.length);
    
    // Add immediate feedback
    toast.info(t('hr.interviews.processing'));
    
    try {
      // Basic validation
      console.log('Starting validation...');
      
      if (!newInterview.applicantId) {
        console.log('Validation failed: No applicant selected');
        toast.error('يرجى اختيار المرشح');
        return;
      }
      if (!newInterview.jobApplicationId) {
        console.log('Validation failed: No job application selected');
        toast.error('يرجى اختيار طلب الوظيفة');
        return;
      }
      if (!newInterview.scheduledTime) {
        console.log('Validation failed: No scheduled time');
        toast.error('يرجى تحديد موعد المقابلة');
        return;
      }
      if (!newInterview.duration || newInterview.duration < 15) {
        console.log('Validation failed: Invalid duration', newInterview.duration);
        toast.error('يرجى إدخال مدة المقابلة (15 دقيقة على الأقل)');
        return;
      }
      if (!newInterview.interviewType) {
        console.log('Validation failed: No interview type selected');
        toast.error('يرجى اختيار نوع المقابلة');
        return;
      }
      
      console.log('Basic validation passed');
      
      // Check if scheduled time is in the future
      console.log('Checking scheduled time...');
      const scheduledDate = new Date(newInterview.scheduledTime);
      const now = new Date();
      console.log('Scheduled date:', scheduledDate);
      console.log('Current date:', now);
      
      if (scheduledDate <= now) {
        console.log('Validation failed: Scheduled time is in the past');
        toast.error('يرجى اختيار موعد في المستقبل');
        return;
      }
      
      console.log('Time validation passed');
      
      // Validate that the selected application exists
      console.log('Validating selected application...');
      const selectedApplication = availableApplications.find(app => app.id === newInterview.jobApplicationId);
      if (!selectedApplication) {
        console.log('Validation failed: selected application not found', newInterview.jobApplicationId);
        console.log('Available applications:', availableApplications.map(app => ({ id: app.id, title: app.jobTitle })));
        toast.error('طلب الوظيفة المحدد غير موجود');
        return;
      }
      console.log('Selected application found:', selectedApplication);
      
      // Validate that the selected applicant exists
      console.log('Validating selected applicant...');
      const selectedApplicant = availableApplicants.find(applicant => applicant.id === newInterview.applicantId);
      if (!selectedApplicant) {
        console.log('Validation failed: selected applicant not found', newInterview.applicantId);
        console.log('Available applicants:', availableApplicants.map(applicant => ({ id: applicant.id, name: applicant.user?.name })));
        toast.error('المرشح المحدد غير موجود');
        return;
      }
      console.log('Selected applicant found:', selectedApplicant);
      
      console.log('All validations passed, proceeding with API call');
      
      const title = newInterview.interviewType === 'PHONE' 
        ? t('hr.interviews.phoneInterviewTitle')
        : newInterview.interviewType === 'VIDEO' 
        ? t('hr.interviews.videoInterviewTitle')
        : t('hr.interviews.inPersonInterviewTitle');
      
      // Check if this is a VIDEO interview with meeting type
      const isVideoInterview = newInterview.interviewType === 'VIDEO';
      
      // If VIDEO interview, use schedule endpoint with meeting type
      if (isVideoInterview) {
        // Get applicant and interviewer info
        const selectedApplication = availableApplications.find(app => app.id === newInterview.jobApplicationId);
        const selectedApplicant = availableApplicants.find(applicant => applicant.id === newInterview.applicantId);
        
        if (!selectedApplication || !selectedApplicant) {
          toast.error('لا يمكن العثور على معلومات المرشح أو طلب الوظيفة');
          return;
        }

        const candidateName = selectedApplicant.user?.name || t('hr.interviews.undefinedApplicant');
        const candidateEmail = selectedApplicant.user?.email || '';
        // Get interviewer info from current user
        const interviewerName = user?.name || t('hr.interviews.interviewer');
        const interviewerEmail = user?.email || '';

        if (!candidateEmail) {
          toast.error(t('hr.interviews.candidateEmailRequired'));
          return;
        }
        
        if (!interviewerEmail) {
          toast.error(t('hr.interviews.interviewerEmailRequired'));
          return;
        }

        const scheduleData = {
          title: title,
          candidateName: candidateName,
          candidateEmail: candidateEmail,
          interviewerName: interviewerName,
          interviewerEmail: interviewerEmail,
          scheduledDate: newInterview.scheduledTime,
          duration: newInterview.duration || 60,
          meetingType: newInterview.meetingType,
          notes: newInterview.notes || undefined
        };

        console.log('=== CALLING SCHEDULE API ===');
        console.log('Schedule data:', JSON.stringify(scheduleData, null, 2));

        toast.loading(t('hr.interviews.creating'), { id: 'schedule-interview' });

        try {
          const result = await hrApiService.scheduleInterviewSchedule(scheduleData);
          console.log('=== SCHEDULE API SUCCESS ===');
          console.log('Interview schedule created:', result);
          
          toast.dismiss('schedule-interview');
          toast.success(t('hr.interviews.createdSuccessfully'));
          setIsScheduleDialogOpen(false);
          setNewInterview({
            applicantId: "",
            jobApplicationId: "",
            scheduledTime: "",
            duration: 60,
            location: "",
            interviewType: "PHONE",
            meetingType: "ZOOM", // Changed from GOOGLE_MEET to ZOOM
            notes: ""
          });
          setFormErrors({});
          fetchInterviews();
          return;
        } catch (scheduleError: unknown) {
          const scheduleApiError = scheduleError as {message?: string; response?: {data?: {message?: string}; status?: number}};
          console.error('Schedule API Error:', scheduleApiError);
          toast.dismiss('schedule-interview');
          toast.error(scheduleApiError.response?.data?.message || t('hr.interviews.scheduleError'));
          return;
        }
      }

      // Regular interview creation (non-VIDEO or VIDEO without meeting platform)
      const interviewData = {
        applicationId: newInterview.jobApplicationId.trim(),
        title: title,
        type: newInterview.interviewType as 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'TECHNICAL' | 'HR' | 'FINAL',
        scheduledAt: newInterview.scheduledTime,
        duration: newInterview.duration || 60,
        ...(newInterview.location && { location: newInterview.location.trim() }),
        ...(newInterview.notes && { notes: newInterview.notes.trim() })
      };
      
      console.log('=== PREPARING TO SEND DATA ===');
      console.log('Interview data to send:', interviewData);
      
      // Additional validation - check if applicationId is valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(interviewData.applicationId)) {
        console.error('Invalid UUID format for applicationId:', interviewData.applicationId);
        toast.error('معرف طلب الوظيفة غير صحيح');
        return;
      }
      
      // Check if the application exists in our local data
      const localApplication = availableApplications.find(app => app.id === interviewData.applicationId);
      if (!localApplication) {
        console.log('Application not found in local data:', interviewData.applicationId);
        toast.error('طلب الوظيفة المحدد غير موجود في البيانات المحلية');
        return;
      }
      
      // Show loading state
      toast.loading(t('hr.interviews.creating'), { id: 'schedule-interview' });
      
      console.log('=== CALLING API ===');
      console.log('Final data being sent:', JSON.stringify(interviewData, null, 2));
      
      try {
        const result = await hrApiService.scheduleInterview(interviewData);
        
        console.log('=== API SUCCESS ===');
        console.log('Interview created successfully:', result);
        
        toast.dismiss('schedule-interview');
        toast.success(t('hr.interviews.createdSuccessfully'));
        setIsScheduleDialogOpen(false);
        setNewInterview({
          applicantId: "",
          jobApplicationId: "",
          scheduledTime: "",
          duration: 60,
          location: "",
          interviewType: "PHONE",
          meetingType: "ZOOM", // Changed from GOOGLE_MEET to ZOOM
          notes: ""
        });
        setFormErrors({});
        fetchInterviews();
      } catch (apiError) {
        console.log('=== API ERROR ===');
        console.error('API Error details:', apiError);
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (error: unknown) {
      const apiError = error as {message?: string; response?: {data?: {message?: string}; status?: number; statusText?: string}; config?: unknown};
      console.error('=== FINAL ERROR HANDLING ===');
      console.error('Error scheduling interview:', error);
      console.error('Error details:', {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        config: apiError.config
      });
      
      // Dismiss loading toast
      toast.dismiss('schedule-interview');
      
      // Handle specific error messages
      let errorMessage = t('hr.interviews.scheduleError');
      
      if (apiError.response?.data?.message) {
        errorMessage = `${t('common.error')}: ${apiError.response.data.message}`;
      } else if (apiError.response?.status === 400) {
        errorMessage = t('hr.interviews.validationError');
      } else if (apiError.response?.status === 404) {
        errorMessage = t('hr.interviews.applicationIdRequired');
      } else if (apiError.response?.status === 403) {
        errorMessage = t('errors.authError');
      } else if (apiError.response?.status === 500) {
        errorMessage = t('errors.failedToSave');
      } else if (apiError.message) {
        errorMessage = `${t('hr.interviews.connectionFailed')} - ${apiError.message}`;
      }
      
      console.log('Showing error message:', errorMessage);
      toast.error(errorMessage);
      
      // Additional debugging info
      console.log('=== DEBUGGING INFO ===');
      console.log('Selected application ID:', newInterview.jobApplicationId);
      console.log('Available applications count:', availableApplications.length);
      console.log('Available applications IDs:', availableApplications.map(app => app.id));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch applications and applicants when dialog opens
  useEffect(() => {
    if (isScheduleDialogOpen) {
      fetchAvailableApplications();
      fetchAvailableApplicants();
    }
  }, [isScheduleDialogOpen]);

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
                  <Label htmlFor="applicantId">
                    {t('hr.interviews.applicantId')} <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={newInterview.applicantId} 
                    onValueChange={(value) => handleInputChange('applicantId', value)}
                  >
                    <SelectTrigger className={formErrors.applicantId ? 'border-red-500' : ''}>
                      <SelectValue placeholder={loadingApplicants ? t('hr.interviews.loadingApplicants') : t('hr.interviews.selectApplicant')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableApplicants.map((applicant) => (
                        <SelectItem key={applicant.id} value={applicant.id}>
                          {applicant.user?.name || t('hr.interviews.undefinedApplicant')} | {applicant.user?.email || t('hr.interviews.notSpecified')} | {applicant.phone || t('hr.interviews.notSpecified')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.applicantId && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.applicantId}</p>
                  )}
                  {availableApplicants.length === 0 && !loadingApplicants && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('hr.interviews.noApplicantsAvailable')}
                    </p>
                  )}
                  {loadingApplicants && (
                    <p className="text-sm text-muted-foreground mt-1">{t('hr.interviews.loadingApplicants')}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="jobApplicationId">
                    {t('hr.interviews.jobApplication')} <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={newInterview.jobApplicationId} 
                    onValueChange={(value) => handleInputChange('jobApplicationId', value)}
                  >
                    <SelectTrigger className={formErrors.jobApplicationId ? 'border-red-500' : ''}>
                      <SelectValue placeholder={loadingApplications ? t('hr.interviews.loadingApplications') : t('hr.interviews.selectJobApplication')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableApplications.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.jobTitle || t('hr.interviews.undefinedJob')} | {app.applicant?.user?.name || t('hr.interviews.notSpecified')} | {app.clientName || t('hr.interviews.notSpecified')} | {app.status || t('hr.interviews.undefinedStatus')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.jobApplicationId && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.jobApplicationId}</p>
                  )}
                  {availableApplications.length === 0 && !loadingApplications && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('hr.interviews.noApplicationsAvailable')}
                    </p>
                  )}
                  {loadingApplications && (
                    <p className="text-sm text-muted-foreground mt-1">{t('hr.interviews.loadingApplications')}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="scheduledTime">
                    {t('hr.interviews.scheduledTime')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={newInterview.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    className={formErrors.scheduledTime ? 'border-red-500' : ''}
                    required
                  />
                  {formErrors.scheduledTime && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.scheduledTime}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="duration">
                    {t('hr.interviews.interviewDuration')} ({t('hr.interviews.minutes')}) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newInterview.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    placeholder="60"
                    min="15"
                    max="480"
                    className={formErrors.duration ? 'border-red-500' : ''}
                    required
                  />
                  {formErrors.duration && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.duration}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="interviewType">
                    {t('hr.interviews.interviewType')} <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={newInterview.interviewType} 
                    onValueChange={(value) => {
                      handleInputChange('interviewType', value);
                      // Reset meetingType if not VIDEO
                      if (value !== 'VIDEO') {
                        setNewInterview(prev => ({ ...prev, meetingType: 'ZOOM' })); // Changed from GOOGLE_MEET to ZOOM
                      }
                    }}
                  >
                    <SelectTrigger className={formErrors.interviewType ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHONE">{t('hr.interviews.phone')}</SelectItem>
                      <SelectItem value="VIDEO">{t('hr.interviews.video')}</SelectItem>
                      <SelectItem value="IN_PERSON">{t('hr.interviews.inPerson')}</SelectItem>
                      <SelectItem value="TECHNICAL">{t('hr.interviews.technical')}</SelectItem>
                      <SelectItem value="HR">{t('hr.interviews.hr')}</SelectItem>
                      <SelectItem value="FINAL">{t('hr.interviews.final')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.interviewType && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.interviewType}</p>
                  )}
                </div>
                {newInterview.interviewType === 'VIDEO' && (
                  <div>
                    <Label htmlFor="meetingType">
                      {t('hr.interviews.meetingPlatform')} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newInterview.meetingType}
                      onValueChange={(value) => setNewInterview(prev => ({ ...prev, meetingType: value as "GOOGLE_MEET" | "ZOOM" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* <SelectItem value="GOOGLE_MEET">{t('hr.interviews.googleMeet')}</SelectItem> */}
                        <SelectItem value="ZOOM">{t('hr.interviews.zoom')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('hr.interviews.meetingPlatformDescription')}
                    </p>
                  </div>
                )}
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
                
                {/* Required fields note */}
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <p className="font-medium mb-1">{t('hr.interviews.requiredFields')}</p>
                  <ul className="text-xs space-y-1">
                    <li>• {t('hr.interviews.requiredApplicantId')}</li>
                    <li>• {t('hr.interviews.requiredJobApplicationId')}</li>
                    <li>• {t('hr.interviews.requiredScheduledTime')}</li>
                    <li>• {t('hr.interviews.requiredDuration')}</li>
                    <li>• {t('hr.interviews.requiredInterviewType')}</li>
                  </ul>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={scheduleInterview} 
                    className="flex-1"
                    type="button"
                  >
                    {t('hr.interviews.scheduleInterview')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewInterview({
                        applicantId: "",
                        jobApplicationId: "",
                        scheduledTime: "",
                        duration: 60,
                        location: "",
                        interviewType: "PHONE",
                        meetingType: "ZOOM", // Changed from GOOGLE_MEET to ZOOM
                        notes: ""
                      });
                      setFormErrors({});
                    }} 
                    className="flex-1"
                  >
                    {t('hr.interviews.reset')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsScheduleDialogOpen(false)} 
                    className="flex-1"
                  >
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
                          <span>{t('hr.interviews.loadingInterviews')}</span>
                        </div>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ) : filteredInterviews.length === 0 ? (
                    <ResponsiveTableRow>
                      <ResponsiveTableCell className="p-8 text-center text-muted-foreground" colSpan={9}>
                        {searchTerm || statusFilter !== 'all' ? t('hr.interviews.noInterviewsMatch') : t('hr.interviews.noInterviewsScheduled')}
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
              <DialogTitle>{t('hr.interviews.interviewDetails')}</DialogTitle>
              <DialogDescription>
                {t('hr.interviews.viewInterviewDetails')}
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
                    <Label>{t('hr.interviews.job')}</Label>
                    <p className="text-sm font-medium">{selectedInterview.position}</p>
                  </div>
                  <div>
                    <Label>{t('hr.interviews.company')}</Label>
                    <p className="text-sm font-medium">{selectedInterview.company}</p>
                  </div>
                  <div>
                    <Label>{t('hr.interviews.interviewType')}</Label>
                    <p className="text-sm font-medium">{selectedInterview.type}</p>
                  </div>
                  <div>
                    <Label>{t('hr.interviews.date')}</Label>
                    <p className="text-sm font-medium">{selectedInterview.date}</p>
                  </div>
                  <div>
                    <Label>{t('hr.interviews.time')}</Label>
                    <p className="text-sm font-medium">{selectedInterview.time}</p>
                  </div>
                  <div>
                    <Label>{t('hr.interviews.duration')}</Label>
                    <p className="text-sm font-medium">{selectedInterview.duration}</p>
                  </div>
                  <div>
                    <Label>{t('hr.interviews.locationMethod')}</Label>
                    <p className="text-sm font-medium">{selectedInterview.location}</p>
                  </div>
                  <div>
                    <Label>{t('hr.interviews.interviewer')}</Label>
                    <p className="text-sm font-medium">{selectedInterview.interviewer}</p>
                  </div>
                  <div>
                    <Label>{t('hr.interviews.status')}</Label>
                    <Badge className={getStatusColor(selectedInterview.status)}>
                      {selectedInterview.status}
                    </Badge>
                  </div>
                </div>
                {selectedInterview.notes && (
                  <div>
                    <Label>{t('hr.interviews.notes')}</Label>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedInterview.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  {selectedInterview.status === t('hr.interviews.scheduled') && (
                    <>
                      <Button onClick={() => sendReminder(selectedInterview.id, 'email')} className="gap-2">
                        <Send className="h-4 w-4" />
                        {t('hr.interviews.sendEmailReminder')}
                      </Button>
                      <Button onClick={() => sendReminder(selectedInterview.id, 'whatsapp')} variant="outline" className="gap-2">
                        <Phone className="h-4 w-4" />
                        {t('hr.interviews.sendWhatsappReminder')}
                      </Button>
                    </>
                  )}
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="mr-auto">
                    {t('hr.interviews.close')}
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
                  <Label>{t('hr.interviews.candidateName')}</Label>
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
                    {t('hr.interviews.cancel')}
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