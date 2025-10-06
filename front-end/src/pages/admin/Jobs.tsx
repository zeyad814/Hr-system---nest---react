import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Briefcase, Plus, Search, MoreHorizontal, Building2, Edit, Trash2, Eye } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  locationLink?: string;
  jobType: string;
  department?: string;
  experienceLevel?: string;
  remoteWorkAvailable?: boolean;
  description: string;
  requirements: string;
  requiredSkills?: string;
  salaryRange: string;
  applicationDeadline: string;
  status: "OPEN" | "CLOSED" | "HIRED";
  clientId: string;
  client?: { id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
};

type JobFormData = {
  title: string;
  company: string;
  location: string;
  locationLink: string;
  jobType: string;
  department: string;
  experienceLevel: string;
  remoteWorkAvailable: boolean;
  description: string;
  requirements: string;
  requiredSkills: string;
  salaryRange: string;
  applicationDeadline: string;
  clientId: string;
};

const AdminJobs = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [clients, setClients] = useState<Array<{ id: string; name?: string }>>([]);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    company: "",
    location: "",
    locationLink: "",
    jobType: "FULL_TIME",
    department: "",
    experienceLevel: "ENTRY",
    remoteWorkAvailable: false,
    description: "",
    requirements: "",
    requiredSkills: "",
    salaryRange: "",
    applicationDeadline: "",
    clientId: ""
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Job[]>("/jobs");
      setJobs(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadClients = async () => {
    try {
      const res = await api.get<Array<{ id: string; name?: string }>>("/clients");
      setClients(res.data ?? []);
    } catch {}
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      locationLink: "",
      jobType: "FULL_TIME",
      department: "",
      experienceLevel: "ENTRY",
      remoteWorkAvailable: false,
      description: "",
      requirements: "",
      requiredSkills: "",
      salaryRange: "",
      applicationDeadline: "",
      clientId: ""
    });
  };

  const openAdd = async () => {
    resetForm();
    await loadClients();
    setIsAddOpen(true);
  };

  const openEdit = async (job: Job) => {
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      locationLink: job.locationLink || "",
      jobType: job.jobType,
      department: job.department || "",
      experienceLevel: job.experienceLevel || "ENTRY",
      remoteWorkAvailable: job.remoteWorkAvailable || false,
      description: job.description,
      requirements: job.requirements,
      requiredSkills: job.requiredSkills || "",
      salaryRange: job.salaryRange,
      applicationDeadline: job.applicationDeadline.split('T')[0],
      clientId: job.clientId
    });
    setSelectedJob(job);
    await loadClients();
    setIsEditOpen(true);
  };

  const openView = (job: Job) => {
    setSelectedJob(job);
    setIsViewOpen(true);
  };

  const submitAdd = async () => {
    if (!formData.title || !formData.company || !formData.location || !formData.description || !formData.requirements || !formData.salaryRange || !formData.applicationDeadline || !formData.clientId) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    try {
      await api.post("/jobs", {
        ...formData,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString()
      });
      setIsAddOpen(false);
      toast({ title: "تمت الإضافة", description: "تم إنشاء الوظيفة بنجاح" });
      load();
    } catch (e) {
      toast({ title: "فشل الإضافة", description: "تعذر إنشاء الوظيفة", variant: "destructive" });
    }
  };

  const submitEdit = async () => {
    if (!selectedJob || !formData.title || !formData.company || !formData.location || !formData.description || !formData.requirements || !formData.salaryRange || !formData.applicationDeadline) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    try {
      await api.put(`/jobs/${selectedJob.id}`, {
        ...formData,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString()
      });
      setIsEditOpen(false);
      toast({ title: "تم التحديث", description: "تم تحديث الوظيفة بنجاح" });
      load();
    } catch (e) {
      toast({ title: "فشل التحديث", description: "تعذر تحديث الوظيفة", variant: "destructive" });
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast({ title: "تم الحذف", description: "تم حذف الوظيفة بنجاح" });
      load();
    } catch (e) {
      toast({ title: t('common.error'), description: t('admin.jobs.deleteFailed'), variant: "destructive" });
    }
  };

  const changeStatus = async (jobId: string, status: Job["status"]) => {
    try {
      await api.patch(`/jobs/${jobId}/status`, { status });
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
      toast({ title: t('common.success'), description: t('admin.jobs.statusUpdated') });
    } catch (e) {
      toast({ title: t('common.error'), description: t('admin.jobs.statusUpdateFailed'), variant: "destructive" });
    }
  };

  const filtered = jobs.filter((j) => 
    j.title?.toLowerCase().includes(query.toLowerCase()) ||
    j.company?.toLowerCase().includes(query.toLowerCase()) ||
    j.location?.toLowerCase().includes(query.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-secondary text-secondary-foreground";
      case "CLOSED":
        return "bg-destructive text-destructive-foreground";
      case "HIRED":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const JobFormFields = () => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('admin.jobs.jobTitle')} *</Label>
          <Input 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            placeholder={t('admin.jobs.jobTitlePlaceholder')} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('admin.jobs.company')} *</Label>
          <Input 
            value={formData.company} 
            onChange={(e) => setFormData({...formData, company: e.target.value})} 
            placeholder={t('admin.jobs.companyPlaceholder')} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('admin.jobs.location')} *</Label>
          <Input 
            value={formData.location} 
            onChange={(e) => setFormData({...formData, location: e.target.value})} 
            placeholder={t('admin.jobs.locationPlaceholder')} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('admin.jobs.locationLink')}</Label>
          <Input 
            value={formData.locationLink} 
            onChange={(e) => setFormData({...formData, locationLink: e.target.value})} 
            placeholder={t('admin.jobs.locationLinkPlaceholder')} 
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{t('admin.jobs.jobType')} *</Label>
          <Select value={formData.jobType} onValueChange={(value) => setFormData({...formData, jobType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">{t('admin.jobs.fullTime')}</SelectItem>
              <SelectItem value="PART_TIME">{t('admin.jobs.partTime')}</SelectItem>
              <SelectItem value="CONTRACT">{t('admin.jobs.contract')}</SelectItem>
              <SelectItem value="FREELANCE">{t('admin.jobs.freelance')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('admin.jobs.department')}</Label>
          <Input 
            value={formData.department} 
            onChange={(e) => setFormData({...formData, department: e.target.value})} 
            placeholder={t('admin.jobs.departmentPlaceholder')} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('admin.jobs.experienceLevel')}</Label>
          <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({...formData, experienceLevel: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENTRY">مبتدئ</SelectItem>
              <SelectItem value="MID">متوسط</SelectItem>
              <SelectItem value="SENIOR">خبير</SelectItem>
              <SelectItem value="LEAD">قائد فريق</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remote" 
          checked={formData.remoteWorkAvailable} 
          onCheckedChange={(checked) => setFormData({...formData, remoteWorkAvailable: !!checked})} 
        />
        <Label htmlFor="remote">العمل عن بُعد متاح</Label>
      </div>

      <div className="space-y-2">
        <Label>وصف الوظيفة *</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          placeholder="وصف تفصيلي للوظيفة..." 
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>المتطلبات *</Label>
        <Textarea 
          value={formData.requirements} 
          onChange={(e) => setFormData({...formData, requirements: e.target.value})} 
          placeholder="المتطلبات والمؤهلات المطلوبة..." 
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>المهارات المطلوبة</Label>
        <Textarea 
          value={formData.requiredSkills} 
          onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} 
          placeholder="JavaScript, React, Node.js..." 
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('admin.jobs.salaryRange')} *</Label>
          <Input 
            value={formData.salaryRange} 
            onChange={(e) => setFormData({...formData, salaryRange: e.target.value})} 
            placeholder={t('admin.jobs.salaryRangePlaceholder')} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('admin.jobs.applicationDeadline')} *</Label>
          <Input 
            type="date" 
            value={formData.applicationDeadline} 
            onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('admin.jobs.client')} *</Label>
        <Select value={formData.clientId} onValueChange={(value) => setFormData({...formData, clientId: value})}>
          <SelectTrigger>
            <SelectValue placeholder={t('admin.jobs.selectClient')} />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name || c.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <MainLayout userRole="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{t('admin.jobs.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t('admin.jobs.subtitle')}</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1 sm:gap-2 text-sm sm:text-base w-full sm:w-auto" onClick={openAdd} disabled={loading}>
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('admin.jobs.addJob')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('admin.jobs.addNewJob')}</DialogTitle>
              </DialogHeader>
              <JobFormFields />
              <DialogFooter>
                <Button onClick={submitAdd}>{t('admin.jobs.saveJob')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('admin.jobs.editJob')}</DialogTitle>
            </DialogHeader>
            <JobFormFields />
            <DialogFooter>
              <Button onClick={submitEdit}>{t('admin.jobs.saveChanges')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('admin.jobs.jobDetails')}</DialogTitle>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>{t('admin.jobs.jobTitle')}:</strong> {selectedJob.title}</div>
                  <div><strong>{t('admin.jobs.company')}:</strong> {selectedJob.company}</div>
                  <div><strong>{t('admin.jobs.location')}:</strong> {selectedJob.location}</div>
                  <div><strong>{t('admin.jobs.jobType')}:</strong> {selectedJob.jobType}</div>
                  <div><strong>{t('admin.jobs.department')}:</strong> {selectedJob.department || t('common.notSpecified')}</div>
                  <div><strong>{t('admin.jobs.experienceLevel')}:</strong> {selectedJob.experienceLevel || t('common.notSpecified')}</div>
                  <div><strong>{t('admin.jobs.remoteWork')}:</strong> {selectedJob.remoteWorkAvailable ? t('admin.jobs.available') : t('admin.jobs.notAvailable')}</div>
                  <div><strong>{t('admin.jobs.salaryRange')}:</strong> {selectedJob.salaryRange}</div>
                </div>
                <div><strong>{t('admin.jobs.description')}:</strong><br/>{selectedJob.description}</div>
                <div><strong>{t('admin.jobs.requirements')}:</strong><br/>{selectedJob.requirements}</div>
                {selectedJob.requiredSkills && <div><strong>{t('admin.jobs.skills')}:</strong><br/>{selectedJob.requiredSkills}</div>}
                <div><strong>{t('admin.jobs.applicationDeadline')}:</strong> {new Date(selectedJob.applicationDeadline).toLocaleDateString('ar-SA')}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="relative max-w-full sm:max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
              <Input 
                placeholder={t('admin.jobs.searchPlaceholder')} 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="pr-10 text-sm sm:text-base" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="break-words">{t('admin.jobs.jobsList')} {loading ? `(${t('admin.jobs.loading')})` : `(${filtered.length})`}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2 lg:p-4 text-xs sm:text-sm">{t('admin.jobs.jobTitle')}</th>
                    <th className="text-right p-2 lg:p-4 text-xs sm:text-sm hidden lg:table-cell">{t('admin.jobs.company')}</th>
                    <th className="text-right p-2 lg:p-4 text-xs sm:text-sm hidden md:table-cell">{t('admin.jobs.location')}</th>
                    <th className="text-right p-2 lg:p-4 text-xs sm:text-sm">{t('admin.jobs.jobType')}</th>
                    <th className="text-right p-2 lg:p-4 text-xs sm:text-sm">{t('common.status')}</th>
                    <th className="text-right p-2 lg:p-4 text-xs sm:text-sm">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((j) => (
                    <tr key={j.id} className="border-b">
                      <td className="p-2 lg:p-4">
                        <div className="font-medium text-xs sm:text-sm truncate">{j.title}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">ID: {j.id.slice(0, 8)}...</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">ID: {j.id}</div>
                        {/* Mobile info */}
                        <div className="sm:hidden lg:hidden mt-1 space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Building2 className="h-2 w-2 text-muted-foreground" />
                            <span className="truncate">{j.company}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell p-2 lg:p-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <span className="text-xs sm:text-sm truncate">{j.company}</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell p-2 lg:p-4 text-xs sm:text-sm">{j.location}</td>
                      <td className="p-2 lg:p-4 text-xs sm:text-sm">{j.jobType}</td>
                      <td className="p-2 lg:p-4">
                        <Badge className={`text-xs ${getStatusColor(j.status)}`}>{j.status}</Badge>
                      </td>
                      <td className="p-2 lg:p-4">
                        <div className="flex gap-1 sm:gap-2">
                          <Button className="h-6 w-6 sm:h-8 sm:w-8 p-0" variant="outline" onClick={() => openView(j)}>
                            <Eye className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button className="h-6 w-6 sm:h-8 sm:w-8 p-0" variant="outline" onClick={() => openEdit(j)}>
                            <Edit className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button className="h-6 w-6 sm:h-8 sm:w-8 p-0" variant="outline" onClick={() => deleteJob(j.id)}>
                            <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="h-6 w-6 sm:h-8 sm:w-8 p-0" variant="outline">
                                <MoreHorizontal className="h-2 w-2 sm:h-3 sm:w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => changeStatus(j.id, "OPEN")}>{t('admin.jobs.openJob')}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => changeStatus(j.id, "CLOSED")}>{t('admin.jobs.closeJob')}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => changeStatus(j.id, "HIRED")}>{t('admin.jobs.hired')}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {filtered.map((j) => (
                <Card key={j.id} className="p-3">
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{j.title}</h3>
                        <p className="text-xs text-muted-foreground">ID: {j.id.slice(0, 8)}...</p>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(j.status)} shrink-0`}>{j.status}</Badge>
                    </div>
                    
                    {/* Company Info */}
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-xs truncate">{j.company}</span>
                    </div>
                    
                    {/* Job Details */}
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('admin.jobs.location')}:</span>
                        <span className="truncate ml-2">{j.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('admin.jobs.jobType')}:</span>
                        <span className="truncate ml-2">{j.jobType}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 pt-2 border-t">
                      <Button className="h-7 px-2 text-xs flex-1" variant="outline" onClick={() => openView(j)}>
                        <Eye className="h-3 w-3 mr-1" />
                        {t('common.view')}
                      </Button>
                      <Button className="h-7 px-2 text-xs flex-1" variant="outline" onClick={() => openEdit(j)}>
                        <Edit className="h-3 w-3 mr-1" />
                        {t('common.edit')}
                      </Button>
                      <Button className="h-7 px-2 text-xs flex-1" variant="outline" onClick={() => deleteJob(j.id)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        {t('common.delete')}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="h-7 w-7 p-0" variant="outline">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => changeStatus(j.id, "OPEN")}>{t('admin.jobs.openJob')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeStatus(j.id, "CLOSED")}>{t('admin.jobs.closeJob')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeStatus(j.id, "HIRED")}>تم التوظيف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminJobs;


