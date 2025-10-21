import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  Search,
  Filter,
  Eye,
  Download,
  Star,
  StarOff,
  MessageSquare,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Send,
  Video
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { clientApiService } from "@/services/clientApi"
import { useLanguage } from "@/contexts/LanguageContext"

interface Candidate {
  id: number
  name: string
  email: string
  phone: string
  avatar?: string
  position: string
  experience: string
  education: string
  location: string
  status: string
  rating: number
  skills: string[]
  appliedDate: string
  lastActivity: string
  jobId: number
  jobTitle: string
  isFavorite: boolean
  summary: string
  interviewDate?: string
  salary: string
  applicationId?: number
  agoraChannelName?: string
  agoraToken?: string
  interviewType?: string
}

interface Job {
  id: number
  title: string
}

const ClientCandidates = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackDialog, setFeedbackDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative'>('positive')
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [videoCallCandidate, setVideoCallCandidate] = useState<Candidate | null>(null)

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch candidates recommended to this client
        const candidatesResponse = await clientApiService.getCandidates()
        
        // Transform API response to include video interview data
        const transformedCandidates = (Array.isArray(candidatesResponse) ? candidatesResponse : []).map((candidate: any) => ({
          ...candidate,
          interviewType: candidate.interviewType === 'VIDEO' ? 'video' : candidate.interviewType,
          agoraChannelName: candidate.agoraChannelName,
          agoraToken: candidate.agoraToken
        }))
        
        setCandidates(transformedCandidates)
        
        // Fetch jobs for filtering
        const jobsResponse = await clientApiService.getJobs()
        setJobs(Array.isArray(jobsResponse) ? jobsResponse : [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: t('common.error'),
          description: t('client.candidates.errors.fetchFailed'),
          variant: "destructive"
        })
        setCandidates([])
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جديد":
        return "bg-blue-100 text-blue-800"
      case "مراجعة":
        return "bg-yellow-100 text-yellow-800"
      case "مقابلة":
        return "bg-purple-100 text-purple-800"
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
      case "مقبول":
        return <CheckCircle className="h-4 w-4" />
      case "مرفوض":
        return <XCircle className="h-4 w-4" />
      case "مقابلة":
        return <Calendar className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredCandidates = (candidates || []).filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    const matchesJob = jobFilter === "all" || candidate.jobId.toString() === jobFilter
    const matchesExperience = experienceFilter === "all" || 
                             (experienceFilter === "junior" && parseInt(candidate.experience) <= 2) ||
                             (experienceFilter === "mid" && parseInt(candidate.experience) >= 3 && parseInt(candidate.experience) <= 5) ||
                             (experienceFilter === "senior" && parseInt(candidate.experience) > 5)
    
    const matchesTab = activeTab === "all" || 
                      (activeTab === "favorites" && candidate.isFavorite) ||
                      (activeTab === "new" && candidate.status === "جديد") ||
                      (activeTab === "interview" && candidate.status === "مقابلة") ||
                      (activeTab === "accepted" && candidate.status === "مقبول")
    
    return matchesSearch && matchesStatus && matchesJob && matchesExperience && matchesTab
  })

  const toggleFavorite = async (candidateId: number) => {
    try {
      await clientApiService.toggleCandidateFavorite(candidateId.toString())
      setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, isFavorite: !candidate.isFavorite }
          : candidate
      ))
      toast({
        title: t('common.success'),
        description: t('client.candidates.success.favoriteUpdated')
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: t('common.error'),
        description: t('client.candidates.errors.favoriteUpdateFailed'),
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = async (candidateId: number, newStatus: string) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId)
      if (!candidate?.applicationId) {
        toast({
          title: t('common.error'),
          description: t('client.candidates.errors.applicationIdMissing'),
          variant: "destructive"
        })
        return
      }

      await clientApiService.updateApplicationStatus(candidate.applicationId.toString(), newStatus)
      
      setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { ...c, status: newStatus } : c
      ))
      
      toast({
        title: t('common.success'),
        description: t('client.candidates.success.statusUpdated', { status: newStatus })
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: t('common.error'),
        description: t('client.candidates.errors.statusUpdateFailed'),
        variant: "destructive"
      })
    }
  }

  const handleFeedback = (candidate: Candidate, type: 'positive' | 'negative') => {
    setSelectedCandidate(candidate)
    setFeedbackType(type)
    setFeedbackText('')
    setFeedbackDialog(true)
  }

  const submitFeedback = async () => {
    if (!selectedCandidate?.applicationId || !feedbackText.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نص التقييم",
        variant: "destructive"
      })
      return
    }

    try {
      await clientApiService.submitFeedback({
        applicationId: selectedCandidate.applicationId.toString(),
        feedbackText: feedbackText.trim(),
        feedbackType
      })
      
      toast({
        title: "تم الإرسال",
        description: "تم إرسال التقييم بنجاح"
      })
      setFeedbackDialog(false)
      setSelectedCandidate(null)
      setFeedbackText('')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال التقييم",
        variant: "destructive"
      })
    }
  }

  const handleVideoCall = (candidate: Candidate) => {
    setVideoCallCandidate(candidate)
    setIsVideoCallOpen(true)
  }

  const handleVideoCallEnd = () => {
    setIsVideoCallOpen(false)
    setVideoCallCandidate(null)
  }

  return (
    <MainLayout userRole="client">
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('client.candidates.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('client.candidates.description')}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">{t('client.candidates.tabs.all')} ({candidates.length})</TabsTrigger>
            <TabsTrigger value="new">{t('client.candidates.tabs.new')} ({candidates.filter(c => c.status === "جديد").length})</TabsTrigger>
            <TabsTrigger value="interview">{t('client.candidates.tabs.interview')} ({candidates.filter(c => c.status === "مقابلة").length})</TabsTrigger>
            <TabsTrigger value="accepted">{t('client.candidates.tabs.accepted')} ({candidates.filter(c => c.status === "مقبول").length})</TabsTrigger>
            <TabsTrigger value="favorites">{t('client.candidates.tabs.favorites')} ({candidates.filter(c => c.isFavorite).length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={t('client.candidates.search.placeholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('client.candidates.filters.statusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('client.candidates.filters.allStatuses')}</SelectItem>
                      <SelectItem value="جديد">{t('client.candidates.status.new')}</SelectItem>
                      <SelectItem value="مراجعة">{t('client.candidates.status.review')}</SelectItem>
                      <SelectItem value="مقابلة">{t('client.candidates.status.interview')}</SelectItem>
                      <SelectItem value="مقبول">{t('client.candidates.status.accepted')}</SelectItem>
                      <SelectItem value="مرفوض">{t('client.candidates.status.rejected')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={jobFilter} onValueChange={setJobFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('client.candidates.filters.jobPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('client.candidates.filters.allJobs')}</SelectItem>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id.toString()}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('client.candidates.filters.experiencePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('client.candidates.filters.allLevels')}</SelectItem>
                      <SelectItem value="junior">{t('client.candidates.experience.junior')}</SelectItem>
                      <SelectItem value="mid">{t('client.candidates.experience.mid')}</SelectItem>
                      <SelectItem value="senior">{t('client.candidates.experience.senior')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">{t('client.candidates.loading')}</p>
                </CardContent>
              </Card>
            )}

            {/* Candidates Grid */}
            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{candidate.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(candidate.id)}
                        >
                          {candidate.isFavorite ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Badge className={getStatusColor(candidate.status)}>
                          {getStatusIcon(candidate.status)}
                          <span className="mr-1">{candidate.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{candidate.summary}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{candidate.experience}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{candidate.education}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span>{candidate.rating}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">{t('client.candidates.skills')}:</h4>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t('client.candidates.appliedDate')}: {candidate.appliedDate}</span>
                        <span>{t('client.candidates.lastActivity')}: {candidate.lastActivity}</span>
                      </div>

                      {candidate.interviewDate && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>{t('client.candidates.interviewDate')}: {candidate.interviewDate}</span>
                          {candidate.interviewType === 'video' && (
                            <Badge variant="secondary" className="mr-2">
                              <Video className="h-3 w-3 ml-1" />
                              {t('client.candidates.videoInterview')}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="space-y-2 pt-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => navigate(`/client/candidates/${candidate.id}`)}
                          >
                            <Eye className="h-4 w-4 ml-2" />
                            {t('client.candidates.actions.view')}
                          </Button>
                          {candidate.interviewDate && candidate.interviewType === 'video' && candidate.agoraChannelName && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleVideoCall(candidate)}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`mailto:${candidate.email}`)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`tel:${candidate.phone}`)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, "مراجعة")}>
                                {t('client.candidates.actions.markAsReview')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, "مقابلة")}>
                                {t('client.candidates.actions.inviteToInterview')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, "مقبول")}>
                                {t('client.candidates.actions.accept')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, "مرفوض")}>
                                {t('client.candidates.actions.reject')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Feedback Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleFeedback(candidate, 'positive')}
                          >
                            <ThumbsUp className="h-4 w-4 ml-2" />
                            {t('client.candidates.actions.positiveFeedback')}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleFeedback(candidate, 'negative')}
                          >
                            <ThumbsDown className="h-4 w-4 ml-2" />
                            {t('client.candidates.actions.negativeFeedback')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            {!loading && filteredCandidates.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('client.candidates.noCandidates.title')}</h3>
                  <p className="text-muted-foreground">{t('client.candidates.noCandidates.description')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {feedbackType === 'positive' ? t('client.candidates.feedback.positiveTitle') : t('client.candidates.feedback.negativeTitle')} - {selectedCandidate?.name}
              </DialogTitle>
              <DialogDescription>
                {t('client.candidates.feedback.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                {feedbackType === 'positive' ? (
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">{selectedCandidate?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCandidate?.position}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('client.candidates.feedback.textLabel')}:</label>
                <Textarea
                  placeholder={feedbackType === 'positive' ? t('client.candidates.feedback.positivePlaceholder') : t('client.candidates.feedback.negativePlaceholder')}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setFeedbackDialog(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={submitFeedback}
                  disabled={!feedbackText.trim()}
                  className={feedbackType === 'positive' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  <Send className="h-4 w-4 ml-2" />
                  {t('client.candidates.feedback.submit')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
      </div>
    </MainLayout>
  )
}

export default ClientCandidates