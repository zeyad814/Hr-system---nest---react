import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ResponsiveTable, ResponsiveTableHeader, ResponsiveTableBody, ResponsiveTableRow, ResponsiveTableHead, ResponsiveTableCell } from "@/components/ui/responsive-table";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Wifi,
  WifiOff,
  Package,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
  applications?: any[];
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

const HRJobs = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [clients, setClients] = useState<Array<{ id: string; name?: string }>>([]);
  const [skillPackages, setSkillPackages] = useState<Array<any>>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const { toast } = useToast();
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

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get<Job[]>("/jobs");
      setJobs(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const res = await api.get<Array<{ id: string; name?: string }>>("/client/list");
      setClients(res.data ?? []);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    }
  };

  const loadSkillPackages = async () => {
    try {
      const res = await api.get("/skill-packages");
      setSkillPackages(res.data ?? []);
    } catch (error) {
      console.error('Error loading skill packages:', error);
      setSkillPackages([]);
    }
  };

  const handlePackageSelect = async (packageId: string) => {
    if (!packageId) return;

    try {
      const package_ = skillPackages.find(p => p.id === packageId);
      if (package_) {
        setSelectedPackage(package_);

        // Apply package to form
        setFormData(prev => ({
          ...prev,
          description: package_.description || "",
          requiredSkills: package_.skills,
          requirements: package_.requirements,
        }));

        // Increment usage count
        await api.post(`/skill-packages/${package_.id}/use`);

        toast({
          title: t('hr.jobs.skillPackageApplied'),
          description: t('hr.jobs.skillPackageAppliedDesc'),
        });
      }
    } catch (error) {
      console.error('Error applying package:', error);
      toast({
        title: t('common.error'),
        description: t('hr.jobs.skillPackageApplyError'),
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

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
    await loadSkillPackages();
    setIsAddOpen(true);
  };

  const openEdit = async (job: Job) => {
    try {
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
        applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : "",
        clientId: job.clientId
      });
      setSelectedJob(job);
      await loadClients();
      await loadSkillPackages();
      setIsEditOpen(true);
    } catch (error) {
      console.error('Error in openEdit:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء فتح نافذة التعديل", variant: "destructive" });
    }
  };

  const openView = (job: Job) => {
    setSelectedJob(job);
    setIsViewOpen(true);
  };

  const submitAdd = async () => {
    if (!formData.title || !formData.company || !formData.location || !formData.description || !formData.requirements || !formData.salaryRange || !formData.applicationDeadline || !formData.clientId) {
      toast({ title: "خطأ", description: t('hr.jobs.validationError'), variant: "destructive" });
      return;
    }
    try {
      await api.post("/jobs", {
        ...formData,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString()
      });
      setIsAddOpen(false);
      toast({ title: "تمت الإضافة", description: t('hr.jobs.jobCreated') });
      loadJobs();
    } catch (e) {
      toast({ title: "فشل الإضافة", description: t('hr.jobs.createFailed'), variant: "destructive" });
    }
  };

  const submitEdit = async () => {
    if (!selectedJob || !formData.title || !formData.company || !formData.location || !formData.description || !formData.requirements || !formData.salaryRange || !formData.applicationDeadline) {
      toast({ title: "خطأ", description: t('hr.jobs.validationError'), variant: "destructive" });
      return;
    }
    try {
      await api.put(`/jobs/${selectedJob.id}`, {
        ...formData,
        applicationDeadline: new Date(formData.applicationDeadline).toISOString()
      });
      setIsEditOpen(false);
      toast({ title: "تم التحديث", description: t('hr.jobs.jobUpdated') });
      loadJobs();
    } catch (e) {
      toast({ title: "فشل التحديث", description: t('hr.jobs.updateFailed'), variant: "destructive" });
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast({ title: "تم الحذف", description: t('hr.jobs.jobDeleted') });
      loadJobs();
    } catch (e) {
      toast({ title: "فشل الحذف", description: t('hr.jobs.deleteFailed'), variant: "destructive" });
    }
  };

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

  const getJobTypeLabel = (jobType: string) => {
    switch (jobType) {
      case "FULL_TIME": return t('hr.jobs.fullTime');
      case "PART_TIME": return t('hr.jobs.partTime');
      case "CONTRACT": return t('hr.jobs.contract');
      case "FREELANCE": return t('hr.jobs.freelance');
      default: return jobType;
    }
  };

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case "ENTRY": return t('hr.jobs.entry');
      case "MID": return t('hr.jobs.mid');
      case "SENIOR": return t('hr.jobs.senior');
      case "LEAD": return t('hr.jobs.lead');
      default: return level || t('hr.jobs.undefined');
    }
  };

  const filtered = jobs.filter((j) => 
    j.title?.toLowerCase().includes(query.toLowerCase()) ||
    j.company?.toLowerCase().includes(query.toLowerCase()) ||
    j.location?.toLowerCase().includes(query.toLowerCase())
  );

  const JobFormFields = useMemo(() => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('hr.jobs.jobTitle')} *</Label>
          <Input 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            placeholder={t('hr.jobs.placeholders.jobTitle')} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('hr.jobs.company')} *</Label>
          <Input 
            value={formData.company} 
            onChange={(e) => setFormData({...formData, company: e.target.value})} 
            placeholder={t('hr.jobs.placeholders.company')} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('hr.jobs.location')} *</Label>
          <Input 
            value={formData.location} 
            onChange={(e) => setFormData({...formData, location: e.target.value})} 
            placeholder={t('hr.jobs.placeholders.location')} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('hr.jobs.locationLink')}</Label>
          <Input 
            value={formData.locationLink} 
            onChange={(e) => setFormData({...formData, locationLink: e.target.value})} 
            placeholder={t('hr.jobs.placeholders.locationLink')} 
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{t('hr.jobs.jobType')} *</Label>
          <Select value={formData.jobType} onValueChange={(value) => setFormData({...formData, jobType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">{t('hr.jobs.fullTime')}</SelectItem>
              <SelectItem value="PART_TIME">{t('hr.jobs.partTime')}</SelectItem>
              <SelectItem value="CONTRACT">{t('hr.jobs.contract')}</SelectItem>
              <SelectItem value="FREELANCE">{t('hr.jobs.freelance')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('hr.jobs.department')}</Label>
          <Input 
            value={formData.department} 
            onChange={(e) => setFormData({...formData, department: e.target.value})} 
            placeholder={t('hr.jobs.placeholders.department')} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('hr.jobs.experienceLevel')}</Label>
          <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({...formData, experienceLevel: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENTRY">{t('hr.jobs.entry')}</SelectItem>
              <SelectItem value="MID">{t('hr.jobs.mid')}</SelectItem>
              <SelectItem value="SENIOR">{t('hr.jobs.senior')}</SelectItem>
              <SelectItem value="LEAD">{t('hr.jobs.lead')}</SelectItem>
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
        <Label htmlFor="remote">{t('hr.jobs.remoteWork')}</Label>
      </div>

      <div className="space-y-2">
        <Label>{t('hr.jobs.description')} *</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          placeholder={t('hr.jobs.placeholders.description')} 
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('hr.jobs.requirements')} *</Label>
        <Textarea 
          value={formData.requirements} 
          onChange={(e) => setFormData({...formData, requirements: e.target.value})} 
          placeholder={t('hr.jobs.placeholders.requirements')} 
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('hr.jobs.requiredSkills')}</Label>
        <Textarea 
          value={formData.requiredSkills} 
          onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})} 
          placeholder={t('hr.jobs.placeholders.skills')} 
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('hr.jobs.salaryRange')} *</Label>
          <Input 
            value={formData.salaryRange} 
            onChange={(e) => setFormData({...formData, salaryRange: e.target.value})} 
            placeholder={t('hr.jobs.placeholders.salary')} 
          />
        </div>
        <div className="space-y-2">
          <Label>{t('hr.jobs.applicationDeadline')} *</Label>
          <Input 
            type="date" 
            value={formData.applicationDeadline} 
            onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('hr.jobs.client')} *</Label>
        <Select value={formData.clientId} onValueChange={(value) => setFormData({...formData, clientId: value})}>
          <SelectTrigger>
            <SelectValue placeholder={t('hr.jobs.selectClient')} />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name || c.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Skill Package Selector */}
      {skillPackages && skillPackages.length > 0 && skillPackages.some(p => p.id && p.id.trim() !== '') && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              <Label className="font-semibold">{t('hr.jobs.useSkillPackage')}</Label>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {t('hr.jobs.useSkillPackageDesc')}
            </p>
            <Select onValueChange={handlePackageSelect}>
              <SelectTrigger>
                <SelectValue placeholder={t('hr.jobs.selectSkillPackage')} />
              </SelectTrigger>
              <SelectContent>
                {skillPackages.filter(pkg => pkg.id && pkg.id.trim() !== '').map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    <span>{pkg.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  ), [formData, t, clients, skillPackages]);

  return (
    <MainLayout userRole="hr" userName="سارة أحمد">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{t('hr.jobs.title')}</h1>
            <p className="text-muted-foreground">{t('hr.jobs.subtitle')}</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={openAdd} disabled={loading}>
                <Plus className="h-4 w-4" />
                {t('hr.jobs.addNew')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('hr.jobs.addNewTitle')}</DialogTitle>
              </DialogHeader>
              {JobFormFields}
              <DialogFooter>
                <Button onClick={submitAdd}>{t('hr.jobs.save')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('hr.jobs.editTitle')}</DialogTitle>
            </DialogHeader>
            {JobFormFields}
            <DialogFooter>
              <Button onClick={submitEdit}>{t('hr.jobs.saveChanges')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('hr.jobs.viewTitle')}</DialogTitle>
              </DialogHeader>
            {selectedJob && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>العنوان:</strong> {selectedJob.title}</div>
                  <div><strong>الشركة:</strong> {selectedJob.company}</div>
                  <div><strong>الموقع:</strong> {selectedJob.location}</div>
                  <div><strong>نوع الوظيفة:</strong> {getJobTypeLabel(selectedJob.jobType)}</div>
                  <div><strong>القسم:</strong> {selectedJob.department || 'غير محدد'}</div>
                  <div><strong>مستوى الخبرة:</strong> {getExperienceLevelLabel(selectedJob.experienceLevel || '')}</div>
                  <div><strong>العمل عن بُعد:</strong> {selectedJob.remoteWorkAvailable ? 'متاح' : 'غير متاح'}</div>
                  <div><strong>نطاق الراتب:</strong> {selectedJob.salaryRange}</div>
                </div>
                <div><strong>الوصف:</strong><br/>{selectedJob.description}</div>
                <div><strong>المتطلبات:</strong><br/>{selectedJob.requirements}</div>
                {selectedJob.requiredSkills && <div><strong>المهارات:</strong><br/>{selectedJob.requiredSkills}</div>}
                <div><strong>آخر موعد للتقديم:</strong> {new Date(selectedJob.applicationDeadline).toLocaleDateString('ar-SA')}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('hr.jobs.totalJobs')}</p>
                <p className="text-2xl font-bold">{filtered.length}{loading ? " ..." : ""}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('hr.jobs.openJobs')}</p>
                <p className="text-2xl font-bold">{filtered.filter((j) => j.status === "OPEN").length}</p>
              </div>
              <Eye className="h-8 w-8 text-secondary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('hr.jobs.totalApplicants')}</p>
                <p className="text-2xl font-bold">{filtered.reduce((sum, j) => sum + (j.applications?.length ?? 0), 0)}</p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('hr.jobs.applicationRate')}</p>
                <p className="text-2xl font-bold">{filtered.length ? (filtered.reduce((s, j) => s + (j.applications?.length ?? 0), 0) / filtered.length).toFixed(1) : 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-info" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder={t('hr.jobs.searchPlaceholder')} className="pr-10" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {t('hr.jobs.filter')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
{t('hr.jobs.jobsList')} ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>{t('hr.jobs.job')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.jobs.company')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.jobs.locationAndType')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.jobs.salaryAndExperience')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.jobs.applicants')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.jobs.dates')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.jobs.status')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('hr.jobs.actions')}</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                  {filtered.map((job) => (
                    <ResponsiveTableRow key={job.id}>
                      <ResponsiveTableCell>
                        <div>
                          <div className="font-medium text-xs sm:text-sm">{job.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {job.department && <span>{job.department}</span>}
                            {job.remoteWorkAvailable ? <Wifi className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" /> : <WifiOff className="h-2 w-2 sm:h-3 sm:w-3 text-gray-400" />}
                          </div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <span className="text-xs sm:text-sm">{job.company}</span>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground" />
                            <span>{getJobTypeLabel(job.jobType)}</span>
                          </div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground" />
                            <span>{job.salaryRange}</span>
                          </div>
                          <div>{t('hr.jobs.experience')}: {getExperienceLevelLabel(job.experienceLevel || '')}</div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="text-center">
                          <div className="font-medium text-sm sm:text-lg">{job.applications?.length ?? 0}</div>
                          <div className="text-xs text-muted-foreground">{t('hr.jobs.applicant')}</div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-2 w-2 sm:h-3 sm:w-3" />
                            <span>{new Date(job.applicationDeadline).toLocaleDateString('ar-SA')}</span>
                          </div>
                          <div>{t('hr.jobs.created')}: {new Date(job.createdAt).toLocaleDateString('ar-SA')}</div>
                        </div>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <Badge className={`text-xs ${getStatusColor(job.status)}`}>{job.status}</Badge>
                      </ResponsiveTableCell>
                      <ResponsiveTableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button size="sm" variant="outline" className="h-6 w-6 sm:h-8 sm:w-8 p-0" onClick={() => openView(job)}>
                            <Eye className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 w-6 sm:h-8 sm:w-8 p-0" onClick={() => openEdit(job)}>
                            <Edit className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive" onClick={() => deleteJob(job.id)}>
                            <Trash2 className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ))}
              </ResponsiveTableBody>
            </ResponsiveTable>


          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HRJobs;