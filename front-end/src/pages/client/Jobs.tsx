import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Briefcase,
  Building,
  GraduationCap,
  Star
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'entry' | 'mid' | 'senior' | 'executive';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  status: 'draft' | 'active' | 'paused' | 'closed' | 'filled';
  postedDate: string;
  deadline: string;
  applicants: number;
  views: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  skills: string[];
  experience: string;
  education: string;
}

const ClientJobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Mock data for jobs
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1",
      title: "مطور برمجيات أول",
      department: "تقنية المعلومات",
      location: "الرياض، السعودية",
      type: "full-time",
      level: "senior",
      salary: {
        min: 12000,
        max: 18000,
        currency: "SAR"
      },
      description: "نبحث عن مطور برمجيات أول للانضمام إلى فريقنا التقني المتميز. المرشح المثالي يجب أن يكون لديه خبرة واسعة في تطوير التطبيقات وإدارة المشاريع التقنية.",
      requirements: [
        "بكالوريوس في علوم الحاسوب أو مجال ذي صلة",
        "خبرة لا تقل عن 5 سنوات في تطوير البرمجيات",
        "إتقان JavaScript, React, Node.js",
        "خبرة في قواعد البيانات SQL و NoSQL",
        "مهارات قيادية وإدارة فريق"
      ],
      benefits: [
        "راتب تنافسي",
        "تأمين صحي شامل",
        "إجازة سنوية مدفوعة",
        "فرص التطوير المهني",
        "بيئة عمل مرنة"
      ],
      status: "active",
      postedDate: "2024-01-15T00:00:00Z",
      deadline: "2024-02-15T00:00:00Z",
      applicants: 45,
      views: 320,
      priority: "high",
      skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
      experience: "5+ سنوات",
      education: "بكالوريوس"
    },
    {
      id: "2",
      title: "مصمم UI/UX",
      department: "التصميم",
      location: "جدة، السعودية",
      type: "full-time",
      level: "mid",
      salary: {
        min: 8000,
        max: 12000,
        currency: "SAR"
      },
      description: "نبحث عن مصمم UI/UX مبدع للعمل على تصميم واجهات المستخدم وتحسين تجربة المستخدم لمنتجاتنا الرقمية.",
      requirements: [
        "بكالوريوس في التصميم أو مجال ذي صلة",
        "خبرة 3-5 سنوات في تصميم UI/UX",
        "إتقان Figma, Adobe XD, Sketch",
        "فهم مبادئ تصميم المواقع المتجاوبة",
        "مهارات تواصل ممتازة"
      ],
      benefits: [
        "راتب تنافسي",
        "تأمين صحي",
        "إجازة مرنة",
        "دورات تدريبية",
        "أدوات تصميم حديثة"
      ],
      status: "active",
      postedDate: "2024-01-20T00:00:00Z",
      deadline: "2024-02-20T00:00:00Z",
      applicants: 28,
      views: 185,
      priority: "medium",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Wireframing"],
      experience: "3-5 سنوات",
      education: "بكالوريوس"
    },
    {
      id: "3",
      title: "محلل بيانات",
      department: "التحليل والبيانات",
      location: "الدمام، السعودية",
      type: "full-time",
      level: "mid",
      salary: {
        min: 9000,
        max: 14000,
        currency: "SAR"
      },
      description: "نبحث عن محلل بيانات متمرس للانضمام إلى فريق التحليل لدينا وتحليل البيانات واستخراج الرؤى المفيدة.",
      requirements: [
        "بكالوريوس في الإحصاء أو الرياضيات أو علوم البيانات",
        "خبرة 2-4 سنوات في تحليل البيانات",
        "إتقان Python, R, SQL",
        "خبرة في أدوات التصور مثل Tableau أو Power BI",
        "مهارات تحليلية قوية"
      ],
      benefits: [
        "راتب تنافسي",
        "تأمين صحي وأسنان",
        "إجازة سنوية",
        "تدريب مستمر",
        "بونص أداء"
      ],
      status: "paused",
      postedDate: "2024-01-10T00:00:00Z",
      deadline: "2024-02-10T00:00:00Z",
      applicants: 32,
      views: 210,
      priority: "medium",
      skills: ["Python", "SQL", "Tableau", "Statistics", "Machine Learning"],
      experience: "2-4 سنوات",
      education: "بكالوريوس"
    },
    {
      id: "4",
      title: "مدير مشروع",
      department: "إدارة المشاريع",
      location: "الرياض، السعودية",
      type: "full-time",
      level: "senior",
      salary: {
        min: 15000,
        max: 22000,
        currency: "SAR"
      },
      description: "نبحث عن مدير مشروع خبير لقيادة وإدارة المشاريع الاستراتيجية وضمان تسليمها في الوقت المحدد وضمن الميزانية.",
      requirements: [
        "بكالوريوس في إدارة الأعمال أو الهندسة",
        "خبرة لا تقل عن 7 سنوات في إدارة المشاريع",
        "شهادة PMP أو ما يعادلها",
        "خبرة في منهجيات Agile و Scrum",
        "مهارات قيادية استثنائية"
      ],
      benefits: [
        "راتب تنافسي جداً",
        "تأمين صحي شامل للعائلة",
        "إجازة مدفوعة مرنة",
        "بونص سنوي",
        "سيارة شركة"
      ],
      status: "active",
      postedDate: "2024-01-25T00:00:00Z",
      deadline: "2024-02-25T00:00:00Z",
      applicants: 18,
      views: 95,
      priority: "urgent",
      skills: ["Project Management", "Agile", "Scrum", "Leadership", "Risk Management"],
      experience: "7+ سنوات",
      education: "بكالوريوس"
    },
    {
      id: "5",
      title: "متدرب تطوير ويب",
      department: "تقنية المعلومات",
      location: "الرياض، السعودية",
      type: "internship",
      level: "entry",
      salary: {
        min: 3000,
        max: 4000,
        currency: "SAR"
      },
      description: "برنامج تدريبي لمدة 6 أشهر للخريجين الجدد المهتمين بتطوير الويب والتطبيقات.",
      requirements: [
        "بكالوريوس حديث في علوم الحاسوب",
        "معرفة أساسية بـ HTML, CSS, JavaScript",
        "شغف بالتعلم والتطوير",
        "مهارات تواصل جيدة",
        "القدرة على العمل ضمن فريق"
      ],
      benefits: [
        "راتب تدريبي",
        "تدريب مكثف",
        "إشراف مباشر",
        "شهادة إتمام",
        "فرصة توظيف دائم"
      ],
      status: "active",
      postedDate: "2024-01-30T00:00:00Z",
      deadline: "2024-03-01T00:00:00Z",
      applicants: 67,
      views: 450,
      priority: "low",
      skills: ["HTML", "CSS", "JavaScript", "Git", "Problem Solving"],
      experience: "خريج جديد",
      education: "بكالوريوس"
    },
    {
      id: "6",
      title: "مختص أمن سيبراني",
      department: "أمن المعلومات",
      location: "الرياض، السعودية",
      type: "full-time",
      level: "senior",
      salary: {
        min: 16000,
        max: 24000,
        currency: "SAR"
      },
      description: "نبحث عن مختص أمن سيبراني لحماية أنظمتنا وبياناتنا من التهديدات السيبرانية وتطوير استراتيجيات الأمن.",
      requirements: [
        "بكالوريوس في أمن المعلومات أو مجال ذي صلة",
        "خبرة لا تقل عن 5 سنوات في الأمن السيبراني",
        "شهادات مهنية مثل CISSP أو CEH",
        "خبرة في أدوات الأمان المختلفة",
        "معرفة بالقوانين والمعايير الأمنية"
      ],
      benefits: [
        "راتب تنافسي ممتاز",
        "تأمين صحي شامل",
        "إجازة مرنة",
        "دورات تدريبية متقدمة",
        "بونص أداء"
      ],
      status: "closed",
      postedDate: "2024-01-05T00:00:00Z",
      deadline: "2024-02-05T00:00:00Z",
      applicants: 23,
      views: 140,
      priority: "high",
      skills: ["Cybersecurity", "Penetration Testing", "SIEM", "Incident Response", "Risk Assessment"],
      experience: "5+ سنوات",
      education: "بكالوريوس"
    }
  ]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || selectedDepartment === "all" || job.department === selectedDepartment;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || job.status === selectedStatus;
    const matchesType = !selectedType || selectedType === "all" || job.type === selectedType;
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesType;
  });

  const departments = [...new Set(jobs.map(job => job.department))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'filled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'paused': return 'متوقف';
      case 'closed': return 'مغلق';
      case 'filled': return 'تم الشغل';
      case 'draft': return 'مسودة';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <AlertCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      case 'filled': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return 'دوام كامل';
      case 'part-time': return 'دوام جزئي';
      case 'contract': return 'عقد';
      case 'internship': return 'تدريب';
      default: return type;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'entry': return 'مبتدئ';
      case 'mid': return 'متوسط';
      case 'senior': return 'أول';
      case 'executive': return 'تنفيذي';
      default: return level;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return priority;
    }
  };

  const addJob = (jobData: Partial<Job>) => {
    const newJob: Job = {
      id: Date.now().toString(),
      title: jobData.title || '',
      department: jobData.department || '',
      location: jobData.location || '',
      type: jobData.type || 'full-time',
      level: jobData.level || 'mid',
      salary: jobData.salary || { min: 0, max: 0, currency: 'SAR' },
      description: jobData.description || '',
      requirements: jobData.requirements || [],
      benefits: jobData.benefits || [],
      status: 'draft',
      postedDate: new Date().toISOString(),
      deadline: jobData.deadline || '',
      applicants: 0,
      views: 0,
      priority: jobData.priority || 'medium',
      skills: jobData.skills || [],
      experience: jobData.experience || '',
      education: jobData.education || ''
    };
    setJobs([...jobs, newJob]);
    setIsAddJobOpen(false);
  };

  const updateJobStatus = (id: string, status: Job['status']) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status } : job));
  };

  const deleteJob = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const stats = {
    total: jobs.length,
    active: jobs.filter(job => job.status === 'active').length,
    paused: jobs.filter(job => job.status === 'paused').length,
    closed: jobs.filter(job => job.status === 'closed').length,
    totalApplicants: jobs.reduce((sum, job) => sum + job.applicants, 0),
    totalViews: jobs.reduce((sum, job) => sum + job.views, 0)
  };

  return (
    <AppLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الوظائف</h1>
            <p className="text-gray-600 mt-1">إنشاء وإدارة الوظائف المتاحة في شركتك</p>
          </div>
          <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة وظيفة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة وظيفة جديدة</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل الوظيفة الجديدة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">عنوان الوظيفة</Label>
                    <Input id="title" placeholder="مثال: مطور برمجيات" />
                  </div>
                  <div>
                    <Label htmlFor="department">القسم</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">الموقع</Label>
                    <Input id="location" placeholder="مثال: الرياض، السعودية" />
                  </div>
                  <div>
                    <Label htmlFor="type">نوع الوظيفة</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">دوام كامل</SelectItem>
                        <SelectItem value="part-time">دوام جزئي</SelectItem>
                        <SelectItem value="contract">عقد</SelectItem>
                        <SelectItem value="internship">تدريب</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="minSalary">الحد الأدنى للراتب</Label>
                    <Input id="minSalary" type="number" placeholder="5000" />
                  </div>
                  <div>
                    <Label htmlFor="maxSalary">الحد الأقصى للراتب</Label>
                    <Input id="maxSalary" type="number" placeholder="10000" />
                  </div>
                  <div>
                    <Label htmlFor="currency">العملة</Label>
                    <Select defaultValue="SAR">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي</SelectItem>
                        <SelectItem value="USD">دولار أمريكي</SelectItem>
                        <SelectItem value="EUR">يورو</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">وصف الوظيفة</Label>
                  <Textarea id="description" placeholder="وصف تفصيلي للوظيفة..." rows={4} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience">سنوات الخبرة</Label>
                    <Input id="experience" placeholder="مثال: 3-5 سنوات" />
                  </div>
                  <div>
                    <Label htmlFor="education">المؤهل التعليمي</Label>
                    <Input id="education" placeholder="مثال: بكالوريوس" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="deadline">آخر موعد للتقديم</Label>
                  <Input id="deadline" type="date" />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddJobOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={() => addJob({})}>
                    إضافة الوظيفة
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الوظائف</p>
                  <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الوظائف النشطة</p>
                  <p className="text-xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الوظائف المتوقفة</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.paused}</p>
                </div>
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الوظائف المغلقة</p>
                  <p className="text-xl font-bold text-red-600">{stats.closed}</p>
                </div>
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المتقدمين</p>
                  <p className="text-xl font-bold text-purple-600">{stats.totalApplicants}</p>
                </div>
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المشاهدات</p>
                  <p className="text-xl font-bold text-indigo-600">{stats.totalViews}</p>
                </div>
                <Eye className="h-6 w-6 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="البحث في الوظائف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الأقسام" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="paused">متوقف</SelectItem>
                  <SelectItem value="closed">مغلق</SelectItem>
                  <SelectItem value="filled">تم الشغل</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="full-time">دوام كامل</SelectItem>
                  <SelectItem value="part-time">دوام جزئي</SelectItem>
                  <SelectItem value="contract">عقد</SelectItem>
                  <SelectItem value="internship">تدريب</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDepartment("all");
                  setSelectedStatus("all");
                  setSelectedType("all");
                }}
              >
                <Filter className="h-4 w-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(job.priority)}>
                      {getPriorityLabel(job.priority)}
                    </Badge>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusIcon(job.status)}
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {getTypeLabel(job.type)}
                  </Badge>
                  <Badge variant="outline">
                    {getLevelLabel(job.level)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{job.applicants} متقدم</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{job.views} مشاهدة</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>ينتهي في: {new Date(job.deadline).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>{job.education}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{job.experience}</span>
                  </div>
                </div>
                
                {job.skills.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {job.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.skills.length - 3} المزيد
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                        <Eye className="h-4 w-4 ml-1" />
                        عرض
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      {selectedJob && (
                        <>
                          <DialogHeader>
                            <DialogTitle>{selectedJob.title}</DialogTitle>
                            <DialogDescription>
                              {selectedJob.department} - {selectedJob.location}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="flex gap-2 flex-wrap">
                              <Badge className={getStatusColor(selectedJob.status)}>
                                {getStatusIcon(selectedJob.status)}
                                {getStatusLabel(selectedJob.status)}
                              </Badge>
                              <Badge className={getPriorityColor(selectedJob.priority)}>
                                {getPriorityLabel(selectedJob.priority)}
                              </Badge>
                              <Badge variant="outline">
                                {getTypeLabel(selectedJob.type)}
                              </Badge>
                              <Badge variant="outline">
                                {getLevelLabel(selectedJob.level)}
                              </Badge>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">وصف الوظيفة</h4>
                              <p className="text-gray-700">{selectedJob.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-2">المتطلبات</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {selectedJob.requirements.map((req, index) => (
                                    <li key={index}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">المزايا</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {selectedJob.benefits.map((benefit, index) => (
                                    <li key={index}>{benefit}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-semibold mb-1">الراتب</h4>
                                <p className="text-lg font-bold text-green-600">
                                  {selectedJob.salary.min.toLocaleString()} - {selectedJob.salary.max.toLocaleString()} {selectedJob.salary.currency}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">الخبرة المطلوبة</h4>
                                <p className="text-gray-700">{selectedJob.experience}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">المؤهل التعليمي</h4>
                                <p className="text-gray-700">{selectedJob.education}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">المهارات المطلوبة</h4>
                              <div className="flex gap-2 flex-wrap">
                                {selectedJob.skills.map(skill => (
                                  <Badge key={skill} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-semibold">تاريخ النشر:</span> {new Date(selectedJob.postedDate).toLocaleDateString('ar-SA')}
                              </div>
                              <div>
                                <span className="font-semibold">آخر موعد للتقديم:</span> {new Date(selectedJob.deadline).toLocaleDateString('ar-SA')}
                              </div>
                              <div>
                                <span className="font-semibold">عدد المتقدمين:</span> {selectedJob.applicants}
                              </div>
                              <div>
                                <span className="font-semibold">عدد المشاهدات:</span> {selectedJob.views}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  
                  {job.status === 'active' && (
                    <Button variant="outline" size="sm" onClick={() => updateJobStatus(job.id, 'paused')}>
                      <AlertCircle className="h-4 w-4 ml-1" />
                      إيقاف
                    </Button>
                  )}
                  
                  {job.status === 'paused' && (
                    <Button variant="outline" size="sm" onClick={() => updateJobStatus(job.id, 'active')}>
                      <CheckCircle className="h-4 w-4 ml-1" />
                      تفعيل
                    </Button>
                  )}
                  
                  <Button variant="destructive" size="sm" onClick={() => deleteJob(job.id)}>
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد وظائف</h3>
              <p className="text-gray-600">لم يتم العثور على وظائف تطابق معايير البحث</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ClientJobs;