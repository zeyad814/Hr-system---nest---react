import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Filter,
  MapPin,
  Clock,
  Calendar,
  Eye,
  FileText,
  Download,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Hourglass,
  Building,
  DollarSign,
  Users,
  MoreHorizontal
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { applicantApiService } from "@/services/applicantApi"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const ApplicantApplications = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()

  // Handle withdraw application
  const handleWithdrawApplication = async (applicationId: string) => {
    if (withdrawing.includes(applicationId)) return

    setWithdrawing(prev => [...prev, applicationId])

    try {
      await applicantApiService.withdrawApplication(applicationId)
      // Remove from applications list or update status
      setApplications(prev => 
        prev.map(app => 
          app.id.toString() === applicationId 
            ? { ...app, status: 'منسحب' }
            : app
        )
      )
      toast.success(t('applicant.applications.withdrawSuccess'))
    } catch (error) {
      console.error('Error withdrawing application:', error)
      toast.error(t('applicant.applications.withdrawError'))
    } finally {
      setWithdrawing(prev => prev.filter(id => id !== applicationId))
    }
  }
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState<string[]>([])

  // Transform API data to match UI format
  const transformApiDataToUIFormat = (apiApplications: any[]) => {
    return apiApplications.map((apiApp, index) => {
      // Map API status to Arabic status
      const statusMap: { [key: string]: string } = {
        'PENDING': 'مراجعة',
        'INTERVIEW': 'مقابلة', 
        'OFFER': 'عرض',
        'HIRED': 'مقبول',
        'REJECTED': 'مرفوض',
        'WITHDRAWN': 'منسحب'
      }

      // Calculate progress based on status
      const progressMap: { [key: string]: number } = {
        'PENDING': 25,
        'INTERVIEW': 60,
        'OFFER': 80,
        'HIRED': 100,
        'REJECTED': 100,
        'WITHDRAWN': 0
      }

      // Map stage description
      const stageMap: { [key: string]: string } = {
        'PENDING': 'فحص السيرة الذاتية',
        'INTERVIEW': 'مقابلة مجدولة',
        'OFFER': 'عرض عمل',
        'HIRED': 'تم القبول',
        'REJECTED': 'تم الرفض',
        'WITHDRAWN': 'تم السحب'
      }

      const status = statusMap[apiApp.status] || 'مراجعة'
      const progress = progressMap[apiApp.status] || 25
      const stage = stageMap[apiApp.status] || 'قيد المراجعة'

      return {
        id: apiApp.id,
        jobTitle: apiApp.job?.title || t('applicant.applications.notSpecified'),
        company: apiApp.job?.client?.name || apiApp.job?.company || t('applicant.applications.notSpecified'),
        location: apiApp.job?.location || t('applicant.applications.notSpecified'),
        salary: apiApp.job?.salaryRange || t('applicant.applications.notSpecified'),
        appliedDate: new Date(apiApp.createdAt).toISOString().split('T')[0],
        lastUpdate: new Date(apiApp.updatedAt).toISOString().split('T')[0],
        status: status,
        stage: stage,
        progress: progress,
        logo: `/companies/company-${index + 1}.jpg`,
        applicationId: `APP-${apiApp.id.slice(-6).toUpperCase()}`,
        notes: `${t('applicant.applications.yourApplication')} ${status === 'مراجعة' ? t('applicant.applications.underReview') : status === 'مقابلة' ? t('applicant.applications.acceptedNextStage') : t('applicant.applications.processed')}`,
        nextStep: status === 'مراجعة' ? t('applicant.applications.waitingHRResponse') : 
                 status === 'مقابلة' ? t('applicant.applications.contactForInterview') :
                 status === 'مقبول' ? t('applicant.applications.congratulationsAccepted') :
                 status === 'مرفوض' ? t('applicant.applications.canApplyOtherJobs') : t('applicant.applications.applicationWithdrawn'),
        documents: [
          { name: t('applicant.applications.resume'), type: "PDF", size: "245 KB" },
          ...(apiApp.resumeUrl ? [{ name: t('applicant.applications.attachedResume'), type: "PDF", size: "" }] : [])
        ],
        timeline: [
          { date: new Date(apiApp.createdAt).toISOString().split('T')[0], event: t('applicant.applications.applicationSent'), status: "completed" },
          { date: new Date(apiApp.createdAt).toISOString().split('T')[0], event: t('applicant.applications.applicationReceived'), status: "completed" },
          ...(apiApp.status !== 'PENDING' ? [{ date: new Date(apiApp.updatedAt).toISOString().split('T')[0], event: stage, status: "current" }] : [{ date: "", event: t('applicant.applications.underReview'), status: "current" }]),
          ...(apiApp.status === 'PENDING' ? [
            { date: "", event: t('applicant.applications.initialInterview'), status: "pending" },
            { date: "", event: t('applicant.applications.technicalInterview'), status: "pending" },
            { date: "", event: t('applicant.applications.finalDecision'), status: "pending" }
          ] : [])
        ]
      }
    })
  }

  // Load applications from API
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true)
        const data = await applicantApiService.getMyApplications()
        console.log('API Response:', data) // For debugging
        const transformedData = transformApiDataToUIFormat(data)
        setApplications(transformedData)
      } catch (error) {
        console.error('Error loading applications:', error)
        toast.error(t('applicant.applications.loadingError'))
        setApplications([])
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [])



  const getStatusColor = (status: string) => {
    switch (status) {
      case "مراجعة":
        return "bg-yellow-100 text-yellow-800"
      case "مقابلة":
        return "bg-blue-100 text-blue-800"
      case "مقبول":
        return "bg-green-100 text-green-800"
      case "مرفوض":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "مراجعة":
        return <Hourglass className="h-4 w-4" />
      case "مقابلة":
        return <Users className="h-4 w-4" />
      case "مقبول":
        return <CheckCircle className="h-4 w-4" />
      case "مرفوض":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "مقبول":
        return "bg-green-500"
      case "مرفوض":
        return "bg-red-500"
      case "مقابلة":
        return "bg-blue-500"
      default:
        return "bg-yellow-500"
    }
  }

  const filteredApplications = applications.filter(app => {
    if (!app || !app.jobTitle || !app.company) return false
    
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || !selectedStatus || app.status === selectedStatus
    const matchesCompany = selectedCompany === "all" || !selectedCompany || app.company === selectedCompany
    
    return matchesSearch && matchesStatus && matchesCompany
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      case "oldest":
        return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
      case "status":
        return a.status.localeCompare(b.status)
      case "company":
        return a.company.localeCompare(b.company)
      default:
        return 0
    }
  })

  const ApplicationDetailsDialog = ({ application }: { application: any }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 ml-2" />
            التفاصيل
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>{application?.jobTitle || 'تفاصيل الطلب'}</DialogTitle>
            </VisuallyHidden>
            <DialogDescription>{application?.company || 'شركة غير محددة'}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Application Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">معلومات الطلب</h4>
                <div className="space-y-2 text-sm">
                  <div>رقم الطلب: {application.applicationId}</div>
                  <div>تاريخ التقديم: {application.appliedDate}</div>
                  <div>آخر تحديث: {application.lastUpdate}</div>
                  <div>الحالة: <Badge className={getStatusColor(application.status)}>{application.status}</Badge></div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">تفاصيل الوظيفة</h4>
                <div className="space-y-2 text-sm">
                  <div>الموقع: {application.location}</div>
                  <div>الراتب: {application.salary}</div>
                  <div>المرحلة الحالية: {application.stage}</div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <h4 className="font-semibold mb-2">التقدم</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>مكتمل</span>
                  <span>{application.progress}%</span>
                </div>
                <Progress value={application.progress} className="h-2" />
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-semibold mb-2">الجدول الزمني</h4>
              <div className="space-y-3">
                {application.timeline.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === "completed" ? "bg-green-500" :
                      item.status === "current" ? "bg-blue-500" :
                      item.status === "accepted" ? "bg-green-500" :
                      item.status === "rejected" ? "bg-red-500" :
                      "bg-gray-300"
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.event}</div>
                      {item.date && <div className="text-xs text-muted-foreground">{item.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h4 className="font-semibold mb-2">ملاحظات</h4>
              <p className="text-sm text-muted-foreground">{application.notes}</p>
            </div>

            {/* Next Step */}
            <div>
              <h4 className="font-semibold mb-2">الخطوة التالية</h4>
              <p className="text-sm">{application.nextStep}</p>
            </div>

            {/* Interview Details */}
            {application.interviewDetails && (
              <div>
                <h4 className="font-semibold mb-2">تفاصيل المقابلة</h4>
                <div className="bg-blue-50 p-3 rounded-lg space-y-2 text-sm">
                  <div>التاريخ: {application.interviewDetails.date}</div>
                  <div>الوقت: {application.interviewDetails.time}</div>
                  <div>النوع: {application.interviewDetails.type}</div>
                  <div>المقابل: {application.interviewDetails.interviewer}</div>
                  <div>المكان: {application.interviewDetails.location}</div>
                  {application.interviewDetails.meetingLink && (
                    <div>
                      <Button size="sm" className="mt-2">
                        انضمام للمقابلة
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Offer Details */}
            {application.offerDetails && (
              <div>
                <h4 className="font-semibold mb-2">تفاصيل العرض</h4>
                <div className="bg-green-50 p-3 rounded-lg space-y-2 text-sm">
                  <div>الراتب المعروض: {application.offerDetails.salary}</div>
                  <div>تاريخ البدء: {application.offerDetails.startDate}</div>
                  <div>المزايا:</div>
                  <ul className="list-disc list-inside mr-4">
                    {application.offerDetails.benefits.map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Feedback */}
            {application.feedback && (
              <div>
                <h4 className="font-semibold mb-2">التغذية الراجعة</h4>
                <p className="text-sm text-muted-foreground">{application.feedback}</p>
              </div>
            )}

            {/* Documents */}
            <div>
              <h4 className="font-semibold mb-2">المستندات</h4>
              <div className="space-y-2">
                {application.documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{doc.name}</span>
                      {doc.size && <span className="text-xs text-muted-foreground">({doc.size})</span>}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <MainLayout userRole="applicant">
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('applicant.applications.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('applicant.applications.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/applicant/jobs")}>
              <Search className="h-4 w-4 ml-2" />
              {t('applicant.applications.browseJobs')}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            {/* Loading Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-8"></div>
                      </div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Loading Applications */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('applicant.applications.stats.total')}</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('applicant.applications.stats.pending')}</p>
                  <p className="text-2xl font-bold">{applications.filter(app => app.status === t('applicant.applications.under_review')).length}</p>
                </div>
                <Hourglass className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('applicant.applications.stats.interviews')}</p>
                  <p className="text-2xl font-bold">{applications.filter(app => app.status === t('applicant.applications.interview')).length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('applicant.applications.stats.offers')}</p>
                  <p className="text-2xl font-bold">{applications.filter(app => app.status === t('applicant.applications.hired')).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('applicant.applications.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('applicant.applications.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('applicant.applications.status.all')}</SelectItem>
                  <SelectItem value="مراجعة">{t('applicant.applications.status.pending')}</SelectItem>
                  <SelectItem value="مقابلة">{t('applicant.applications.status.interview')}</SelectItem>
                  <SelectItem value="مقبول">{t('applicant.applications.status.accepted')}</SelectItem>
                  <SelectItem value="مرفوض">{t('applicant.applications.status.rejected')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder={t('applicant.applications.filters.company')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('applicant.applications.company.all')}</SelectItem>
                  <SelectItem value="شركة التقنية المتقدمة">شركة التقنية المتقدمة</SelectItem>
                  <SelectItem value="شركة الابتكار الرقمي">شركة الابتكار الرقمي</SelectItem>
                  <SelectItem value="مجموعة الحلول التقنية">مجموعة الحلول التقنية</SelectItem>
                  <SelectItem value="شركة التطبيقات الذكية">شركة التطبيقات الذكية</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder={t('applicant.applications.filters.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('applicant.applications.sort.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('applicant.applications.sort.oldest')}</SelectItem>
                  <SelectItem value="status">{t('applicant.applications.sort.status')}</SelectItem>
                  <SelectItem value="company">{t('applicant.applications.sort.company')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          {sortedApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={application.logo} alt={application.company} />
                      <AvatarFallback>{application.company.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{application.jobTitle}</h3>
                          <p className="text-muted-foreground">{application.company}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="mr-1">{application.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{application.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{t('applicant.applications.appliedOn')}: {application.appliedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{t('applicant.applications.lastUpdate')}: {application.lastUpdate}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{application.salary}</span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{t('applicant.applications.progress')}: {application.stage}</span>
                          <span>{application.progress}%</span>
                        </div>
                        <Progress value={application.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {t('applicant.applications.applicationId')}: {application.applicationId}
                        </div>
                        
                        <div className="flex gap-2">
                          <ApplicationDetailsDialog application={application} />
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t('applicant.applications.actions.title')}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 ml-2" />
                                {t('applicant.applications.actions.sendMessage')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 ml-2" />
                                {t('applicant.applications.actions.downloadDocuments')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 ml-2" />
                                {t('applicant.applications.actions.viewJob')}
                              </DropdownMenuItem>
                              {application.status !== 'منسحب' && application.status !== 'مرفوض' && (
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleWithdrawApplication(application.id.toString())}
                                  disabled={withdrawing.includes(application.id.toString())}
                                >
                                  <X className="h-4 w-4 ml-2" />
                                  {withdrawing.includes(application.id.toString()) ? t('applicant.applications.actions.withdrawing') : t('applicant.applications.actions.withdraw')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {sortedApplications.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('applicant.applications.noApplications.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('applicant.applications.noApplications.description')}
                </p>
                <Button onClick={() => navigate("/applicant/jobs")}>
                  {t('applicant.applications.noApplications.browseJobs')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default ApplicantApplications