import { useEffect, useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Briefcase, Plus, Search, MoreHorizontal, Building2, Edit, Trash2, Eye, Package } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogPortal } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TagsInput } from "@/components/ui/tags-input";
import { useLanguage } from "@/contexts/LanguageContext";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  locationLink?: string;
  jobType: string;
  department?: string;
  description?: string;
  remoteWorkAvailable?: boolean;
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
  description: string;
  remoteWorkAvailable: boolean;
  requirements: string[];
  requiredSkills: string[];
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
  const [skillPackages, setSkillPackages] = useState<Array<any>>([]);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  
  // Debug: Log when isAddOpen changes
  useEffect(() => {
    console.log('isAddOpen changed to:', isAddOpen);
    console.log('Component re-rendered with isAddOpen:', isAddOpen);
    console.log('skillPackages state:', skillPackages);
    console.log('clients state:', clients);
  }, [isAddOpen, skillPackages, clients]);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    company: "",
    location: "",
    locationLink: "",
    jobType: "FULL_TIME",
    department: "",
    description: "",
    remoteWorkAvailable: false,
    requirements: [],
    requiredSkills: [],
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
      console.log('Loading clients...');
      console.log('API base URL:', api.defaults.baseURL);
      console.log('Auth token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
      
      const res = await api.get<Array<{ id: string; name?: string }>>("/client/list");
      console.log('Clients API response:', res);
      console.log('Clients data:', res.data);
      setClients(res.data ?? []);
    } catch (error) {
      console.error('Error loading clients:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
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

        // Apply package to form - convert strings to arrays
        setFormData(prev => ({
          ...prev,
          description: package_.description || "",
          requiredSkills: typeof package_.skills === 'string'
            ? package_.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
            : (package_.skills || []),
          requirements: typeof package_.requirements === 'string'
            ? package_.requirements.split(',').map((s: string) => s.trim()).filter((s: string) => s)
            : (package_.requirements || []),
        }));

        // Increment usage count
        await api.post(`/skill-packages/${package_.id}/use`);

        toast({
          title: t('admin.skillPackages.applied'),
          description: t('admin.skillPackages.appliedDesc'),
        });
      }
    } catch (error) {
      console.error('Error applying package:', error);
      toast({
        title: t('common.error'),
        description: t('admin.skillPackages.applyError'),
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      locationLink: "",
      jobType: "FULL_TIME",
      department: "",
      description: "",
      remoteWorkAvailable: false,
      requirements: [],
      requiredSkills: [],
      salaryRange: "",
      applicationDeadline: "",
      clientId: ""
    });
  };

  const openAdd = async () => {
    console.log('Opening add dialog...');
    console.log('Current isAddOpen state:', isAddOpen);
    resetForm();
    
    try {
      await loadClients();
    } catch (error) {
      console.error('Error loading clients:', error);
    }
    
    try {
      await loadSkillPackages();
    } catch (error) {
      console.error('Error loading skill packages:', error);
    }
    
    console.log('About to set isAddOpen to true');
    setIsAddOpen(true);
    console.log('setIsAddOpen(true) called');
  };

  const openEdit = async (job: Job) => {
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      locationLink: job.locationLink || "",
      jobType: job.jobType,
      department: job.department || "",
      description: job.description || "",
      remoteWorkAvailable: job.remoteWorkAvailable || false,
      requirements: typeof job.requirements === 'string'
        ? job.requirements.split(',').map(s => s.trim()).filter(s => s)
        : (job.requirements || []),
      requiredSkills: typeof job.requiredSkills === 'string'
        ? (job.requiredSkills || "").split(',').map(s => s.trim()).filter(s => s)
        : (job.requiredSkills || []),
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
    if (!formData.title || !formData.company || !formData.location || !formData.requirements.length || !formData.salaryRange || !formData.applicationDeadline || !formData.clientId) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    try {
      await api.post("/jobs", {
        ...formData,
        requirements: formData.requirements.join(', '),
        requiredSkills: formData.requiredSkills.join(', '),
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
    console.log('submitEdit called');
    console.log('selectedJob:', selectedJob);
    console.log('formData:', formData);

    if (!selectedJob || !formData.title || !formData.company || !formData.location || !formData.requirements.length || !formData.salaryRange || !formData.applicationDeadline) {
      console.log('Validation failed - missing required fields');
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    try {
      console.log('Sending PUT request to:', `/jobs/${selectedJob.id}`);
      console.log('Request data:', {
        ...formData,
        requirements: formData.requirements.join(', '),
        requiredSkills: formData.requiredSkills.join(', '),
        applicationDeadline: new Date(formData.applicationDeadline).toISOString()
      });

      await api.put(`/jobs/${selectedJob.id}`, {
        ...formData,
        requirements: formData.requirements.join(', '),
        requiredSkills: formData.requiredSkills.join(', '),
        applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
        clientId: formData.clientId // Ensure clientId is included
      });

      console.log('Update successful');
      setIsEditOpen(false);
      setSelectedJob(null); // Reset selectedJob after successful update
      toast({ title: "تم التحديث", description: "تم تحديث الوظيفة بنجاح" });
      load();
    } catch (e) {
      console.error('Update failed:', e);
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

  const JobFormFields = () => {
    console.log('JobFormFields rendering with clients:', clients);

    // Skill suggestions
    const skillSuggestions = [
      "JavaScript", "React", "Node.js", "Python", "Java", "TypeScript",
      "SQL", "MongoDB", "PostgreSQL", "AWS", "Docker", "Kubernetes",
      "Git", "REST API", "GraphQL", "HTML", "CSS", "Angular", "Vue.js",
      "Express.js", "Django", "Spring Boot", "C#", ".NET", "PHP", "Laravel"
    ];

    // Requirements suggestions
    const requirementsSuggestions = [
      "درجة بكالوريوس في علوم الحاسب",
      "خبرة 3 سنوات على الأقل",
      "إجادة اللغة الإنجليزية",
      "القدرة على العمل ضمن فريق",
      "مهارات تواصل ممتازة",
      "القدرة على حل المشكلات",
      "الاهتمام بالتفاصيل",
      "مهارات تحليلية قوية",
      "معرفة بمنهجيات Agile",
      "خبرة في العمل عن بُعد"
    ];

    return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {/* Skill Package Selector */}
      {skillPackages && skillPackages.length > 0 && skillPackages.some(p => p.id && p.id.trim() !== '') && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              <Label className="font-semibold">{t('admin.skillPackages.usePackage')}</Label>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {t('admin.skillPackages.usePackageDesc')}
            </p>
            <Select onValueChange={handlePackageSelect}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.skillPackages.selectPackage')} />
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
          <Label>{t('admin.jobs.description')}</Label>
          <Textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            placeholder={t('admin.jobs.descriptionPlaceholder')} 
            rows={3}
          />
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
        <Label>المتطلبات *</Label>
        <TagsInput
          value={formData.requirements}
          onChange={(tags) => setFormData({...formData, requirements: tags})}
          suggestions={requirementsSuggestions}
          placeholder="أضف متطلب..."
        />
      </div>

      <div className="space-y-2">
        <Label>المهارات المطلوبة</Label>
        <TagsInput
          value={formData.requiredSkills}
          onChange={(tags) => setFormData({...formData, requiredSkills: tags})}
          suggestions={skillSuggestions}
          placeholder="أضف مهارة..."
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
            {clients && clients.length > 0 ? (
              clients.filter(client => client.id && client.id.trim() !== '').map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name || c.id}</SelectItem>
              ))
            ) : (
              <SelectItem value="no-clients" disabled>
                {t('admin.jobs.noClientsAvailable')}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
    );
  };

  return (
    <MainLayout userRole="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{t('admin.jobs.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t('admin.jobs.subtitle')}</p>
          </div>
          <Button 
            className="gap-1 sm:gap-2 text-sm sm:text-base w-full sm:w-auto" 
            onClick={() => {
              console.log('Button clicked!');
              console.log('Current isAddOpen before openAdd:', isAddOpen);
              openAdd();
            }} 
            disabled={loading}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            {t('admin.jobs.addJob')}
          </Button>
          
          {isAddOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{t('admin.jobs.addNewJob')}</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsAddOpen(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  {console.log('Custom modal is rendering with isAddOpen:', isAddOpen)}
                  {console.log('skillPackages length:', skillPackages.length)}
                  {JobFormFields()}
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={submitAdd}>
                      {t('admin.jobs.saveJob')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('admin.jobs.editJob')}</DialogTitle>
            </DialogHeader>
            {JobFormFields()}
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
                  <div><strong>{t('admin.jobs.remoteWork')}:</strong> {selectedJob.remoteWorkAvailable ? t('admin.jobs.available') : t('admin.jobs.notAvailable')}</div>
                  <div><strong>{t('admin.jobs.salaryRange')}:</strong> {selectedJob.salaryRange}</div>
                </div>
                {selectedJob.description && <div><strong>{t('admin.jobs.description')}:</strong><br/>{selectedJob.description}</div>}
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

export { AdminJobs as default };



