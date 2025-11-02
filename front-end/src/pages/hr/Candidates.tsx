import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Star,
  Send,
  MessageSquare,
  FileText,
  UserCheck,
  Video,
  VideoOff,
  Plus,
  DollarSign,
  Gift
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { hrApiService, type Applicant as ApiApplicant, type Job, type Interview } from "@/services/hrApi";
import { type Client } from "@/services/clientApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveTable, ResponsiveTableHeader, ResponsiveTableBody, ResponsiveTableRow, ResponsiveTableHead, ResponsiveTableCell } from "@/components/ui/responsive-table";

interface Applicant {
  id: string;
  userId?: string; // Add userId field for API calls
  applicationId?: string; // Add applicationId for updating job application status
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  location: string;
  status: string;
  appliedDate: string;
  rating: number;
  skills: string[];
  avatar: string;
  resumeUrl: string;
  interviewScheduled: boolean;
  interviewDate: string | null;
  jobId?: string;
  jobTitle?: string;
  clientId?: string;
}

const HRCandidates = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedApplicantForInterview, setSelectedApplicantForInterview] = useState<Applicant | null>(null);
  const [isRecommendDialogOpen, setIsRecommendDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [recommendationNote, setRecommendationNote] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);

  useEffect(() => {
    fetchApplicants();
    fetchJobs();
    fetchClients();
  }, []);

  const mockCandidates: Applicant[] = [
    {
      id: "applicant-1",
      userId: "5814696d-4113-4af5-808a-ffae0c61a14b", // This is the userId that should be used for API calls
      applicationId: "app-1", // Mock application ID
      name: "أحمد محمد",
      email: "ahmed@example.com",
      phone: "+966501234567",
      position: "مطور React أول",
      experience: "5 سنوات",
      location: "الرياض",
      status: "قيد المراجعة",
      appliedDate: "2024-01-15",
      rating: 4.5,
      skills: ["React", "TypeScript", "Node.js"],
      avatar: "/avatars/ahmed.jpg",
      resumeUrl: "http://localhost:3000/uploads/resumes/ahmed_cv.pdf",
      interviewScheduled: false,
      interviewDate: null,
      jobId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      jobTitle: "مطور React أول"
    },
    {
      id: "applicant-2",
      userId: "f9e8d7c6-b5a4-3210-9876-543210fedcba", // This is the userId that should be used for API calls
      applicationId: "app-2", // Mock application ID
      name: "فاطمة علي",
      email: "fatima@example.com",
      phone: "+966507654321",
      position: "محاسب أول",
      experience: "3 سنوات",
      location: "جدة",
      status: "مقبول",
      appliedDate: "2024-01-10",
      rating: 4.2,
      skills: ["المحاسبة", "Excel", "SAP"],
      avatar: "/avatars/fatima.jpg",
      resumeUrl: "http://localhost:3000/uploads/resumes/fatima_cv.pdf",
      interviewScheduled: true,
      interviewDate: "2024-01-20 10:00",
      jobId: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      jobTitle: "محاسب أول"
    }
  ];

  const fetchApplicants = async () => {
    try {
      const response = await hrApiService.getApplicants();
      const apiApplicants = response.data || [];

      // Fetch all interviews from main Interviews table (المقابلات المحفوظة في الداتابيز)
      let allInterviews: any[] = [];
      try {
        const interviewsResponse = await hrApiService.getInterviews();
        allInterviews = interviewsResponse?.data || [];
        console.log('Fetched interviews from main table:', allInterviews.length);
      } catch (error) {
        console.error('Error fetching interviews from main table:', error);
      }

      // Fetch all interview schedules to check if candidates have scheduled interviews
      let interviewSchedules: any[] = [];
      try {
        const schedulesResponse = await hrApiService.getAllInterviewSchedules();
        interviewSchedules = schedulesResponse || [];
      } catch (error) {
        console.error('Error fetching interview schedules:', error);
      }

      const transformedApplicants: Applicant[] = apiApplicants.flatMap((apiApplicant: ApiApplicant) => {
        const apps = apiApplicant.applications || [];
        // إذا لم توجد طلبات، نرجّع صف واحد عام
        if (apps.length === 0) {
          return [{
            id: apiApplicant.id,
            userId: apiApplicant.userId,
            applicationId: undefined,
            name: apiApplicant.user?.name,
            email: apiApplicant.user?.email,
            phone: apiApplicant.phone || 'غير محدد',
            position: 'غير محدد',
            experience: apiApplicant.experience || 'غير محدد',
            location: apiApplicant.location || 'غير محدد',
            status: 'PENDING',
            appliedDate: new Date(apiApplicant.createdAt).toLocaleDateString('ar-SA'),
            rating: apiApplicant.rating || 0,
            skills: apiApplicant.skills ? apiApplicant.skills.split(',') : [],
            avatar: apiApplicant.avatar || '',
            resumeUrl: apiApplicant.resumeUrl || '',
            interviewScheduled: (apiApplicant.interviews && apiApplicant.interviews.length > 0) || false,
            interviewDate: apiApplicant.interviews?.[0]?.scheduledAt ? new Date(apiApplicant.interviews[0].scheduledAt).toLocaleString('ar-SA') : null,
            jobId: undefined,
            jobTitle: undefined,
          }];
        }

        // خلاف ذلك: صف لكل طلب
        return apps.map((app: any, idx: number) => {
          const id = `${apiApplicant.id}-${app.id || idx}`;
          
          // البحث في جدول Interviews الرئيسي أولاً (المقابلات المحفوظة في الداتابيز)
          const mainTableInterview = allInterviews.find(
            (iv: any) => iv.applicationId === app.id && (iv.status === 'SCHEDULED' || iv.status === 'CONFIRMED')
          );

          // جدولة المقابلة الخاصة بهذا الطلب فقط (من جدول الجدولة)
          const scheduledInterview = interviewSchedules.find(
            (schedule: any) =>
              schedule.candidateEmail === apiApplicant.user?.email &&
              schedule.applicationId === app.id &&
              schedule.status === 'SCHEDULED'
          );

          // المقابلات المرتبطة مباشرة بالمتقدم (من بيانات API)
          const relatedInterview = (apiApplicant.interviews || []).find(
            (iv: any) => iv.applicationId === app.id
          );

          // استخدام المقابلة من الجدول الرئيسي أولاً (المحفوظة في الداتابيز)، ثم الجدولة، ثم المرتبطة بالمتقدم
          const interviewToUse = mainTableInterview || scheduledInterview || relatedInterview;

          return {
            id,
            userId: apiApplicant.userId,
            applicationId: app.id,
            name: apiApplicant.user?.name,
            email: apiApplicant.user?.email,
            phone: apiApplicant.phone || 'غير محدد',
            position: app.job?.title || 'غير محدد',
            experience: apiApplicant.experience || 'غير محدد',
            location: apiApplicant.location || 'غير محدد',
            status: app.status || 'PENDING',
            appliedDate: new Date(app.createdAt || apiApplicant.createdAt).toLocaleDateString('ar-SA'),
            rating: apiApplicant.rating || 0,
            skills: apiApplicant.skills ? apiApplicant.skills.split(',') : [],
            avatar: apiApplicant.avatar || '',
            resumeUrl: apiApplicant.resumeUrl || '',
            interviewScheduled: !!interviewToUse,
            interviewDate: mainTableInterview
              ? new Date(mainTableInterview.scheduledAt).toLocaleString('ar-SA')
              : (scheduledInterview
                  ? new Date(scheduledInterview.scheduledDate).toLocaleString('ar-SA')
                  : (relatedInterview?.scheduledAt ? new Date(relatedInterview.scheduledAt).toLocaleString('ar-SA') : null)),
            jobId: app.jobId,
            jobTitle: app.job?.title,
            clientId: app.job?.clientId,
          } as Applicant;
        });
      });

      setApplicants(transformedApplicants);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setApplicants(mockCandidates);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await hrApiService.getJobs();
      setJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      const mockJobs = [
        { 
          id: "1", 
          title: "مطور React أول", 
          description: "تطوير تطبيقات React",
          requirements: "خبرة في React",
          location: "الرياض", 
          salary: "15000-20000", 
          type: "FULL_TIME",
          status: "OPEN" as const,
          clientId: "1",
          client: { id: "1", name: "شركة التقنية" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: "2", 
          title: "محاسب أول", 
          description: "إدارة الحسابات",
          requirements: "خبرة في المحاسبة",
          location: "جدة", 
          salary: "8000-12000", 
          type: "FULL_TIME",
          status: "OPEN" as const,
          clientId: "2",
          client: { id: "2", name: "شركة المال" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setJobs(mockJobs);
    }
  };

  const fetchClients = async () => {
    try {
      console.log('=== FETCHING CLIENTS ===');
      const response = await hrApiService.getClients();
      console.log('Clients response:', response);
      const clientsData = response.data || [];
      setClients(clientsData);
      console.log('Clients set:', clientsData.length, 'clients');
      
      if (clientsData.length === 0) {
        console.warn('No clients found in API response');
        toast({
          title: "تحذير",
          description: "لم يتم العثور على عملاء. سيتم استخدام بيانات تجريبية.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      console.log('Using mock clients as fallback');
      const mockClients: Client[] = [
        { 
          id: "1", 
          name: "شركة التقنية", 
          companyName: "شركة التقنية المتقدمة",
          status: "SIGNED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { 
          id: "2", 
          name: "شركة المال", 
          companyName: "شركة المال والاستثمار",
          status: "SIGNED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setClients(mockClients);
    }
  };

  const handleViewCandidate = (candidate: Applicant) => {
    // Use userId instead of id for the profile route
    const profileId = candidate.userId || candidate.id;
    // Navigate in the same tab using React Router
    navigate(`/hr/candidates/${profileId}`);
  };

  const handleDownloadResume = async (candidate: Applicant) => {
    if (!candidate.resumeUrl) {
      toast({
        title: "خطأ",
        description: "لا توجد سيرة ذاتية متاحة لهذا المرشح",
        variant: "destructive",
      });
      return;
    }

    try {
      // Handle different URL formats for file access
      let fileUrl = candidate.resumeUrl;
      
      // If it's a relative path, construct the full URL
      if (candidate.resumeUrl.startsWith('/uploads/')) {
        fileUrl = `http://localhost:3000${candidate.resumeUrl}`;
      }
      // If it contains the API prefix, remove it
      else if (candidate.resumeUrl.includes('http://localhost:3000/api/uploads/')) {
        fileUrl = candidate.resumeUrl.replace('http://localhost:3000/api/', 'http://localhost:3000/');
      }
      
      console.log('Attempting to download from URL:', fileUrl);
      
      // Use axios with authentication headers
      const token = localStorage.getItem('access_token');
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidate.name}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "تم التحميل",
        description: `تم تحميل السيرة الذاتية لـ ${candidate.name}`,
      });
    } catch (error) {
      console.error('Error downloading resume:', error);
      
      // More specific error messages
      let errorMessage = "حدث خطأ أثناء تحميل السيرة الذاتية";
      
      if (error.response?.status === 404) {
        errorMessage = "الملف غير موجود على الخادم";
      } else if (error.response?.status === 403) {
        errorMessage = "ليس لديك صلاحية للوصول إلى هذا الملف";
      } else if (error.response?.status === 401) {
        errorMessage = "يرجى تسجيل الدخول مرة أخرى";
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "خطأ في الاتصال بالخادم";
      }
      
      toast({
        title: "خطأ في التحميل",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const updateApplicantStatus = async (applicantId: string, status: string) => {
    try {
      // Find the applicant to get the userId and applicationId
      const applicant = applicants.find(a => a.id === applicantId);
      
      if (!applicant) {
        toast({
          title: "خطأ في التحديث",
          description: "لا يمكن العثور على المرشح",
          variant: "destructive",
        });
        return;
      }
      
      // Map Arabic status to English
      const statusMap: { [key: string]: string } = {
        "مقبول": "HIRED",
        "مرفوض": "REJECTED",
        "قيد المراجعة": "PENDING",
        "مقابلة": "INTERVIEW",
        "عرض": "OFFER"
      };
      
      const englishStatus = statusMap[status] || status;
      
      // إذا كان status هو OFFER وكان هناك applicationId، استخدم updateApplicationStatus
      if (englishStatus === 'OFFER' && applicant.applicationId) {
        await hrApiService.updateApplicationStatus(applicant.applicationId, englishStatus);
      } else if (applicant.userId) {
        // للـ status الأخرى، استخدم updateApplicantStatus
        await hrApiService.updateApplicantStatus(applicant.userId, englishStatus);
      } else {
        throw new Error('لا يمكن العثور على معرف المستخدم أو الطلب');
      }
      
      setApplicants(prev => prev.map(applicant => 
        applicant.id === applicantId 
          ? { ...applicant, status: englishStatus } 
          : applicant
      ));

      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة ${applicant.name} إلى ${status}`,
      });
      
      // إعادة تحميل البيانات
      await fetchApplicants();
    } catch (error) {
      console.error('Error updating applicant status:', error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث حالة المرشح",
        variant: "destructive",
      });
    }
  };

  const recommendToClient = async () => {
    console.log('=== recommendToClient function called ===');
    console.log('Selected applicant:', selectedApplicant);
    console.log('Selected client:', selectedClient);
    console.log('Recommendation note:', recommendationNote);
    console.log('Available clients:', clients.map(c => ({ id: c.id, name: c.name, companyName: c.companyName })));
    
    // Add immediate feedback
    toast({
      title: "جاري المعالجة...",
      description: "جاري إرسال الترشيح...",
    });

    // Validate required fields
    if (!selectedApplicant) {
      console.log('Validation failed: No applicant selected');
      toast({
        title: "خطأ",
        description: "يرجى اختيار المرشح",
        variant: "destructive",
      });
      return;
    }

    if (!selectedClient || selectedClient.trim() === '') {
      console.log('Validation failed: No client selected');
      toast({
        title: "خطأ",
        description: "يرجى اختيار العميل",
        variant: "destructive",
      });
      return;
    }

    // Validate that the selected client exists in the available clients
    const selectedClientData = clients.find(client => client.id === selectedClient);
    if (!selectedClientData) {
      console.log('Validation failed: Selected client not found in available clients');
      console.log('Selected client ID:', selectedClient);
      console.log('Available client IDs:', clients.map(c => c.id));
      toast({
        title: "خطأ",
        description: "العميل المحدد غير موجود في القائمة",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Selected client data:', selectedClientData);

    if (!recommendationNote || recommendationNote.trim() === '') {
      console.log('Validation failed: No recommendation note');
      toast({
        title: "خطأ",
        description: "يرجى كتابة ملاحظة الترشيح",
        variant: "destructive",
      });
      return;
    }

    console.log('All validations passed, proceeding with API call');

    try {
      console.log('Calling hrApiService.recommendApplicant...');
      await hrApiService.recommendApplicant(selectedApplicant.id, selectedClient, recommendationNote);
      
      console.log('Recommendation sent successfully');
      toast({
        title: "تم الإرسال",
        description: `تم ترشيح ${selectedApplicant.name} للعميل بنجاح`,
      });

      // Reset form
      setIsRecommendDialogOpen(false);
      setSelectedApplicant(null);
      setRecommendationNote("");
      setSelectedClient("");
    } catch (error) {
      console.error('Error recommending applicant:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء ترشيح المرشح",
        variant: "destructive",
      });
    }
  };

  const handleScheduleInterview = async () => {
    console.log('=== handleScheduleInterview function called ===');
    console.log('Selected applicant:', selectedApplicantForInterview);
    console.log('Interview date:', interviewDate);
    console.log('Interview time:', interviewTime);
    
    // Add immediate feedback
    toast({
      title: "جاري المعالجة...",
      description: "جاري جدولة المقابلة...",
    });

    // Validate required fields
    if (!selectedApplicantForInterview) {
      console.log('Validation failed: No applicant selected');
      toast({
        title: "خطأ",
        description: "يرجى اختيار المرشح",
        variant: "destructive",
      });
      return;
    }

    if (!interviewDate || interviewDate.trim() === '') {
      console.log('Validation failed: No interview date');
      toast({
        title: "خطأ",
        description: "يرجى اختيار تاريخ المقابلة",
        variant: "destructive",
      });
      return;
    }

    if (!interviewTime || interviewTime.trim() === '') {
      console.log('Validation failed: No interview time');
      toast({
        title: "خطأ",
        description: "يرجى اختيار وقت المقابلة",
        variant: "destructive",
      });
      return;
    }

    // Validate that the scheduled time is in the future
    const scheduledAt = new Date(`${interviewDate}T${interviewTime}`);
    const now = new Date();
    
    if (scheduledAt <= now) {
      console.log('Validation failed: Scheduled time is in the past');
      toast({
        title: "خطأ",
        description: "يرجى اختيار موعد في المستقبل",
        variant: "destructive",
      });
      return;
    }

    console.log('All validations passed, proceeding with API call');
    console.log('Scheduled at:', scheduledAt.toISOString());

    try {
      console.log('Calling hrApiService.scheduleInterviewSchedule...');
      console.log('Selected applicant ID:', selectedApplicantForInterview.id);
      console.log('Selected applicant data:', selectedApplicantForInterview);
      
      // Use the interview schedule endpoint instead of the regular interview endpoint
      // This endpoint works with candidate information directly
      const schedulePayload = {
        title: `مقابلة مع ${selectedApplicantForInterview.name}`,
        candidateName: selectedApplicantForInterview.name,
        candidateEmail: selectedApplicantForInterview.email || 'candidate@example.com',
        interviewerName: 'HR Manager', // You might want to get this from user context
        interviewerEmail: 'hr@company.com', // You might want to get this from user context
        scheduledDate: scheduledAt.toISOString(),
        duration: 60,
        meetingType: 'GOOGLE_MEET',
        notes: `مقابلة مجدولة مع ${selectedApplicantForInterview.name}`,
        applicationId: selectedApplicantForInterview.applicationId,
      } as any;

      // Persist interview in main interviews table (ensures it survives reload)
      try {
        await hrApiService.scheduleInterview({
          applicationId: selectedApplicantForInterview.applicationId || selectedApplicantForInterview.id,
          title: schedulePayload.title,
          description: schedulePayload.notes,
          type: 'VIDEO',
          scheduledAt: scheduledAt.toISOString(),
          duration: schedulePayload.duration,
          notes: schedulePayload.notes,
          interviewerIds: ['current_user_id']
        });
      } catch (e) {
        console.warn('Failed to schedule main interview, fallback to schedule endpoint only:', e);
      }

      // Also store in schedule service for calendar integrations
      await hrApiService.scheduleInterviewSchedule(schedulePayload);

      // Set applicant status to INTERVIEW after successful scheduling
      if (selectedApplicantForInterview.userId) {
        try {
          await hrApiService.updateApplicantStatus(selectedApplicantForInterview.userId, 'INTERVIEW');
        } catch (e) {
          console.warn('Failed to update applicant status to INTERVIEW:', e);
        }
      }

      console.log('Interview scheduled successfully');
      toast({
        title: "تم الجدولة",
        description: `تم جدولة مقابلة مع ${selectedApplicantForInterview.name} بنجاح`,
      });

      // Update local state
      setApplicants(prev => prev.map(applicant => {
        if (applicant.id !== selectedApplicantForInterview.id) return applicant;
        return {
          ...applicant,
          interviewScheduled: true,
          interviewDate: scheduledAt.toLocaleString('ar-SA'),
          status: 'INTERVIEW',
        };
      }));

      // Close dialog and reset form
      setIsScheduleDialogOpen(false);
      setSelectedApplicantForInterview(null);
      setInterviewDate("");
      setInterviewTime("");
    } catch (error) {
      console.error('=== ERROR SCHEDULING INTERVIEW ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle specific error messages
      let errorMessage = 'حدث خطأ أثناء جدولة المقابلة';
      
      if (error.response?.data?.message) {
        errorMessage = `خطأ من الخادم: ${error.response.data.message}`;
      } else if (error.response?.status === 400) {
        errorMessage = 'بيانات غير صحيحة. يرجى التحقق من المعلومات المدخلة';
      } else if (error.response?.status === 404) {
        errorMessage = 'لم يتم العثور على المرشح المحدد أو خدمة الجدولة غير متاحة';
      } else if (error.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحية لجدولة مقابلة';
      } else if (error.response?.status === 500) {
        errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى';
      } else if (error.message) {
        errorMessage = `خطأ في الاتصال: ${error.message}`;
      }
      
      toast({
        title: "خطأ في الجدولة",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleStartVideoCall = (candidate: Applicant) => {
    const mockInterview: Interview = {
      id: `interview_${candidate.id}`,
      applicationId: candidate.id,
      scheduledBy: "current_user_id",
      interviewerIds: ["current_user_id"],
      candidateId: candidate.id,
      title: `مقابلة مع ${candidate.name}`,
      type: 'VIDEO',
      status: 'SCHEDULED',
      scheduledAt: new Date().toISOString(),
      duration: 60,
      reminderSent: false,
      application: {
        job: {
          id: candidate.jobId || "1",
          title: candidate.jobTitle || candidate.position
        },
        applicant: {
          user: {
            id: candidate.id,
            name: candidate.name,
            email: candidate.email
          }
        }
      },
      candidate: {
        user: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email
        }
      },
      scheduledByUser: {
        id: "current_user_id",
        name: "HR Manager",
        role: "HR"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setActiveInterview(mockInterview);
    setIsVideoCallOpen(true);
  };

  const handleEndVideoCall = async () => {
    if (activeInterview) {
      try {
        await hrApiService.updateInterviewStatus(activeInterview.id, 'completed');
        
        toast({
          title: "انتهت المقابلة",
          description: "تم إنهاء المقابلة وتحديث الحالة",
        });
      } catch (error) {
        console.error('Error updating interview status:', error);
      }
    }
    
    setIsVideoCallOpen(false);
    setActiveInterview(null);
  };

  const filteredCandidates = applicants.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    const matchesPosition = positionFilter === "all" || candidate.position === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مقبول":
      case "HIRED":
        return "bg-secondary text-secondary-foreground";
      case "مرفوض":
      case "REJECTED":
        return "bg-destructive text-destructive-foreground";
      case "قيد المراجعة":
      case "PENDING":
        return "bg-warning text-warning-foreground";
      case "مقابلة":
      case "INTERVIEW":
        return "bg-info text-info-foreground";
      case "عرض":
      case "OFFER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "مقبول":
      case "HIRED":
        return <CheckCircle className="h-3 w-3 ml-1" />;
      case "مرفوض":
      case "REJECTED":
        return <XCircle className="h-3 w-3 ml-1" />;
      case "قيد المراجعة":
      case "PENDING":
        return <Clock className="h-3 w-3 ml-1" />;
      case "مقابلة":
      case "INTERVIEW":
        return <Video className="h-3 w-3 ml-1" />;
      case "عرض":
      case "OFFER":
        return <FileText className="h-3 w-3 ml-1" />;
      default:
        return <FileText className="h-3 w-3 ml-1" />;
    }
  };


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  const uniquePositions = Array.from(new Set(applicants.map(a => a.position)));

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="hr">
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('hr.candidates.title')}</h1>
            <p className="text-muted-foreground">{t('hr.candidates.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{filteredCandidates.length} {t('hr.candidates.candidates')}</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('hr.candidates.searchAndFilter')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('hr.candidates.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('hr.candidates.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hr.candidates.allStatuses')}</SelectItem>
                  <SelectItem value="قيد المراجعة">{t('hr.candidates.pending')}</SelectItem>
                  <SelectItem value="مقابلة">{t('hr.candidates.interview')}</SelectItem>
                  <SelectItem value="عرض">{t('hr.candidates.offer') || 'عرض'}</SelectItem>
                  <SelectItem value="مقبول">{t('hr.candidates.accepted')}</SelectItem>
                  <SelectItem value="مرفوض">{t('hr.candidates.rejected')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('hr.candidates.filterByPosition')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hr.candidates.allPositions')}</SelectItem>
                  {uniquePositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('hr.candidates.candidatesList')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead className="text-right">{t('hr.candidates.candidate')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-right">{t('hr.candidates.position')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-right">{t('hr.candidates.experience')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-right">{t('hr.candidates.skills')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-right">{t('hr.candidates.rating')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-right">{t('hr.candidates.appliedDate')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-right">{t('hr.candidates.interview')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-right">{t('hr.candidates.status')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-right">{t('hr.candidates.actions')}</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                {filteredCandidates.length === 0 ? (
                  <ResponsiveTableRow>
                    <ResponsiveTableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">{t('hr.candidates.noCandidates')}</p>
                      </div>
                    </ResponsiveTableCell>
                  </ResponsiveTableRow>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <ResponsiveTableRow key={candidate.id}>
                      <ResponsiveTableCell className="p-2 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                            <AvatarImage src={candidate.avatar} alt={candidate.name} />
                            <AvatarFallback className="text-xs">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs sm:text-sm truncate">{candidate.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground" />
                              <span className="truncate">{candidate.email}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Phone className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground" />
                              {candidate.phone}
                            </div>
                          </div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="p-2 sm:p-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <span className="text-xs sm:text-sm">{candidate.position}</span>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="p-2 sm:p-4">
                        <div className="space-y-1 text-xs sm:text-sm">
                          <div>الخبرة: {candidate.experience}</div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <MapPin className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground" />
                            {candidate.location}
                          </div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="p-2 sm:p-4">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="p-2 sm:p-4">
                        <div className="flex items-center gap-1">
                          {renderStars(candidate.rating)}
                          <span className="text-xs sm:text-sm text-muted-foreground mr-1">
                            {candidate.rating}
                          </span>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="p-2 sm:p-4">
                        <div className="text-xs sm:text-sm">{candidate.appliedDate}</div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="p-2 sm:p-4">
                        {candidate.interviewScheduled ? (
                          <div className="text-xs sm:text-sm">
                            <div className="font-medium text-info">{t('hr.candidates.scheduled')}</div>
                            <div className="text-muted-foreground">{candidate.interviewDate}</div>
                            <div className="flex gap-1 mt-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-5 px-1 sm:h-6 sm:px-2 text-xs"
                                onClick={() => handleStartVideoCall(candidate)}
                              >
                                <Video className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                                {t('hr.candidates.startInterview')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs sm:text-sm">
                            <div className="text-muted-foreground mb-1">{t('hr.candidates.notScheduled')}</div>
                            {candidate.status !== 'PENDING' && candidate.status !== 'قيد الانتظار' ? (
                              <Button size="sm" variant="outline" className="h-5 px-1 sm:h-6 sm:px-2 text-xs opacity-50 cursor-not-allowed" disabled>
                                <Plus className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                                {t('hr.candidates.schedule')}
                              </Button>
                            ) : (
                            <Dialog open={isScheduleDialogOpen && selectedApplicantForInterview?.id === candidate.id} onOpenChange={(open) => {
                              setIsScheduleDialogOpen(open);
                              if (open) {
                                setSelectedApplicantForInterview(candidate);
                              } else {
                                setSelectedApplicantForInterview(null);
                                setInterviewDate("");
                                setInterviewTime("");
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-5 px-1 sm:h-6 sm:px-2 text-xs">
                                  <Plus className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                                  {t('hr.candidates.schedule')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md" dir="rtl">
                                <DialogHeader>
                                  <DialogTitle>{t('hr.candidates.scheduleInterview')}</DialogTitle>
                                  <DialogDescription>
                                    {t('hr.candidates.scheduleInterviewWith')} {candidate.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      {t('hr.candidates.interviewDate')} <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                      type="date"
                                      value={interviewDate}
                                      onChange={(e) => setInterviewDate(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      {t('hr.candidates.interviewTime')} <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                      type="time"
                                      value={interviewTime}
                                      onChange={(e) => setInterviewTime(e.target.value)}
                                      required
                                    />
                                  </div>
                                  
                                  {/* Required fields note */}
                                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                    <span className="text-red-500">*</span> الحقول المطلوبة
                                  </div>
                                  
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => {
                                      setIsScheduleDialogOpen(false);
                                      setInterviewDate("");
                                      setInterviewTime("");
                                    }}>
                                      {t('hr.candidates.cancel')}
                                    </Button>
                                    <Button onClick={handleScheduleInterview} type="button">
                                      <Calendar className="h-4 w-4 ml-2" />
                                      {t('hr.candidates.scheduleInterview')}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            )}
                          </div>
                        )}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="p-2 sm:p-4">
                        <Badge className={getStatusColor(candidate.status) + " text-xs"}>
                          {getStatusIcon(candidate.status)}
                          <span className="mr-1">{candidate.status}</span>
                        </Badge>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell className="p-2 sm:p-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0" 
                            title={t('hr.candidates.viewDetails')}
                            onClick={() => handleViewCandidate(candidate)}
                          >
                            <Eye className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0" 
                            title={t('hr.candidates.downloadResume')}
                            onClick={() => handleDownloadResume(candidate)}
                          >
                            <Download className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-secondary" 
                            title={t('hr.candidates.acceptCandidate')}
                            onClick={() => updateApplicantStatus(candidate.id, "مقبول")}
                          >
                            <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-destructive" 
                            title={t('hr.candidates.rejectCandidate')}
                            onClick={() => updateApplicantStatus(candidate.id, "مرفوض")}
                          >
                            <XCircle className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-green-600" 
                            title={t('hr.candidates.offer') || 'تحويل إلى عرض'}
                            onClick={() => updateApplicantStatus(candidate.id, "عرض")}
                          >
                            <Gift className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Dialog open={isRecommendDialogOpen && selectedApplicant?.id === candidate.id} onOpenChange={(open) => {
                            setIsRecommendDialogOpen(open);
                            if (open) {
                              setSelectedApplicant(candidate);
                            } else {
                              setSelectedApplicant(null);
                              setRecommendationNote("");
                              setSelectedClient("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-primary" 
                                title={t('hr.candidates.recommendToClient')}
                              >
                                <Send className="h-2 w-2 sm:h-3 sm:w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md" dir="rtl">
                              <DialogHeader>
                                <DialogTitle>{t('hr.candidates.recommendCandidateToClient')}</DialogTitle>
                                <DialogDescription>
                                  {t('hr.candidates.recommendCandidateTo')} {candidate.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">
                                    {t('hr.candidates.selectClient')} <span className="text-red-500">*</span>
                                  </label>
                                  <Select value={selectedClient} onValueChange={setSelectedClient} required>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('hr.candidates.selectClient')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                          {client.name} - {client.companyName || 'غير محدد'}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">
                                    {t('hr.candidates.recommendationNote')} <span className="text-red-500">*</span>
                                  </label>
                                  <Textarea
                                    placeholder={t('hr.candidates.recommendationPlaceholder')}
                                    value={recommendationNote}
                                    onChange={(e) => setRecommendationNote(e.target.value)}
                                    rows={4}
                                    required
                                  />
                                </div>
                                
                                {/* Required fields note */}
                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                  <span className="text-red-500">*</span> الحقول المطلوبة
                                </div>
                                
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={() => {
                                    setIsRecommendDialogOpen(false);
                                    setSelectedClient("");
                                    setRecommendationNote("");
                                  }}>
                                    {t('hr.candidates.cancel')}
                                  </Button>
                                  <Button onClick={recommendToClient} type="button">
                                    <Send className="h-4 w-4 ml-2" />
                                    {t('hr.candidates.sendRecommendation')}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ))
                )}
              </ResponsiveTableBody>
            </ResponsiveTable>
          </CardContent>
        </Card>

        {isVideoCallOpen && activeInterview && (
          <Dialog open={isVideoCallOpen} onOpenChange={setIsVideoCallOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh]" dir="rtl">
              <DialogHeader>
                <DialogTitle>{t('hr.candidates.videoInterview')}</DialogTitle>
                <DialogDescription>
                  {t('hr.candidates.interviewWith')} {applicants.find(a => a.id === activeInterview.application?.applicant?.user?.id)?.name}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </MainLayout>
  );
};

export default HRCandidates;