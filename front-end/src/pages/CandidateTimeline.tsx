import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Phone, 
  Video,
  Mail,
  Plus
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

interface TimelineEvent {
  id: string;
  type: 'application' | 'screening' | 'interview' | 'test' | 'offer' | 'rejection' | 'note' | 'call' | 'email';
  title: string;
  description: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'scheduled' | 'cancelled';
  assignee?: string;
  documents?: string[];
  score?: number;
  feedback?: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  avatar: string;
  status: 'active' | 'hired' | 'rejected' | 'on-hold';
  stage: 'application' | 'screening' | 'interview' | 'test' | 'offer' | 'final';
  appliedDate: string;
  experience: string;
  location: string;
  timeline: TimelineEvent[];
  overallScore: number;
  notes: string;
}

const CandidateTimeline = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [newEventDialog, setNewEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    type: 'note',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    status: 'completed'
  });

  // Mock data for candidates
  const candidates: Candidate[] = [
    {
      id: "1",
      name: "أحمد محمد علي",
      email: "ahmed.ali@email.com",
      phone: "+966 50 123 4567",
      position: "مطور برمجيات أول",
      department: "التقنية",
      avatar: "/avatars/ahmed.jpg",
      status: "active",
      stage: "interview",
      appliedDate: "2024-01-15",
      experience: "5 سنوات",
      location: "الرياض",
      overallScore: 85,
      notes: "مرشح ممتاز مع خبرة قوية في React و Node.js",
      timeline: [
        {
          id: "1",
          type: "application",
          title: "تقديم الطلب",
          description: "تم تقديم الطلب لوظيفة مطور برمجيات أول",
          date: "2024-01-15",
          time: "09:30",
          status: "completed"
        },
        {
          id: "2",
          type: "screening",
          title: "فحص أولي",
          description: "تم فحص السيرة الذاتية والمؤهلات",
          date: "2024-01-16",
          time: "14:00",
          status: "completed",
          assignee: "سارة أحمد",
          score: 80,
          feedback: "مؤهلات ممتازة تتطابق مع متطلبات الوظيفة"
        },
        {
          id: "3",
          type: "call",
          title: "مكالمة هاتفية",
          description: "مكالمة تعريفية مع المرشح",
          date: "2024-01-18",
          time: "10:00",
          status: "completed",
          assignee: "محمد خالد",
          feedback: "مرشح متحمس ولديه رؤية واضحة"
        },
        {
          id: "4",
          type: "test",
          title: "اختبار تقني",
          description: "اختبار البرمجة والمهارات التقنية",
          date: "2024-01-20",
          time: "15:00",
          status: "completed",
          score: 90,
          feedback: "أداء ممتاز في الاختبار التقني"
        },
        {
          id: "5",
          type: "interview",
          title: "مقابلة مع فريق التطوير",
          description: "مقابلة تقنية مع فريق التطوير",
          date: "2024-01-22",
          time: "11:00",
          status: "scheduled",
          assignee: "فريق التطوير"
        },
        {
          id: "6",
          type: "interview",
          title: "مقابلة مع المدير",
          description: "مقابلة نهائية مع مدير القسم",
          date: "2024-01-25",
          time: "14:00",
          status: "pending",
          assignee: "علي حسن"
        }
      ]
    },
    {
      id: "2",
      name: "فاطمة عبدالله",
      email: "fatima.abdullah@email.com",
      phone: "+966 55 987 6543",
      position: "مصممة تجربة المستخدم",
      department: "التصميم",
      avatar: "/avatars/fatima.jpg",
      status: "active",
      stage: "test",
      appliedDate: "2024-01-10",
      experience: "3 سنوات",
      location: "جدة",
      overallScore: 78,
      notes: "مصممة موهوبة مع portfolio قوي",
      timeline: [
        {
          id: "1",
          type: "application",
          title: "تقديم الطلب",
          description: "تم تقديم الطلب لوظيفة مصممة تجربة المستخدم",
          date: "2024-01-10",
          time: "16:45",
          status: "completed"
        },
        {
          id: "2",
          type: "screening",
          title: "مراجعة Portfolio",
          description: "تم مراجعة أعمال المرشحة السابقة",
          date: "2024-01-12",
          time: "10:30",
          status: "completed",
          assignee: "نورا سالم",
          score: 85,
          feedback: "أعمال إبداعية ومتنوعة"
        },
        {
          id: "3",
          type: "interview",
          title: "مقابلة أولية",
          description: "مقابلة عبر الفيديو مع فريق التصميم",
          date: "2024-01-15",
          time: "13:00",
          status: "completed",
          assignee: "فريق التصميم",
          score: 75,
          feedback: "مرشحة واعدة مع إمكانيات جيدة"
        },
        {
          id: "4",
          type: "test",
          title: "مهمة تصميم",
          description: "تصميم نموذج أولي لتطبيق جوال",
          date: "2024-01-18",
          time: "09:00",
          status: "pending",
          assignee: "فاطمة عبدالله"
        }
      ]
    },
    {
      id: "3",
      name: "خالد عبدالعزيز",
      email: "khalid.abdulaziz@email.com",
      phone: "+966 56 456 7890",
      position: "محلل بيانات",
      department: "التحليل",
      avatar: "/avatars/khalid.jpg",
      status: "hired",
      stage: "final",
      appliedDate: "2024-01-05",
      experience: "4 سنوات",
      location: "الدمام",
      overallScore: 92,
      notes: "تم قبوله وسيبدأ العمل الأسبوع القادم",
      timeline: [
        {
          id: "1",
          type: "application",
          title: "تقديم الطلب",
          description: "تم تقديم الطلب لوظيفة محلل بيانات",
          date: "2024-01-05",
          time: "11:20",
          status: "completed"
        },
        {
          id: "2",
          type: "screening",
          title: "فحص المؤهلات",
          description: "تم فحص الشهادات والخبرات",
          date: "2024-01-06",
          time: "15:30",
          status: "completed",
          assignee: "أمل محمد",
          score: 90,
          feedback: "مؤهلات ممتازة في تحليل البيانات"
        },
        {
          id: "3",
          type: "test",
          title: "اختبار تحليل البيانات",
          description: "اختبار عملي في Python و SQL",
          date: "2024-01-08",
          time: "14:00",
          status: "completed",
          score: 95,
          feedback: "أداء استثنائي في الاختبار"
        },
        {
          id: "4",
          type: "interview",
          title: "مقابلة نهائية",
          description: "مقابلة مع مدير التحليل",
          date: "2024-01-10",
          time: "10:00",
          status: "completed",
          assignee: "د. سعد الغامدي",
          score: 90,
          feedback: "مرشح مثالي للمنصب"
        },
        {
          id: "5",
          type: "offer",
          title: "عرض العمل",
          description: "تم إرسال عرض العمل للمرشح",
          date: "2024-01-12",
          time: "09:00",
          status: "completed",
          assignee: "قسم الموارد البشرية"
        }
      ]
    }
  ];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || selectedStatus === "all" || candidate.status === selectedStatus;
    const matchesStage = !selectedStage || selectedStage === "all" || candidate.stage === selectedStage;
    
    return matchesSearch && matchesStatus && matchesStage;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'application': return 'bg-purple-100 text-purple-800';
      case 'screening': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-orange-100 text-orange-800';
      case 'test': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'final': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'application': return <FileText className="h-4 w-4" />;
      case 'screening': return <Search className="h-4 w-4" />;
      case 'interview': return <Video className="h-4 w-4" />;
      case 'test': return <AlertCircle className="h-4 w-4" />;
      case 'offer': return <CheckCircle className="h-4 w-4" />;
      case 'rejection': return <XCircle className="h-4 w-4" />;
      case 'note': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddEvent = () => {
    if (selectedCandidate && newEvent.title && newEvent.description) {
      const event: TimelineEvent = {
        id: Date.now().toString(),
        type: newEvent.type as TimelineEvent['type'],
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date!,
        time: newEvent.time!,
        status: newEvent.status as TimelineEvent['status'],
        assignee: newEvent.assignee
      };
      
      // In a real app, this would update the backend
      selectedCandidate.timeline.push(event);
      
      setNewEvent({
        type: 'note',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        status: 'completed'
      });
      setNewEventDialog(false);
    }
  };

  const renderTimeline = (timeline: TimelineEvent[]) => {
    const sortedTimeline = [...timeline].sort((a, b) => 
      new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
    );

    return (
      <div className="space-y-4">
        {sortedTimeline.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${
                event.status === 'completed' ? 'bg-green-100 text-green-600' :
                event.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                event.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                'bg-red-100 text-red-600'
              }`}>
                {getEventIcon(event.type)}
              </div>
              {index < sortedTimeline.length - 1 && (
                <div className="w-px h-8 bg-gray-200 mt-2"></div>
              )}
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <Badge className={getEventStatusColor(event.status)}>
                      {event.status === 'completed' ? 'مكتمل' :
                       event.status === 'pending' ? 'معلق' :
                       event.status === 'scheduled' ? 'مجدول' : 'ملغي'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                    {event.assignee && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.assignee}
                      </div>
                    )}
                  </div>
                  
                  {event.score && (
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        النتيجة: {event.score}/100
                      </Badge>
                    </div>
                  )}
                  
                  {event.feedback && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>التعليق:</strong> {event.feedback}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تتبع المرشحين</h1>
            <p className="text-gray-600 mt-1">تتبع مراحل التوظيف والتقدم الزمني للمرشحين</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المرشحين</p>
                  <p className="text-2xl font-bold text-blue-600">{candidates.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المرشحين النشطين</p>
                  <p className="text-2xl font-bold text-green-600">
                    {candidates.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">تم توظيفهم</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {candidates.filter(c => c.status === 'hired').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">معدل النجاح</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round((candidates.filter(c => c.status === 'hired').length / candidates.length) * 100)}%
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="البحث في المرشحين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="hired">تم التوظيف</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="on-hold">معلق</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع المراحل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المراحل</SelectItem>
                  <SelectItem value="application">التقديم</SelectItem>
                  <SelectItem value="screening">الفحص الأولي</SelectItem>
                  <SelectItem value="interview">المقابلة</SelectItem>
                  <SelectItem value="test">الاختبار</SelectItem>
                  <SelectItem value="offer">العرض</SelectItem>
                  <SelectItem value="final">نهائي</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                  setSelectedStage("all");
                }}
              >
                <Filter className="h-4 w-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCandidates.map(candidate => (
            <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <CardDescription>{candidate.position}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status === 'active' ? 'نشط' :
                       candidate.status === 'hired' ? 'تم التوظيف' :
                       candidate.status === 'rejected' ? 'مرفوض' : 'معلق'}
                    </Badge>
                    <Badge className={getStageColor(candidate.stage)}>
                      {candidate.stage === 'application' ? 'التقديم' :
                       candidate.stage === 'screening' ? 'الفحص' :
                       candidate.stage === 'interview' ? 'المقابلة' :
                       candidate.stage === 'test' ? 'الاختبار' :
                       candidate.stage === 'offer' ? 'العرض' : 'نهائي'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">القسم:</span>
                      <span className="font-medium mr-2">{candidate.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">الخبرة:</span>
                      <span className="font-medium mr-2">{candidate.experience}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">الموقع:</span>
                      <span className="font-medium mr-2">{candidate.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">النتيجة الإجمالية:</span>
                      <span className="font-medium mr-2 text-blue-600">{candidate.overallScore}/100</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-600">تاريخ التقديم:</span>
                    <span className="font-medium mr-2">
                      {new Date(candidate.appliedDate).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-600">آخر نشاط:</span>
                    <span className="font-medium mr-2">
                      {candidate.timeline[candidate.timeline.length - 1]?.title || 'لا يوجد'}
                    </span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-3" onClick={() => setSelectedCandidate(candidate)}>
                        عرض التفاصيل والتايم لاين
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={candidate.avatar} />
                            <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {candidate.name}
                        </DialogTitle>
                        <DialogDescription>
                          {candidate.position} - {candidate.department}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue="timeline" className="mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="timeline">التايم لاين</TabsTrigger>
                          <TabsTrigger value="details">التفاصيل</TabsTrigger>
                          <TabsTrigger value="notes">الملاحظات</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="timeline" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">التايم لاين</h3>
                            <Dialog open={newEventDialog} onOpenChange={setNewEventDialog}>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <Plus className="h-4 w-4 ml-2" />
                                  إضافة حدث
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>إضافة حدث جديد</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="eventType">نوع الحدث</Label>
                                    <Select 
                                      value={newEvent.type} 
                                      onValueChange={(value) => setNewEvent({...newEvent, type: value as TimelineEvent['type']})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="note">ملاحظة</SelectItem>
                                        <SelectItem value="call">مكالمة</SelectItem>
                                        <SelectItem value="email">بريد إلكتروني</SelectItem>
                                        <SelectItem value="interview">مقابلة</SelectItem>
                                        <SelectItem value="test">اختبار</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="eventTitle">العنوان</Label>
                                    <Input
                                      id="eventTitle"
                                      value={newEvent.title}
                                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                      placeholder="عنوان الحدث"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="eventDescription">الوصف</Label>
                                    <Textarea
                                      id="eventDescription"
                                      value={newEvent.description}
                                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                      placeholder="وصف الحدث"
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="eventDate">التاريخ</Label>
                                      <Input
                                        id="eventDate"
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="eventTime">الوقت</Label>
                                      <Input
                                        id="eventTime"
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="eventAssignee">المسؤول (اختياري)</Label>
                                    <Input
                                      id="eventAssignee"
                                      value={newEvent.assignee || ''}
                                      onChange={(e) => setNewEvent({...newEvent, assignee: e.target.value})}
                                      placeholder="اسم المسؤول"
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button onClick={handleAddEvent} className="flex-1">
                                      إضافة الحدث
                                    </Button>
                                    <Button variant="outline" onClick={() => setNewEventDialog(false)}>
                                      إلغاء
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          {renderTimeline(candidate.timeline)}
                        </TabsContent>
                        
                        <TabsContent value="details" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">معلومات شخصية</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">البريد الإلكتروني:</span>
                                  <span>{candidate.email}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">الهاتف:</span>
                                  <span>{candidate.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">الموقع:</span>
                                  <span>{candidate.location}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">الخبرة:</span>
                                  <span>{candidate.experience}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">معلومات الوظيفة</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">المنصب:</span>
                                  <span>{candidate.position}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">القسم:</span>
                                  <span>{candidate.department}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">تاريخ التقديم:</span>
                                  <span>{new Date(candidate.appliedDate).toLocaleDateString('ar-SA')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">النتيجة الإجمالية:</span>
                                  <span className="font-semibold text-blue-600">{candidate.overallScore}/100</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="notes" className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">الملاحظات</h4>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-gray-700">{candidate.notes}</p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مرشحين مطابقين</h3>
              <p className="text-gray-500">جرب تعديل معايير البحث أو الفلاتر</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default CandidateTimeline;