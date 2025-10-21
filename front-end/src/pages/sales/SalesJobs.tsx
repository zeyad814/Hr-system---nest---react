import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Briefcase, MapPin, Calendar, DollarSign, Users, Building2, Eye, Edit, Trash2, Clock } from "lucide-react";
import { salesApiService, SalesJob, CreateSalesJobDto } from "@/services/salesApi";
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

// Using SalesJob interface from salesApi

// Removed mock data - will use API data

const SalesJobs = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<SalesJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<SalesJob | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await salesApiService.getJobs();
      setJobs(response.jobs);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل الوظائف');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (jobData: CreateSalesJobDto) => {
    try {
      await salesApiService.createJob(jobData);
      toast.success('تم إضافة الوظيفة بنجاح');
      setIsAddDialogOpen(false);
      fetchJobs();
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('فشل في إضافة الوظيفة');
    }
  };

  const handleUpdateJob = async (id: string, jobData: Partial<SalesJob>) => {
    try {
      await salesApiService.updateJob(id, jobData);
      toast.success('تم تحديث الوظيفة بنجاح');
      fetchJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('فشل في تحديث الوظيفة');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) {
      try {
        await salesApiService.deleteJob(id);
        toast.success('تم حذف الوظيفة بنجاح');
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('فشل في حذف الوظيفة');
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesClient = clientFilter === 'all' || job.client?.name === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'نشط';
      case 'PAUSED': return 'متوقف';
      case 'CLOSED': return 'مغلق';
      case 'DRAFT': return 'مسودة';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'دوام كامل';
      case 'PART_TIME': return 'دوام جزئي';
      case 'CONTRACT': return 'عقد';
      case 'REMOTE': return 'عن بُعد';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'bg-blue-100 text-blue-800';
      case 'PART_TIME': return 'bg-purple-100 text-purple-800';
      case 'CONTRACT': return 'bg-orange-100 text-orange-800';
      case 'REMOTE': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const totalCandidates = filteredJobs.reduce((sum, job) => sum + (job.candidates || 0), 0);
  const totalApplications = filteredJobs.reduce((sum, job) => sum + (job.applications || 0), 0);
  const totalCommission = filteredJobs.reduce((sum, job) => sum + (job.commission || 0), 0);

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('sales.jobs.title')}</h1>
            <p className="text-muted-foreground">{t('sales.jobs.subtitle')}</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('sales.jobs.addNewJob')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t('sales.jobs.addNewJob')}</DialogTitle>
                <DialogDescription>
                  {t('sales.jobs.addJobDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('sales.jobs.form.title')}</Label>
                  <Input id="title" placeholder={t('sales.jobs.form.titlePlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">{t('sales.jobs.form.client')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('sales.jobs.form.clientPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech-advanced">شركة التقنية المتقدمة</SelectItem>
                      <SelectItem value="gulf-investment">مجموعة الخليج للاستثمار</SelectItem>
                      <SelectItem value="modern-build">شركة البناء الحديث</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">{t('sales.jobs.form.department')}</Label>
                  <Input id="department" placeholder={t('sales.jobs.form.departmentPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t('sales.jobs.form.location')}</Label>
                  <Input id="location" placeholder={t('sales.jobs.form.locationPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('sales.jobs.form.type')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('sales.jobs.form.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">{t('sales.jobs.types.fullTime')}</SelectItem>
                      <SelectItem value="part-time">{t('sales.jobs.types.partTime')}</SelectItem>
                      <SelectItem value="contract">{t('sales.jobs.types.contract')}</SelectItem>
                      <SelectItem value="remote">{t('sales.jobs.types.remote')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">{t('sales.jobs.form.deadline')}</Label>
                  <Input id="deadline" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary-min">{t('sales.jobs.form.salaryMin')}</Label>
                  <Input id="salary-min" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary-max">{t('sales.jobs.form.salaryMax')}</Label>
                  <Input id="salary-max" type="number" placeholder="0" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">{t('sales.jobs.form.description')}</Label>
                  <Textarea id="description" placeholder={t('sales.jobs.form.descriptionPlaceholder')} rows={4} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t('sales.jobs.form.cancel')}
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  {t('sales.jobs.form.add')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t('sales.jobs.totalJobs')}</p>
                  <p className="text-xl sm:text-2xl font-bold">{filteredJobs.length}</p>
                </div>
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t('sales.jobs.totalCandidates')}</p>
                  <p className="text-xl sm:text-2xl font-bold">{totalCandidates}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t('sales.jobs.totalApplications')}</p>
                  <p className="text-xl sm:text-2xl font-bold">{totalApplications}</p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t('sales.jobs.totalCommission')}</p>
                  <p className="text-xl sm:text-2xl font-bold">{totalCommission.toLocaleString()} {t('common.currency')}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <div className="flex-1 min-w-[250px] sm:min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('sales.jobs.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t('sales.jobs.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('sales.jobs.status.all')}</SelectItem>
                <SelectItem value="ACTIVE">{t('sales.jobs.status.active')}</SelectItem>
                <SelectItem value="PAUSED">{t('sales.jobs.status.paused')}</SelectItem>
                <SelectItem value="CLOSED">{t('sales.jobs.status.closed')}</SelectItem>
                <SelectItem value="DRAFT">{t('sales.jobs.status.draft')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t('sales.jobs.filterByClient')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('sales.jobs.client.all')}</SelectItem>
                {Array.from(new Set(jobs.map(job => job.client?.name).filter(Boolean))).map(client => (
                  <SelectItem key={client} value={client!}>{client}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t('sales.jobs.filterByType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('sales.jobs.type.all')}</SelectItem>
                <SelectItem value="FULL_TIME">{t('sales.jobs.types.fullTime')}</SelectItem>
                <SelectItem value="PART_TIME">{t('sales.jobs.types.partTime')}</SelectItem>
                <SelectItem value="CONTRACT">{t('sales.jobs.types.contract')}</SelectItem>
                <SelectItem value="REMOTE">{t('sales.jobs.types.remote')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-2">جاري التحميل...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>حدث خطأ في تحميل البيانات: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg truncate">{job.title}</CardTitle>
                      <CardDescription className="text-sm truncate">{job.client?.name}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(job.status)} text-xs whitespace-nowrap`}>
                    {getStatusText(job.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{job.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{job.salary || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">ينتهي في: {job.deadline || 'غير محدد'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600">المرشحين</div>
                    <div className="font-semibold text-base sm:text-lg">{job.candidates || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600">التطبيقات</div>
                    <div className="font-semibold text-base sm:text-lg">{job.applications || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600">تم التوظيف</div>
                    <div className="font-semibold text-base sm:text-lg">{job.hired || 0}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm" onClick={() => setSelectedJob(job)}>
                        <Eye className="h-4 w-4 mr-1" />
                        عرض
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>تفاصيل الوظيفة</DialogTitle>
                      </DialogHeader>
                      {selectedJob && (
                        <Tabs defaultValue="info" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1">
                            <TabsTrigger value="info" className="text-xs sm:text-sm">المعلومات</TabsTrigger>
                            <TabsTrigger value="requirements" className="text-xs sm:text-sm">المتطلبات</TabsTrigger>
                            <TabsTrigger value="candidates" className="text-xs sm:text-sm">المرشحين</TabsTrigger>
                            <TabsTrigger value="applications" className="text-xs sm:text-sm">التقديمات</TabsTrigger>
                            <TabsTrigger value="stats" className="text-xs sm:text-sm">الإحصائيات</TabsTrigger>
                          </TabsList>
                          <TabsContent value="info" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <Label className="text-sm">عنوان الوظيفة</Label>
                                <p className="text-xs sm:text-sm text-gray-600">{selectedJob.title}</p>
                              </div>
                              <div>
                                <Label className="text-sm">العميل</Label>
                                <p className="text-xs sm:text-sm text-gray-600">{selectedJob.client?.name}</p>
                              </div>
                              <div>
                                <Label className="text-sm">القسم</Label>
                                <p className="text-xs sm:text-sm text-gray-600">{selectedJob.department}</p>
                              </div>
                              <div>
                                <Label className="text-sm">الموقع</Label>
                                <p className="text-xs sm:text-sm text-gray-600">{selectedJob.location}</p>
                              </div>
                              <div>
                                <Label className="text-sm">نوع الوظيفة</Label>
                                <p className="text-xs sm:text-sm text-gray-600">{getTypeText(selectedJob.type)}</p>
                              </div>
                              <div>
                                <Label className="text-sm">الراتب</Label>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {selectedJob.salary || 'غير محدد'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm">وصف الوظيفة</Label>
                              <p className="text-xs sm:text-sm text-gray-600">{selectedJob.description}</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="requirements">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm">المتطلبات</Label>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {selectedJob.requirements || 'لا توجد متطلبات محددة'}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm">المزايا</Label>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {selectedJob.benefits || 'لا توجد مزايا محددة'}
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="candidates">
                            <p className="text-center text-gray-500 py-8">سيتم عرض قائمة المرشحين هنا</p>
                          </TabsContent>
                          <TabsContent value="applications" className="space-y-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">التقديمات ({selectedJob.applications || 0})</h3>
                                <Badge variant="outline">{selectedJob.applications || 0} متقدم</Badge>
                              </div>
                              <div className="border rounded-lg overflow-x-auto">
                                <div className="grid grid-cols-5 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 font-medium text-xs sm:text-sm min-w-[600px] sm:min-w-0">
                                  <div>اسم المتقدم</div>
                                  <div>تاريخ التقديم</div>
                                  <div>الخبرة</div>
                                  <div>الحالة</div>
                                  <div>الإجراءات</div>
                                </div>
                                {/* Mock applications data */}
                                {[
                                  { id: 1, name: 'أحمد محمد', date: '2024-01-15', experience: '5 سنوات', status: 'pending' },
                                  { id: 2, name: 'فاطمة علي', date: '2024-01-14', experience: '3 سنوات', status: 'reviewed' },
                                  { id: 3, name: 'محمد حسن', date: '2024-01-13', experience: '7 سنوات', status: 'accepted' },
                                  { id: 4, name: 'سارة أحمد', date: '2024-01-12', experience: '4 سنوات', status: 'rejected' }
                                ].map((application) => (
                                  <div key={application.id} className="grid grid-cols-5 gap-2 sm:gap-4 p-3 sm:p-4 border-t text-xs sm:text-sm min-w-[600px] sm:min-w-0">
                                    <div className="font-medium truncate">{application.name}</div>
                                    <div className="text-gray-600 truncate">{application.date}</div>
                                    <div className="text-gray-600 truncate">{application.experience}</div>
                                    <div>
                                      <Select defaultValue={application.status}>
                                        <SelectTrigger className="w-full text-xs sm:text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                              قيد المراجعة
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="reviewed">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                              تمت المراجعة
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="accepted">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                              مقبول
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="rejected">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                              مرفوض
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                      <Button variant="outline" size="sm" className="text-xs p-1 sm:p-2">
                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                      <Button variant="outline" size="sm" className="text-xs p-1 sm:p-2">
                                        عرض السيرة
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="stats">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <Label className="text-sm">العمولة المتوقعة</Label>
                                <p className="text-xs sm:text-sm text-gray-600">{selectedJob.commission ? selectedJob.commission.toLocaleString() : 'غير محدد'} ر.س</p>
                              </div>
                              <div>
                                <Label className="text-sm">العمولة المحققة</Label>
                                <p className="text-xs sm:text-sm text-gray-600">{((selectedJob.hired || 0) * 1000).toLocaleString()} ر.س</p>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={() => {
                    // TODO: Implement edit functionality
                    toast.info('سيتم إضافة وظيفة التحديث قريباً');
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('sales.jobs.noJobs')}</h3>
            <p className="text-gray-500">{t('sales.jobs.noJobsDescription')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SalesJobs;