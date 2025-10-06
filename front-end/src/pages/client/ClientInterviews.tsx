import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  Video,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Loader2,
  Plus
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import api from "@/lib/api"
import { toast } from "sonner"
import { clientApiService } from "@/services/clientApi"

interface Interview {
  id: number
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  candidateAvatar?: string
  jobTitle: string
  jobId: number
  applicationId: number
  scheduledAt: string
  duration: number
  type: 'phone' | 'video' | 'in-person'
  location?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed'
  interviewerName?: string
  interviewerEmail?: string
  notes?: string
  createdAt: string
  updatedAt: string
  reminderSent: boolean
}

interface NewInterview {
  applicationId: number
  scheduledAt: string
  duration: number
  type: 'phone' | 'video' | 'in-person'
  location?: string
  notes?: string
}

const ClientInterviews = () => {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [newInterview, setNewInterview] = useState<NewInterview>({
    applicationId: 0,
    scheduledAt: '',
    duration: 60,
    type: 'video',
    location: '',
    notes: ''
  })

  // Fetch interviews from backend
  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const response = await clientApiService.getInterviews()
      setInterviews(response.data)
    } catch (error) {
      console.error('Error fetching interviews:', error)
      toast.error('حدث خطأ في جلب المقابلات')
      setInterviews([])
    } finally {
      setLoading(false)
    }
  }

  // Schedule new interview
  const scheduleInterview = async () => {
    try {
      const interviewData = {
        applicantId: newInterview.applicationId.toString(),
        scheduledAt: newInterview.scheduledAt,
        type: newInterview.type,
        duration: newInterview.duration,
        location: newInterview.location,
        notes: newInterview.notes,
        status: 'SCHEDULED'
      };
      
      const response = await clientApiService.scheduleInterview(interviewData)
      setInterviews([...interviews, response.data])
      setIsScheduleDialogOpen(false)
      setNewInterview({
        applicationId: 0,
        scheduledAt: '',
        duration: 60,
        type: 'video',
        location: '',
        notes: ''
      })
      toast.success('تم جدولة المقابلة بنجاح')
      fetchInterviews()
    } catch (error) {
      console.error('Error scheduling interview:', error)
      toast.error('حدث خطأ في جدولة المقابلة')
    }
  }

  // Update interview status
  const updateInterviewStatus = async (interviewId: number, status: string) => {
    try {
      await clientApiService.updateInterview(interviewId.toString(), { status })
      setInterviews(interviews.map(interview => 
        interview.id === interviewId ? { ...interview, status: status as any } : interview
      ))
      toast.success('تم تحديث حالة المقابلة بنجاح')
    } catch (error) {
      console.error('Error updating interview status:', error)
      toast.error('حدث خطأ في تحديث حالة المقابلة')
    }
  }

  // Send reminder
  const sendReminder = async (interviewId: number, type: 'email' | 'whatsapp') => {
    try {
      await api.post(`/notifications/interview-reminder/${interviewId}`, { type })
      setInterviews(interviews.map(interview => 
        interview.id === interviewId ? { ...interview, reminderSent: true } : interview
      ))
      toast.success(`تم إرسال التذكير عبر ${type === 'email' ? 'البريد الإلكتروني' : 'الواتساب'} بنجاح`)
    } catch (error) {
      console.error('Error sending reminder:', error)
      toast.error('حدث خطأ في إرسال التذكير')
    }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  // Filter interviews
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter
    const matchesType = typeFilter === 'all' || interview.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'postponed': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'in-person': return <MapPin className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة المقابلات</h1>
            <p className="text-gray-600 mt-2">إدارة وجدولة المقابلات مع المرشحين</p>
          </div>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600  hover:bg-blue-700">
                <Plus className="h-4 w-4 ml-2" />
                جدولة مقابلة جديدة
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المقابلات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? '-' : interviews.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">مجدولة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? '-' : interviews.filter(i => i.status === 'scheduled').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '-' : interviews.filter(i => i.status === 'completed').length}
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
                  <p className="text-sm font-medium text-gray-600">ملغية</p>
                  <p className="text-2xl font-bold text-red-600">
                    {loading ? '-' : interviews.filter(i => i.status === 'cancelled').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في المقابلات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="scheduled">مجدولة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغية</SelectItem>
                  <SelectItem value="postponed">مؤجلة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="فلترة حسب النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="phone">هاتفية</SelectItem>
                  <SelectItem value="video">فيديو</SelectItem>
                  <SelectItem value="in-person">حضورية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interviews List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              قائمة المقابلات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="mr-2 text-gray-600">جاري تحميل المقابلات...</span>
              </div>
            ) : filteredInterviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'لا توجد مقابلات تطابق معايير البحث'
                  : 'لا توجد مقابلات مجدولة'
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInterviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={interview.candidateAvatar} />
                          <AvatarFallback>{interview.candidateName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{interview.candidateName}</h3>
                          <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              {getTypeIcon(interview.type)}
                              {interview.type === 'phone' ? 'هاتفية' : 
                               interview.type === 'video' ? 'فيديو' : 'حضورية'}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(interview.scheduledAt).toLocaleDateString('ar-SA')}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(interview.scheduledAt).toLocaleTimeString('ar-SA', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status === 'scheduled' ? 'مجدولة' :
                           interview.status === 'completed' ? 'مكتملة' :
                           interview.status === 'cancelled' ? 'ملغية' : 'مؤجلة'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInterview(interview)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInterview(interview)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {interview.status === 'scheduled' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sendReminder(interview.id, 'email')}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateInterviewStatus(interview.id, 'completed')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateInterviewStatus(interview.id, 'cancelled')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {interview.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{interview.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Interview Dialog */}
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>جدولة مقابلة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="applicationId">رقم الطلب</Label>
              <Input
                id="applicationId"
                type="number"
                value={newInterview.applicationId}
                onChange={(e) => setNewInterview({...newInterview, applicationId: parseInt(e.target.value)})}
                placeholder="أدخل رقم الطلب"
              />
            </div>
            <div>
              <Label htmlFor="scheduledAt">موعد المقابلة</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={newInterview.scheduledAt}
                onChange={(e) => setNewInterview({...newInterview, scheduledAt: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="duration">المدة (بالدقائق)</Label>
              <Input
                id="duration"
                type="number"
                value={newInterview.duration}
                onChange={(e) => setNewInterview({...newInterview, duration: parseInt(e.target.value)})}
                placeholder="60"
              />
            </div>
            <div>
              <Label htmlFor="type">نوع المقابلة</Label>
              <Select value={newInterview.type} onValueChange={(value: any) => setNewInterview({...newInterview, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">هاتفية</SelectItem>
                  <SelectItem value="video">فيديو</SelectItem>
                  <SelectItem value="in-person">حضورية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newInterview.type === 'in-person' && (
              <div>
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  value={newInterview.location}
                  onChange={(e) => setNewInterview({...newInterview, location: e.target.value})}
                  placeholder="أدخل موقع المقابلة"
                />
              </div>
            )}
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={newInterview.notes}
                onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})}
                placeholder="أدخل أي ملاحظات إضافية"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={scheduleInterview} className="flex-1">
                جدولة المقابلة
              </Button>
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>

        {/* View Interview Dialog */}
        {selectedInterview && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>تفاصيل المقابلة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم المرشح</Label>
                    <p className="text-sm text-gray-700">{selectedInterview.candidateName}</p>
                  </div>
                  <div>
                    <Label>المنصب</Label>
                    <p className="text-sm text-gray-700">{selectedInterview.jobTitle}</p>
                  </div>
                  <div>
                    <Label>البريد الإلكتروني</Label>
                    <p className="text-sm text-gray-700">{selectedInterview.candidateEmail}</p>
                  </div>
                  <div>
                    <Label>رقم الهاتف</Label>
                    <p className="text-sm text-gray-700">{selectedInterview.candidatePhone}</p>
                  </div>
                  <div>
                    <Label>موعد المقابلة</Label>
                    <p className="text-sm text-gray-700">
                      {new Date(selectedInterview.scheduledAt).toLocaleString('ar-SA')}
                    </p>
                  </div>
                  <div>
                    <Label>المدة</Label>
                    <p className="text-sm text-gray-700">{selectedInterview.duration} دقيقة</p>
                  </div>
                  <div>
                    <Label>نوع المقابلة</Label>
                    <p className="text-sm text-gray-700">
                      {selectedInterview.type === 'phone' ? 'هاتفية' : 
                       selectedInterview.type === 'video' ? 'فيديو' : 'حضورية'}
                    </p>
                  </div>
                  <div>
                    <Label>الحالة</Label>
                    <Badge className={getStatusColor(selectedInterview.status)}>
                      {selectedInterview.status === 'scheduled' ? 'مجدولة' :
                       selectedInterview.status === 'completed' ? 'مكتملة' :
                       selectedInterview.status === 'cancelled' ? 'ملغية' : 'مؤجلة'}
                    </Badge>
                  </div>
                </div>
                {selectedInterview.location && (
                  <div>
                    <Label>الموقع</Label>
                    <p className="text-sm text-gray-700">{selectedInterview.location}</p>
                  </div>
                )}
                {selectedInterview.notes && (
                  <div>
                    <Label>الملاحظات</Label>
                    <p className="text-sm text-gray-700">{selectedInterview.notes}</p>
                  </div>
                )}
                {selectedInterview.status === 'scheduled' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => sendReminder(selectedInterview.id, 'email')}
                      variant="outline"
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 ml-2" />
                      إرسال تذكير بالبريد
                    </Button>
                    <Button
                      onClick={() => sendReminder(selectedInterview.id, 'whatsapp')}
                      variant="outline"
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 ml-2" />
                      إرسال تذكير بالواتساب
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Interview Dialog */}
        {selectedInterview && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>تعديل المقابلة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editScheduledAt">موعد المقابلة</Label>
                  <Input
                    id="editScheduledAt"
                    type="datetime-local"
                    value={selectedInterview.scheduledAt.slice(0, 16)}
                    onChange={(e) => setSelectedInterview({...selectedInterview, scheduledAt: e.target.value + ':00Z'})}
                  />
                </div>
                <div>
                  <Label htmlFor="editDuration">المدة (بالدقائق)</Label>
                  <Input
                    id="editDuration"
                    type="number"
                    value={selectedInterview.duration}
                    onChange={(e) => setSelectedInterview({...selectedInterview, duration: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="editType">نوع المقابلة</Label>
                  <Select value={selectedInterview.type} onValueChange={(value: any) => setSelectedInterview({...selectedInterview, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">هاتفية</SelectItem>
                      <SelectItem value="video">فيديو</SelectItem>
                      <SelectItem value="in-person">حضورية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedInterview.type === 'in-person' && (
                  <div>
                    <Label htmlFor="editLocation">الموقع</Label>
                    <Input
                      id="editLocation"
                      value={selectedInterview.location || ''}
                      onChange={(e) => setSelectedInterview({...selectedInterview, location: e.target.value})}
                      placeholder="أدخل موقع المقابلة"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="editNotes">ملاحظات</Label>
                  <Textarea
                    id="editNotes"
                    value={selectedInterview.notes || ''}
                    onChange={(e) => setSelectedInterview({...selectedInterview, notes: e.target.value})}
                    placeholder="أدخل أي ملاحظات إضافية"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => {
                    // Save changes logic here
                    setIsEditDialogOpen(false)
                    toast.success('تم حفظ التغييرات بنجاح')
                  }} className="flex-1">
                    حفظ التغييرات
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  )
}

export default ClientInterviews