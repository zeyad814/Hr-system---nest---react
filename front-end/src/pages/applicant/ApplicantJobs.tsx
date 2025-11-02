import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Building,
  Calendar,
  Heart,
  Send,
  Eye,
  Bookmark,
  Check
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
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
import { Checkbox } from "@/components/ui/checkbox"
import { type Job, applicantApiService } from "@/services/applicantApi"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"

const ApplicantJobs = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")

  const [sortBy, setSortBy] = useState("newest")
  const [savedJobs, setSavedJobs] = useState<string[]>(["1", "3"])
  const [appliedJobs, setAppliedJobs] = useState<string[]>([])
  const [applyingJobs, setApplyingJobs] = useState<string[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [visibleCount, setVisibleCount] = useState(10)
  const [loading, setLoading] = useState(true)


  // Load jobs and current applications from API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [jobsData, apps] = await Promise.all([
          applicantApiService.getAvailableJobs(),
          applicantApiService.getMyApplications().catch(() => [])
        ])
        setJobs(jobsData)
        if (Array.isArray(apps)) {
          setAppliedJobs(apps.map(a => a.jobId))
        }
      } catch (error) {
        console.error('Error loading jobs:', error)
        toast.error(t('applicant.jobs.loadError'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])



  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const handleApplyToJob = async (jobId: string) => {
    if (appliedJobs.includes(jobId) || applyingJobs.includes(jobId)) {
      return
    }

    setApplyingJobs(prev => [...prev, jobId])

    try {
      // Use the jobs controller endpoint for simpler apply
      await applicantApiService.applyToJobByJobId(jobId)
      setAppliedJobs(prev => [...prev, jobId])
      toast.success(t('applicant.jobs.applySuccess'))
    } catch (error) {
      console.error('Error applying to job:', error)
      const message = (error as any)?.response?.data?.message
      toast.error(Array.isArray(message) ? message[0] : (message || t('applicant.jobs.applyError')))
    } finally {
      setApplyingJobs(prev => prev.filter(id => id !== jobId))
    }
  }



  const uniqueLocations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)))

  const parseSalaryRange = (range?: string): { min?: number; max?: number } => {
    if (!range) return {}
    // Examples: "5000 - 7000", "SAR 8,000 – 12,000", "10000+"
    const nums = (range.match(/\d[\d,]*/g) || []).map(n => Number(n.replace(/,/g, "")))
    if (nums.length === 0) return {}
    if (nums.length === 1) return { min: nums[0], max: nums[0] }
    return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) }
  }

  const filteredJobs = jobs.filter(job => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      job.title.toLowerCase().includes(q) ||
      job.client.name.toLowerCase().includes(q)

    if (!matchesSearch) return false

    // Location filter
    if (locationFilter && locationFilter !== '__ALL__' && job.location !== locationFilter) return false

    // Salary filter
    const { min: jobMin, max: jobMax } = parseSalaryRange((job as any).salaryRange)
    const minVal = salaryMin ? Number(salaryMin) : undefined
    const maxVal = salaryMax ? Number(salaryMax) : undefined

    if (minVal !== undefined) {
      // if job has only max or min, treat missing as the other
      const effectiveMax = jobMax ?? jobMin
      if (effectiveMax !== undefined && effectiveMax < minVal) return false
    }
    if (maxVal !== undefined) {
      const effectiveMin = jobMin ?? jobMax
      if (effectiveMin !== undefined && effectiveMin > maxVal) return false
    }

    return true
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  return (
    <MainLayout userRole="applicant">
      <div className="space-y-4 md:space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:justify-between lg:items-start lg:space-y-0">
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('applicant.jobs.title')}</h1>
            <p className="text-muted-foreground text-sm md:text-base">{t('applicant.jobs.subtitle')}</p>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/applicant/saved-jobs")} className="w-full sm:w-auto text-xs md:text-sm">
              <Bookmark className="h-3 w-3 md:h-4 md:w-4 ml-2" />
              {t('applicant.jobs.savedJobs', )} ({ savedJobs.length })
            </Button>
            <Button size="sm" onClick={() => navigate("/applicant/applications")} className="w-full sm:w-auto text-xs md:text-sm">
              <Send className="h-3 w-3 md:h-4 md:w-4 ml-2" />
              {t('applicant.jobs.myApplications')}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 md:pt-6 md:px-6 md:pb-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('applicant.jobs.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-sm md:text-base"
                />
              </div>

              {/* Filters */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="text-xs md:text-sm">
                      <SelectValue placeholder={t('applicant.jobs.sortBy.label')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{t('applicant.jobs.sortBy.newest')}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Location filter */}
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="text-xs md:text-sm">
                      <SelectValue placeholder="المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__ALL__">الكل</SelectItem>
                      {uniqueLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Salary min */}
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="أدنى راتب"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="text-xs md:text-sm"
                  />

                  {/* Salary max */}
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="أقصى راتب"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
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
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">

            </div>

            {/* Jobs List */}
        <div className="space-y-4">
          {sortedJobs.slice(0, visibleCount).map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:pt-6 md:px-6 md:pb-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                      <AvatarImage src="" alt={job.client.name} />
                      <AvatarFallback className="text-xs md:text-sm">{job.client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                            <h3 className="text-base md:text-lg font-semibold truncate">{job.title}</h3>
                            {appliedJobs.includes(job.id) && (
                              <Badge className="bg-green-100 text-green-800 flex-shrink-0 text-xs">
                                <Check className="h-3 w-3 ml-1" />
                                {t('applicant.jobs.applied')}
                              </Badge>
                            )}

                            <Badge 
                              className={`flex-shrink-0 text-xs ${
                                job.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                                job.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                                job.status === 'HIRED' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {job.status === 'OPEN' ? t('applicant.jobs.status.open') :
                               job.status === 'CLOSED' ? t('applicant.jobs.status.closed') :
                               job.status === 'HIRED' ? t('applicant.jobs.status.hired') : job.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground truncate text-sm md:text-base">{job.client.name}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveJob(job.id)}
                            className={`p-1 h-8 w-8 ${savedJobs.includes(job.id) ? "text-red-600" : ""}`}
                          >
                            <Heart className={`h-4 w-4 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-3">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground min-w-0">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="truncate">{t('applicant.jobs.publishDate')}: {new Date(job.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground min-w-0">
                          <Building className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="truncate">{job.client.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/applicant/jobs/${job.id}`)}
                            className="w-full sm:w-auto text-xs md:text-sm"
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4 ml-2" />
                            {t('applicant.jobs.viewDetails')}
                          </Button>
                          {appliedJobs.includes(job.id) ? (
                            <Button 
                              size="sm"
                              disabled
                              className="w-full sm:w-auto text-xs md:text-sm bg-green-600 hover:bg-green-600"
                            >
                              <Check className="h-3 w-3 md:h-4 md:w-4 ml-2" />
                              {t('applicant.jobs.applied')}
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleApplyToJob(job.id)}
                              disabled={applyingJobs.includes(job.id)}
                              className="w-full sm:w-auto text-xs md:text-sm"
                            >
                              <Send className="h-3 w-3 md:h-4 md:w-4 ml-2" />
                              {applyingJobs.includes(job.id) ? t('applicant.jobs.applying') : t('applicant.jobs.applyNow')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

            {/* Load More */}
            {sortedJobs.length > visibleCount && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => setVisibleCount((c) => c + 10)}
                >
                  {t('applicant.jobs.loadMore')}
                </Button>
              </div>
            )}

            {/* No Results */}
            {sortedJobs.length === 0 && (
              <Card>
                <CardContent className="p-4 md:pt-6 md:px-6 md:pb-6 text-center">
                  <div className="py-6 md:py-8">
                    <Search className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-semibold mb-2">{t('applicant.jobs.noJobsFound')}</h3>
                    <p className="text-muted-foreground mb-4 text-sm md:text-base">
                      {t('applicant.jobs.noJobsFoundDescription')}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setSearchTerm("")
                      }}
                    >
                      {t('applicant.jobs.resetFilters')}
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

export default ApplicantJobs