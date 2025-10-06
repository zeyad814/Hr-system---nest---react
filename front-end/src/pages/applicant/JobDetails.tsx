import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowRight, 
  Building,
  Calendar,
  Heart,
  Send,
  MapPin,
  Clock,
  Users,
  Check,
  Bookmark
} from "lucide-react"
import { MainLayout } from "@/components/layout/MainLayout"
import { type Job, applicantApiService } from "@/services/applicantApi"
import { toast } from "sonner"

const JobDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load job details
  useEffect(() => {
    const loadJobDetails = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        // Note: We need to add this endpoint to the API service
        const data = await applicantApiService.getJobById(id)
        setJob(data)
      } catch (error) {
        console.error('Error loading job details:', error)
        toast.error('فشل في تحميل تفاصيل الوظيفة')
        navigate('/applicant/jobs')
      } finally {
        setLoading(false)
      }
    }

    loadJobDetails()
  }, [id, navigate])

  const handleApplyToJob = async () => {
    if (!job || applied || applying) return

    setApplying(true)
    try {
      await applicantApiService.applyToJob({ jobId: job.id })
      setApplied(true)
      toast.success('تم التقديم بنجاح! سيتم التواصل معك قريباً')
    } catch (error) {
      console.error('Error applying to job:', error)
      toast.error('فشل التقديم، يرجى المحاولة مرة أخرى')
    } finally {
      setApplying(false)
    }
  }

  const toggleSaveJob = () => {
    setSaved(!saved)
    toast.success(saved ? 'تم إلغاء حفظ الوظيفة' : 'تم حفظ الوظيفة')
  }

  if (loading) {
    return (
      <MainLayout userRole="applicant">
        <div className="space-y-6" dir="rtl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!job) {
    return (
      <MainLayout userRole="applicant">
        <div className="text-center py-12" dir="rtl">
          <h2 className="text-2xl font-bold mb-4">الوظيفة غير موجودة</h2>
          <p className="text-muted-foreground mb-6">لم يتم العثور على الوظيفة المطلوبة</p>
          <Button onClick={() => navigate('/applicant/jobs')}>العودة للوظائف</Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout userRole="applicant">
      <div className="space-y-6" dir="rtl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/applicant/jobs')}
          className="mb-4"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للوظائف
        </Button>

        {/* Job Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={job.client.name} />
                <AvatarFallback className="text-lg">{job.client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Building className="h-4 w-4" />
                      <span>{job.client.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSaveJob}
                      className={saved ? "text-red-600" : ""}
                    >
                      <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                    </Button>
                    
                    <Badge 
                      className={`${
                        job.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                        job.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                        job.status === 'HIRED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.status === 'OPEN' ? 'مفتوحة' :
                       job.status === 'CLOSED' ? 'مغلقة' :
                       job.status === 'HIRED' ? 'تم التوظيف' : job.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ النشر: {new Date(job.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {applied ? (
                    <Button disabled className="bg-green-600 hover:bg-green-600">
                      <Check className="h-4 w-4 ml-2" />
                      تم التقديم
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleApplyToJob}
                      disabled={applying || job.status !== 'OPEN'}
                      className="min-w-[120px]"
                    >
                      <Send className="h-4 w-4 ml-2" />
                      {applying ? "جاري التقديم..." : "تقديم الآن"}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={toggleSaveJob}
                  >
                    <Bookmark className="h-4 w-4 ml-2" />
                    {saved ? "محفوظة" : "حفظ الوظيفة"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader>
            <CardTitle>وصف الوظيفة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {job.description || 'لا يوجد وصف متاح لهذه الوظيفة.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الشركة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={job.client.name} />
                <AvatarFallback>{job.client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold mb-1">{job.client.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  شركة رائدة في مجال الأعمال
                </p>
                
                {job.client.email && (
                  <div className="text-sm text-muted-foreground">
                    البريد الإلكتروني: {job.client.email}
                  </div>
                )}
                
                {job.client.phone && (
                  <div className="text-sm text-muted-foreground">
                    الهاتف: {job.client.phone}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>تعليمات التقديم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>تأكد من اكتمال ملفك الشخصي قبل التقديم</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>سيتم مراجعة طلبك خلال 3-5 أيام عمل</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>في حالة القبول المبدئي، سيتم التواصل معك لترتيب مقابلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default JobDetails