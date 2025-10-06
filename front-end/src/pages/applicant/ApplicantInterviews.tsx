import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Calendar,
  Clock,
  Search,
  Eye,
  Phone,
  Video,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Briefcase,
  User,
  Mail,
  FileText,
  Loader2
} from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import { applicantApiService, Interview } from "@/services/applicantApi"
import { AgoraVideoCall } from "@/components/agora/AgoraVideoCall"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"

const ApplicantInterviews = () => {
  const { t } = useLanguage()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [videoCallInterview, setVideoCallInterview] = useState<Interview | null>(null)

  // Fetch interviews from backend
  const fetchInterviews = async () => {
    try {
      setLoading(true)
      const data = await applicantApiService.getMyInterviews()
      
      // Transform API data to include Agora fields
      const transformedData = data.map(interview => ({
        ...interview,
        agoraChannelName: interview.type === 'VIDEO' ? interview.agoraChannelName || `interview_${interview.id}` : undefined,
        agoraToken: interview.type === 'VIDEO' ? interview.agoraToken : undefined
      }))
      
      setInterviews(transformedData)
    } catch (error) {
      console.error('Error fetching interviews:', error)
      toast.error(t('applicant.interviews.loadingError'))
      setInterviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  // Filter interviews
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (interview.description && interview.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || interview.status.toLowerCase() === statusFilter
    const matchesType = typeFilter === 'all' || interview.type.toLowerCase() === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'ATTENDED': return 'bg-green-100 text-green-800'
      case 'NO_SHOW': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'RESCHEDULED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PHONE': return <Phone className="h-4 w-4" />
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'IN_PERSON': return <MapPin className="h-4 w-4" />
      case 'TECHNICAL': return <Calendar className="h-4 w-4" />
      case 'HR': return <User className="h-4 w-4" />
      case 'FINAL': return <CheckCircle className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  // Get upcoming interviews (next 7 days)
  const upcomingInterviews = interviews.filter(interview => {
    const interviewDate = new Date(interview.scheduledAt)
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return (interview.status === 'SCHEDULED' || interview.status === 'CONFIRMED') && interviewDate >= now && interviewDate <= nextWeek
  })

  // Handle video call
  const handleVideoCall = (interview: Interview) => {
    setVideoCallInterview(interview)
    setIsVideoCallOpen(true)
  }

  // Handle video call end
  const handleVideoCallEnd = () => {
    setIsVideoCallOpen(false)
    setVideoCallInterview(null)
  }

  return (
    <MainLayout userRole="applicant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('applicant.interviews.title')}</h1>
            <p className="text-gray-600 mt-2">{t('applicant.interviews.subtitle')}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('applicant.interviews.stats.total')}</p>
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
                  <p className="text-sm font-medium text-gray-600">{t('applicant.interviews.stats.scheduled')}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? '-' : interviews.filter(i => i.status === 'SCHEDULED' || i.status === 'CONFIRMED').length}
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
                  <p className="text-sm font-medium text-gray-600">{t('applicant.interviews.stats.completed')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '-' : interviews.filter(i => i.status === 'ATTENDED').length}
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
                  <p className="text-sm font-medium text-gray-600">{t('applicant.interviews.stats.upcoming')}</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {loading ? '-' : upcomingInterviews.length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Interviews Alert */}
        {upcomingInterviews.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t('applicant.interviews.upcomingInterviews')}
            </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingInterviews.slice(0, 3).map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{interview.title}</p>
                      <p className="text-sm text-gray-600">{t('applicant.interviews.scheduledBy')}: {interview.scheduledByUser.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {new Date(interview.scheduledAt).toLocaleDateString('ar-SA')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(interview.scheduledAt).toLocaleTimeString('ar-SA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t('applicant.interviews.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t('applicant.interviews.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('applicant.interviews.allStatuses')}</SelectItem>
                  <SelectItem value="scheduled">{t('applicant.interviews.status.scheduled')}</SelectItem>
                  <SelectItem value="confirmed">{t('applicant.interviews.status.confirmed')}</SelectItem>
                  <SelectItem value="attended">{t('applicant.interviews.status.attended')}</SelectItem>
                  <SelectItem value="no_show">{t('applicant.interviews.status.noShow')}</SelectItem>
                  <SelectItem value="cancelled">{t('applicant.interviews.status.cancelled')}</SelectItem>
                  <SelectItem value="rescheduled">{t('applicant.interviews.status.rescheduled')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t('applicant.interviews.filterByType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('applicant.interviews.allTypes')}</SelectItem>
                  <SelectItem value="phone">{t('applicant.interviews.type.phone')}</SelectItem>
                  <SelectItem value="video">{t('applicant.interviews.type.video')}</SelectItem>
                  <SelectItem value="in_person">{t('applicant.interviews.type.inPerson')}</SelectItem>
                  <SelectItem value="technical">{t('applicant.interviews.type.technical')}</SelectItem>
                  <SelectItem value="hr">{t('applicant.interviews.type.hr')}</SelectItem>
                  <SelectItem value="final">{t('applicant.interviews.type.final')}</SelectItem>
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
{t('applicant.interviews.interviewsList')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="mr-2 text-gray-600">{t('applicant.interviews.loading')}</span>
              </div>
            ) : filteredInterviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? t('applicant.interviews.noMatchingInterviews')
                  : t('applicant.interviews.noScheduledInterviews')
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInterviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{interview.title}</h3>
                            <p className="text-gray-600 flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {t('applicant.interviews.scheduledBy')}: {interview.scheduledByUser.name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(interview.scheduledAt).toLocaleDateString('ar-SA')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(interview.scheduledAt).toLocaleTimeString('ar-SA', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {getTypeIcon(interview.type)}
                            <span>
                              {interview.type === 'PHONE' ? t('applicant.interviews.type.phone') : 
                               interview.type === 'VIDEO' ? t('applicant.interviews.type.video') : 
                               interview.type === 'IN_PERSON' ? t('applicant.interviews.type.inPerson') :
                               interview.type === 'TECHNICAL' ? t('applicant.interviews.type.technical') :
                               interview.type === 'HR' ? t('applicant.interviews.type.hr') :
                               interview.type === 'FINAL' ? t('applicant.interviews.type.final') : interview.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{interview.duration} {t('applicant.interviews.minutes')}</span>
                          </div>
                        </div>

                        {interview.interviewerIds && interview.interviewerIds.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <User className="h-4 w-4" />
                            <span>{t('applicant.interviews.interviewers')}: {interview.interviewerIds.length} {t('applicant.interviews.interviewer')}</span>
                          </div>
                        )}

                        {interview.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{interview.location}</span>
                          </div>
                        )}

                        {interview.agoraChannelName && (interview.status === 'SCHEDULED' || interview.status === 'CONFIRMED') && interview.type === 'VIDEO' && (
                          <div className="flex items-center gap-2 text-sm mb-3">
                            <Video className="h-4 w-4 text-blue-600" />
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleVideoCall(interview)}
                              className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                            >
                              {t('applicant.interviews.joinVideoCall')}
                            </Button>
                          </div>
                        )}

                        {interview.description && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-800">{t('applicant.interviews.description')}:</p>
                                <p className="text-sm text-blue-700">{interview.description}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {interview.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-gray-700">{interview.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status === 'SCHEDULED' ? t('applicant.interviews.status.scheduled') :
                           interview.status === 'CONFIRMED' ? t('applicant.interviews.status.confirmed') :
                           interview.status === 'ATTENDED' ? t('applicant.interviews.status.attended') :
                           interview.status === 'NO_SHOW' ? t('applicant.interviews.status.noShow') :
                           interview.status === 'CANCELLED' ? t('applicant.interviews.status.cancelled') :
                           interview.status === 'RESCHEDULED' ? t('applicant.interviews.status.rescheduled') : interview.status}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInterview(interview)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          {t('applicant.interviews.viewDetails')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Interview Dialog */}
        {selectedInterview && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('applicant.interviews.interviewDetails')}
                </DialogTitle>
                <DialogDescription>
                  {t('applicant.interviews.viewDetailsDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Interview Title and Scheduled By */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">{selectedInterview.title}</h3>
                  </div>
                  <p className="text-blue-700 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {t('applicant.interviews.scheduledBy')}: {selectedInterview.scheduledByUser.name}
                  </p>
                </div>

                {/* Interview Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('applicant.interviews.interviewDate')}</Label>
                    <p className="text-gray-900 flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedInterview.scheduledAt).toLocaleDateString('ar-SA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('applicant.interviews.interviewTime')}</Label>
                    <p className="text-gray-900 flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      {new Date(selectedInterview.scheduledAt).toLocaleTimeString('ar-SA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('applicant.interviews.duration')}</Label>
                    <p className="text-gray-900 mt-1">{selectedInterview.duration} {t('applicant.interviews.minutes')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('applicant.interviews.type.label')}</Label>
                    <p className="text-gray-900 flex items-center gap-2 mt-1">
                      {getTypeIcon(selectedInterview.type)}
                      {selectedInterview.type === 'PHONE' ? t('applicant.interviews.type.phone') :
                       selectedInterview.type === 'VIDEO' ? t('applicant.interviews.type.video') :
                       selectedInterview.type === 'IN_PERSON' ? t('applicant.interviews.type.inPerson') :
                       selectedInterview.type === 'TECHNICAL' ? t('applicant.interviews.type.technical') :
                       selectedInterview.type === 'HR' ? t('applicant.interviews.type.hr') :
                       selectedInterview.type === 'FINAL' ? t('applicant.interviews.type.final') : selectedInterview.type}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('applicant.interviews.status.label')}</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedInterview.status)}>
                        {selectedInterview.status === 'SCHEDULED' ? t('applicant.interviews.status.scheduled') :
                         selectedInterview.status === 'CONFIRMED' ? t('applicant.interviews.status.confirmed') :
                         selectedInterview.status === 'ATTENDED' ? t('applicant.interviews.status.attended') :
                         selectedInterview.status === 'NO_SHOW' ? t('applicant.interviews.status.noShow') :
                         selectedInterview.status === 'CANCELLED' ? t('applicant.interviews.status.cancelled') :
                         selectedInterview.status === 'RESCHEDULED' ? t('applicant.interviews.status.rescheduled') : selectedInterview.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Interviewer Info */}
                {selectedInterview.interviewerIds && selectedInterview.interviewerIds.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t('applicant.interviews.interviewersInfo')}
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t('applicant.interviews.numberOfInterviewers')}: {selectedInterview.interviewerIds.length}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location or Meeting Link */}
                {selectedInterview.location && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('applicant.interviews.location')}</Label>
                    <p className="text-gray-900 flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {selectedInterview.location}
                    </p>
                  </div>
                )}

                {selectedInterview.agoraChannelName && selectedInterview.type === 'VIDEO' && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('applicant.interviews.videoInterview')}</Label>
                    <div className="mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVideoCall(selectedInterview)}
                        className="flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        {t('applicant.interviews.joinVideoCall')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedInterview.description && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t('applicant.interviews.description')}
                    </h4>
                    <p className="text-blue-800">{selectedInterview.description}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedInterview.notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('applicant.interviews.notes')}</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{selectedInterview.notes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {(selectedInterview.status === 'SCHEDULED' || selectedInterview.status === 'CONFIRMED') && selectedInterview.agoraChannelName && selectedInterview.type === 'VIDEO' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => handleVideoCall(selectedInterview)}
                      className="flex-1"
                    >
                      <Video className="h-4 w-4 ml-2" />
                      {t('applicant.interviews.joinNow')}
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Agora Video Call Component */}
        {isVideoCallOpen && videoCallInterview && (
          <div className="fixed inset-0 z-50 bg-black">
            <AgoraVideoCall
              interviewId={videoCallInterview.id}
              channelName={videoCallInterview.agoraChannelName!}
              onLeave={handleVideoCallEnd}
            />
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ApplicantInterviews