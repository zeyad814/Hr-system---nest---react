import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { MainLayout } from '@/components/layout/MainLayout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Eye, Edit, Users, MoreHorizontal, Briefcase, MapPin, Calendar, DollarSign, X } from 'lucide-react'
import { clientApiService } from '@/services/clientApi'
import { useLanguage } from '@/contexts/LanguageContext'

// No mock data - using real backend data only

const ClientJobs = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    locationLink: '',
    jobType: '',
    department: '',
    experienceLevel: '',
    remoteWorkAvailable: false,
    description: '',
    requirements: '',
    requiredSkills: '',
    salaryRange: '',
    applicationDeadline: ''
  })

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await clientApiService.getClientJobs()
      // The backend returns { jobs: [...], pagination: {...} }
      // So we need to access the jobs property
      const jobsData = response.jobs || []
      // Format the data to match the expected structure
      const formattedJobs = jobsData.map((job: any) => ({
        ...job,
        department: job.department || job.location,
        applicationsCount: job._count?.applications || 0,
        createdDate: job.createdAt ? new Date(job.createdAt).toLocaleDateString('ar-SA') : '',
        status: job.status === 'OPEN' ? 'نشط' : job.status === 'CLOSED' ? 'مغلق' : job.status
      }))
      setJobs(formattedJobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: t('common.error'),
        description: t('client.jobs.errors.fetchFailed'),
        variant: "destructive"
      })
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.jobType || !newJob.description || !newJob.requirements || !newJob.salaryRange || !newJob.applicationDeadline) {
      toast({ 
        title: t('common.validation.incompleteData'), 
        description: t('common.validation.fillRequired'), 
        variant: "destructive" 
      })
      return
    }

    try {
      const jobData = {
        ...newJob,
        remoteWorkAvailable: newJob.remoteWorkAvailable || false,
        applicationDeadline: new Date(newJob.applicationDeadline).toISOString()
      }
      
      const createdJob = await clientApiService.createClientJob(jobData)
      setJobs(prev => [{
        ...createdJob,
        department: createdJob.department || createdJob.location,
        applicationsCount: 0,
        createdDate: new Date().toLocaleDateString('ar-SA'),
        status: 'نشط'
      }, ...prev])
      setShowAddDialog(false)
      setNewJob({
        title: '',
        company: '',
        location: '',
        locationLink: '',
        jobType: '',
        department: '',
        experienceLevel: '',
        remoteWorkAvailable: false,
        description: '',
        requirements: '',
        requiredSkills: '',
        salaryRange: '',
        applicationDeadline: ''
      })
      toast({ title: t('common.success'), description: t('client.jobs.success.created') })
    } catch (e) {
      toast({ title: t('common.error'), description: t('client.jobs.errors.createFailed'), variant: "destructive" })
    }
  }

  const changeStatus = async (jobId: string, status: "OPEN" | "CLOSED" | "HIRED") => {
    try {
      await clientApiService.changeJobStatus(jobId, status)
      const arabicStatus = status === 'OPEN' ? 'نشط' : status === 'CLOSED' ? 'مغلق' : status === 'HIRED' ? 'تم التوظيف' : status
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: arabicStatus } : j))
      toast({ title: "تم التحديث", description: "تم تغيير حالة الوظيفة" })
    } catch (e) {
      toast({ title: "فشل التحديث", description: "تعذر تغيير الحالة", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'نشط':
        return 'bg-green-100 text-green-800'
      case 'CLOSED':
      case 'مغلق':
        return 'bg-red-100 text-red-800'
      case 'HIRED':
      case 'تم التوظيف':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  return (
    <MainLayout userRole="client">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('client.jobs.title')}</h1>
            <p className="text-muted-foreground">{t('client.jobs.subtitle')}</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                {t('client.jobs.actions.requestNew')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('client.jobs.dialog.title')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('client.jobs.form.title')}</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('client.jobs.form.titlePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">{t('client.jobs.form.company')}</Label>
                    <Input
                      id="company"
                      value={newJob.company}
                      onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                      placeholder={t('client.jobs.form.companyPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('client.jobs.form.location')}</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                      placeholder={t('client.jobs.form.locationPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationLink">رابط الموقع</Label>
                    <Input
                      id="locationLink"
                      value={newJob.locationLink}
                      onChange={(e) => setNewJob(prev => ({ ...prev, locationLink: e.target.value }))}
                      placeholder="رابط خرائط جوجل (اختياري)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobType">{t('client.jobs.form.jobType')}</Label>
                    <Select value={newJob.jobType} onValueChange={(value) => setNewJob(prev => ({ ...prev, jobType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('client.jobs.form.jobTypePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">{t('client.jobs.jobTypes.fullTime')}</SelectItem>
                        <SelectItem value="PART_TIME">{t('client.jobs.jobTypes.partTime')}</SelectItem>
                        <SelectItem value="CONTRACT">{t('client.jobs.jobTypes.contract')}</SelectItem>
                        <SelectItem value="TEMPORARY">{t('client.jobs.jobTypes.temporary')}</SelectItem>
                        <SelectItem value="INTERNSHIP">{t('client.jobs.jobTypes.internship')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">القسم</Label>
                    <Select value={newJob.department} onValueChange={(value) => setNewJob(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                        <SelectItem value="التصميم">التصميم</SelectItem>
                        <SelectItem value="المالية">المالية</SelectItem>
                        <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                        <SelectItem value="التسويق">التسويق</SelectItem>
                        <SelectItem value="المبيعات">المبيعات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">مستوى الخبرة</Label>
                    <Select value={newJob.experienceLevel} onValueChange={(value) => setNewJob(prev => ({ ...prev, experienceLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مستوى الخبرة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مبتدئ">مبتدئ (0-2 سنة)</SelectItem>
                        <SelectItem value="متوسط">متوسط (2-5 سنوات)</SelectItem>
                        <SelectItem value="متقدم">متقدم (5-10 سنوات)</SelectItem>
                        <SelectItem value="خبير">خبير (+10 سنوات)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryRange">{t('client.jobs.form.salaryRange')}</Label>
                    <Input
                      id="salaryRange"
                      value={newJob.salaryRange}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salaryRange: e.target.value }))}
                      placeholder={t('client.jobs.form.salaryRangePlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">{t('client.jobs.form.applicationDeadline')}</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={newJob.applicationDeadline}
                    onChange={(e) => setNewJob(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t('client.jobs.form.description')}</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('client.jobs.form.descriptionPlaceholder')}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requirements">{t('client.jobs.form.requirements')}</Label>
                  <Textarea
                    id="requirements"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder={t('client.jobs.form.requirementsPlaceholder')}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredSkills">المهارات المطلوبة</Label>
                  <Input
                    id="requiredSkills"
                    value={newJob.requiredSkills}
                    onChange={(e) => setNewJob(prev => ({ ...prev, requiredSkills: e.target.value }))}
                    placeholder="مثال: React Native, Flutter, JavaScript, TypeScript"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remoteWorkAvailable"
                    checked={newJob.remoteWorkAvailable}
                    onChange={(e) => setNewJob(prev => ({ ...prev, remoteWorkAvailable: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="remoteWorkAvailable">العمل عن بُعد متاح</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAddJob}>
                  {t('client.jobs.actions.add')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('client.jobs.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('client.jobs.filters.statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('client.jobs.filters.allStatuses')}</SelectItem>
              <SelectItem value="OPEN">{t('client.jobs.status.open')}</SelectItem>
              <SelectItem value="CLOSED">{t('client.jobs.status.closed')}</SelectItem>
              <SelectItem value="HIRED">{t('client.jobs.status.filled')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('client.jobs.filters.departmentPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('client.jobs.filters.allDepartments')}</SelectItem>
              <SelectItem value="تقنية المعلومات">{t('client.jobs.departments.it')}</SelectItem>
              <SelectItem value="التصميم">{t('client.jobs.departments.design')}</SelectItem>
              <SelectItem value="المالية">{t('client.jobs.departments.finance')}</SelectItem>
              <SelectItem value="الموارد البشرية">{t('client.jobs.departments.hr')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{job.company}</span>
                        {job.department && (
                          <>
                            <span>•</span>
                            <span>{job.department}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                        {job.remoteWorkAvailable && (
                          <Badge variant="outline" className="text-xs ml-2">
                            {t('client.jobs.remote')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status === 'OPEN' ? t('client.jobs.status.open') : job.status === 'CLOSED' ? t('client.jobs.status.closed') : t('client.jobs.status.filled')}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => changeStatus(job.id, 'OPEN')}>
                            {t('client.jobs.actions.activate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeStatus(job.id, 'CLOSED')}>
                            {t('client.jobs.actions.close')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeStatus(job.id, 'HIRED')}>
                            {t('client.jobs.actions.markHired')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      <span>{job.jobType === 'FULL_TIME' ? t('client.jobs.jobTypes.fullTime') : job.jobType === 'PART_TIME' ? t('client.jobs.jobTypes.partTime') : job.jobType === 'CONTRACT' ? t('client.jobs.jobTypes.contract') : job.jobType === 'TEMPORARY' ? t('client.jobs.jobTypes.temporary') : job.jobType === 'INTERNSHIP' ? t('client.jobs.jobTypes.internship') : job.jobType}</span>
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>{job.salaryRange}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('ar-SA') : new Date(job.createdAt).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {job.applications?.length || 0} مرشح
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills && job.requiredSkills.split(',').slice(0, 2).map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                    {job.requiredSkills && job.requiredSkills.split(',').length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.requiredSkills.split(',').length - 2} المزيد
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <div className="flex gap-2 p-6 pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/client/jobs/${job.id}/candidates`)}
                  >
                    <Users className="h-4 w-4 ml-2" />
                    {t('client.jobs.actions.viewCandidates')}
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/client/jobs/${job.id}`)}
                  >
                    <Eye className="h-4 w-4 ml-2" />
                    {t('client.jobs.actions.details')}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {!loading && filteredJobs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('client.jobs.noJobs.title')}</h3>
              <p className="text-muted-foreground mb-4">{t('client.jobs.noJobs.description')}</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 ml-2" />
                {t('client.jobs.actions.requestNew')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

export default ClientJobs