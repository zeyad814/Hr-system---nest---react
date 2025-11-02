import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDepartments } from "@/contexts/DepartmentsContext";
import { clientApiService, JobRequest } from "@/services/clientApi";
import { 
  Briefcase, 
  Plus,
  MapPin,
  DollarSign,
  Clock,
  Users,
  FileText,
  Send,
  Eye,
  Edit,
  Trash2,
  Calendar
} from "lucide-react";

const ClientRequestJob = () => {
  const { t, isRTL } = useLanguage();
  const { departments } = useDepartments();
  const [pendingRequests, setPendingRequests] = useState<JobRequest[]>([]);
  const [stats, setStats] = useState({
    publishedJobs: 0,
    averageApprovalTime: t('client.requestJob.stats.averageApprovalTime'),
    approvalRate: "85%"
  });
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JobRequest | null>(null);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [locations, setLocations] = useState<{id: string, name: string, city: string, country: string}[]>([]);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
   const [formData, setFormData] = useState({
     title: "",
     department: "",
     description: "",
     location: "",
     type: "",
     salary: "",
     currency: "AED",
     experience: "",
     positions: 1,
     requirements: "",
     salaryMin: "",
     salaryMax: "",
     deadline: ""
   });

  useEffect(() => {
    fetchJobRequests();
    fetchStats();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      // Load from localStorage
      const stored = localStorage.getItem('client_locations');
      if (stored) {
        const parsedLocations = JSON.parse(stored);
        setLocations(parsedLocations);
      } else {
        // Default locations if none exist
        const defaultLocations = [
          { id: "1", name: "دبي - الإمارات", city: "دبي", country: "الإمارات العربية المتحدة" },
          { id: "2", name: "الرياض - السعودية", city: "الرياض", country: "المملكة العربية السعودية" },
          { id: "3", name: "القاهرة - مصر", city: "القاهرة", country: "مصر" }
        ];
        setLocations(defaultLocations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    // Find the selected department
    const selectedDepartment = departments.find(dept => dept.id === departmentId);
    
    if (selectedDepartment) {
      setFormData(prev => ({
        ...prev,
        department: departmentId,
        // Always update description and requirements when department changes
        description: selectedDepartment.description,
        requirements: selectedDepartment.requirements
      }));
      
      // Show auto-fill effect
      setIsAutoFilled(true);
      setTimeout(() => setIsAutoFilled(false), 2000);
    } else {
      setFormData(prev => ({
        ...prev,
        department: departmentId
      }));
    }
  };

  const fetchJobRequests = async () => {
    try {
      const data = await clientApiService.getJobRequests();
      // Format the data to match the expected structure
      const formattedData = data.map((request: any) => ({
        ...request,
        submittedDate: request.createdAt ? 
          new Date(request.createdAt).toLocaleDateString('ar-SA') : 
          new Date().toLocaleDateString('ar-SA'),
        salary: request.salaryRange || request.salary || 'غير محدد'
      }));
      setPendingRequests(formattedData);
    } catch (error) {
      console.error('Error fetching job requests:', error);
      setPendingRequests([]);
      toast({
        title: t('common.error'),
        description: t('client.requestJob.errors.fetchFailed'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await clientApiService.getJobRequestStats();
      setStats({
        publishedJobs: data.publishedJobs || 0,
        averageApprovalTime: data.averageApprovalTime || t('client.requestJob.stats.averageApprovalTime'),
        approvalRate: data.approvalRate || "85%"
      });
    } catch (error) {
      console.error('Error fetching job request stats:', error);
      // Keep default values on error
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.department || !formData.description || !formData.location) {
      toast({
        title: t('common.error'),
        description: t('client.requestJob.errors.requiredFields'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the selected department and location
      const selectedDept = departments.find(dept => dept.id === formData.department);
      const selectedLocation = locations.find(loc => loc.id === formData.location);

      // Create salary range with selected currency
      const salaryRange = formData.salaryMin && formData.salaryMax ?
        `${formData.salaryMin} - ${formData.salaryMax} ${formData.currency}` : formData.salary;

      console.log('=== SAVING JOB REQUEST ===');
      console.log('Editing mode:', editingRequestId ? 'UPDATE' : 'CREATE');
      console.log('Request ID:', editingRequestId);
      console.log('Selected currency:', formData.currency);
      console.log('Salary range:', salaryRange);
      console.log('Form data:', formData);

      const requestData = {
        ...formData,
        department: selectedDept?.name || formData.department,
        location: selectedLocation?.name || formData.location,
        salaryRange: salaryRange,
        positions: Number(formData.positions) || 1,
        submittedDate: new Date().toISOString().split('T')[0]
      };

      console.log('Final request data:', requestData);

      let response;
      if (editingRequestId) {
        // Update existing request
        response = await clientApiService.updateJobRequest(editingRequestId, requestData);
        console.log('Update API Response:', response);
        toast({
          title: t('common.success'),
          description: 'تم تحديث طلب الوظيفة بنجاح',
        });
      } else {
        // Create new request
        response = await clientApiService.createJobRequest(requestData);
        console.log('Create API Response:', response);
        toast({
          title: t('common.success'),
          description: t('client.requestJob.success.submitted'),
        });
      }

      // Reset form and editing state
       setFormData({
         title: "",
         department: "",
         description: "",
         location: "",
         type: "",
         salary: "",
         currency: "AED",
         experience: "",
         positions: 1,
         requirements: "",
         salaryMin: "",
         salaryMax: "",
         deadline: ""
       });
       setEditingRequestId(null);
      // Refresh requests
      fetchJobRequests();
    } catch (error) {
      console.error('Error saving job request:', error);
      toast({
        title: t('common.error'),
        description: editingRequestId ? 'فشل تحديث طلب الوظيفة' : t('client.requestJob.errors.submitFailed'),
        variant: "destructive",
      });
    }
  };

  const handleView = async (request: JobRequest) => {
    try {
      // Set the selected request and open modal
      setSelectedRequest(request);
      setIsViewModalOpen(true);
      
      // Optionally fetch additional details from API
      // const jobDetails = await clientApiService.getJobRequest(request.id);
      // setSelectedRequest(jobDetails);
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      const errorMessage = error.response?.data?.message || error.message || t('client.requestJob.errors.fetchFailed');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (request: JobRequest) => {
    // Find the department and location IDs by name
    const departmentId = departments.find(dept => dept.name === request.department)?.id || request.department;
    const locationId = locations.find(loc => loc.name === request.location)?.id || request.location;

    // Extract currency from salary string if it exists
    let extractedCurrency = "AED"; // Default
    if (request.salary) {
      const currencyMatch = request.salary.match(/(AED|SAR|USD|EUR|INR|PKR)$/);
      if (currencyMatch) {
        extractedCurrency = currencyMatch[1];
      }
    }

    // Extract salary range if it exists
    let salaryMin = "";
    let salaryMax = "";
    if (request.salary && request.salary.includes(" - ")) {
      const salaryParts = request.salary.split(" - ");
      if (salaryParts.length === 2) {
        salaryMin = salaryParts[0].trim();
        salaryMax = salaryParts[1].replace(/\s+(AED|SAR|USD|EUR|INR|PKR)$/, "").trim();
      }
    }

    // Set the editing request ID
    setEditingRequestId(request.id);

    setFormData({
      title: request.title || "",
      department: departmentId,
      description: request.description || "",
      location: locationId,
      type: request.type || "",
      salary: request.salary || "",
      currency: extractedCurrency,
      experience: request.experience || "",
      positions: request.positions || 1,
      requirements: request.requirements || "",
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      deadline: request.deadline || ""
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm(t('client.requestJob.confirmDelete'))) {
      return;
    }

    try {
      await clientApiService.deleteJobRequest(requestId);
      toast({
        title: t('common.success'),
        description: t('client.requestJob.success.deleted'),
      });
      fetchJobRequests();
    } catch (error: any) {
      console.error('Error deleting job request:', error);
      const errorMessage = error.response?.data?.message || error.message || t('client.requestJob.errors.deleteFailed');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "تمت الموافقة":
        return "bg-secondary text-secondary-foreground";
      case "قيد المراجعة":
        return "bg-warning text-warning-foreground";
      case "تحتاج تعديل":
        return "bg-accent text-accent-foreground";
      case "مرفوض":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCurrencyDisplay = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      'AED': 'درهم إماراتي (AED)',
      'SAR': 'ريال سعودي (SAR)',
      'USD': 'دولار أمريكي (USD)',
      'EUR': 'يورو (EUR)',
      'INR': 'روبية هندية (INR)',
      'PKR': 'روبية باكستانية (PKR)'
    };
    return currencyMap[currency] || currency || 'درهم إماراتي (AED)';
  };


  return (
    <MainLayout userRole="client" userName={t('client.dashboard.defaultUserName')}>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-foreground">{t('client.requestJob.title')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{t('client.requestJob.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Job Request Form */}
          <div className="xl:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className={`${editingRequestId ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20' : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'} border-b`}>
                <CardTitle className="flex items-center gap-2 text-xl">
                  {editingRequestId ? (
                    <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                  )}
                  {editingRequestId ? 'تعديل طلب الوظيفة' : t('client.requestJob.form.title')}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingRequestId ? 'قم بتعديل البيانات ثم اضغط على "تحديث الطلب"' : 'املأ جميع الحقول المطلوبة لإنشاء طلب وظيفة جديد'}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">{t('client.requestJob.form.jobTitle')} <span className="text-red-500">*</span></Label>
                    <Input
                      id="jobTitle"
                      placeholder={t('client.requestJob.form.jobTitlePlaceholder')}
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">{t('client.requestJob.form.department')} <span className="text-red-500">*</span></Label>
                    <Select value={formData.department} onValueChange={handleDepartmentChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('client.requestJob.form.departmentPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">{t('client.requestJob.form.description')} <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="jobDescription"
                    placeholder={t('client.requestJob.form.descriptionPlaceholder')}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className={isAutoFilled ? "border-green-300 bg-green-50 transition-all duration-500" : ""}
                  />
                  {formData.department && departments.find(dept => dept.id === formData.department)?.description && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        💡 تم تحديث الوصف من بيانات القسم المحدد
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          const selectedDept = departments.find(dept => dept.id === formData.department);
                          if (selectedDept) {
                            setFormData(prev => ({
                              ...prev,
                              description: selectedDept.description,
                              requirements: selectedDept.requirements
                            }));
                          }
                        }}
                      >
                        إعادة تحديث
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('client.requestJob.form.location')} <span className="text-red-500">*</span></Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر موقع العمل" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobType">{t('client.requestJob.form.jobType')}</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('client.requestJob.form.jobTypePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime">{t('client.requestJob.jobTypes.fulltime')}</SelectItem>
                        <SelectItem value="parttime">{t('client.requestJob.jobTypes.parttime')}</SelectItem>
                        <SelectItem value="contract">{t('client.requestJob.jobTypes.contract')}</SelectItem>
                        <SelectItem value="freelance">{t('client.requestJob.jobTypes.freelance')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">{t('client.requestJob.form.experience')}</Label>
                    <Input
                      id="experience"
                      placeholder="مثال: 3 سنوات، 2-5 سنوات، أو 5+ سنوات"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 اكتب عدد سنوات الخبرة المطلوبة (مثال: 3 سنوات، 2-5 سنوات، أو 5+ سنوات)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">{t('client.requestJob.form.salaryMin')}</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="5000"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({...formData, salaryMin: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">{t('client.requestJob.form.salaryMax')}</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="8000"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({...formData, salaryMax: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">نوع العملة</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العملة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">🇦🇪 درهم إماراتي (AED)</SelectItem>
                        <SelectItem value="SAR">🇸🇦 ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="USD">🇺🇸 دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="EUR">🇪🇺 يورو (EUR)</SelectItem>
                        <SelectItem value="INR">🇮🇳 روبية هندية (INR)</SelectItem>
                        <SelectItem value="PKR">🇵🇰 روبية باكستانية (PKR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">{t('client.requestJob.form.requirements')}</Label>
                  <Textarea
                    id="requirements"
                    placeholder={t('client.requestJob.form.requirementsPlaceholder')}
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    className={isAutoFilled ? "border-green-300 bg-green-50 transition-all duration-500" : ""}
                  />
                  {formData.department && departments.find(dept => dept.id === formData.department)?.requirements && (
                    <p className="text-xs text-muted-foreground">
                      💡 تم تحديث المتطلبات من بيانات القسم المحدد
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">{t('client.requestJob.form.deadline')}</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="positions">{t('client.requestJob.form.positions')}</Label>
                    <Input
                      id="positions"
                      type="number"
                      placeholder="1"
                      min="1"
                      value={formData.positions}
                      onChange={(e) => setFormData({...formData, positions: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  <span className="text-red-500">*</span> {t('client.requestJob.form.requiredFields')}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="flex-1 gap-2" onClick={handleSubmit}>
                    <Send className="h-4 w-4" />
                    {editingRequestId ? 'تحديث الطلب' : t('client.requestJob.form.submit')}
                  </Button>
                  {editingRequestId && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingRequestId(null);
                        setFormData({
                          title: "",
                          department: "",
                          description: "",
                          location: "",
                          type: "",
                          salary: "",
                          currency: "AED",
                          experience: "",
                          positions: 1,
                          requirements: "",
                          salaryMin: "",
                          salaryMax: "",
                          deadline: ""
                        });
                      }}
                    >
                      إلغاء التعديل
                    </Button>
                  )}
                  {!editingRequestId && (
                    <Button variant="outline" className="flex-1">
                      {t('client.requestJob.form.saveDraft')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Guidelines and Quick Stats */}
          <div className="space-y-6">
            {/* Guidelines */}
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  {t('client.requestJob.sidebar.guidelines')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>{t('client.requestJob.sidebar.guideline1')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>{t('client.requestJob.sidebar.guideline2')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>{t('client.requestJob.sidebar.guideline3')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>{t('client.requestJob.sidebar.guideline4')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>{t('client.requestJob.sidebar.guideline5')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  {t('client.requestJob.sidebar.quickStats')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('client.requestJob.stats.pendingReview')}</span>
                    <Badge className="bg-warning text-warning-foreground">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('client.requestJob.stats.publishedJobs')}</span>
                    <Badge className="bg-secondary text-secondary-foreground">{stats.publishedJobs}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('client.requestJob.stats.averageApprovalTime')}</span>
                    <span className="text-sm font-medium">{stats.averageApprovalTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('client.requestJob.stats.approvalRate')}</span>
                    <span className="text-sm font-medium text-secondary">{stats.approvalRate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pending Requests */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              {t('client.requestJob.pendingRequests.title')} 
              <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {pendingRequests.length}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              عرض ومتابعة جميع طلبات الوظائف المعلقة
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-right p-4 font-semibold text-sm">{t('client.requestJob.table.jobTitle')}</th>
                    <th className="text-right p-4 font-semibold text-sm">{t('client.requestJob.table.department')}</th>
                    <th className="text-right p-4 font-semibold text-sm">{t('client.requestJob.table.location')}</th>
                    <th className="text-right p-4 font-semibold text-sm">{t('client.requestJob.table.type')}</th>
                    <th className="text-right p-4 font-semibold text-sm">{t('client.requestJob.table.salary')}</th>
                    <th className="text-right p-4 font-semibold text-sm">{t('client.requestJob.table.submissionDate')}</th>
                    <th className="text-right p-4 font-semibold text-sm">{t('client.requestJob.table.status')}</th>
                    <th className="text-right p-4 font-semibold text-sm">{t('client.requestJob.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-lg font-medium">لا توجد طلبات وظائف</p>
                          <p className="text-sm">ابدأ بإنشاء طلب وظيفة جديد باستخدام النموذج أعلاه</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{request.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {t('client.requestJob.experience')}: {request.experience || 'غير محدد'}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">
                            {request.department || 'غير محدد'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{request.location || 'غير محدد'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-xs">
                            {request.type || 'غير محدد'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="text-sm font-medium">
                              {request.salary || 'غير محدد'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {request.submittedDate}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(request.status)} text-xs`}>
                            {request.status === 'قيد المراجعة' ? t('client.requestJob.status.pending') :
                             request.status === 'تمت الموافقة' ? t('client.requestJob.status.approved') :
                             request.status === 'مرفوض' ? t('client.requestJob.status.rejected') :
                             request.status === 'تحتاج تعديل' ? t('client.requestJob.status.needsRevision') :
                             request.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200" 
                              title={t('client.requestJob.actions.view')}
                              onClick={() => handleView(request)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-200"
                              onClick={() => handleEdit(request)}
                              title={t('client.requestJob.actions.edit')}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50 hover:border-red-200"
                              onClick={() => handleDelete(request.id)}
                              title={t('client.requestJob.actions.delete')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* View Request Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 -m-6 mb-6 border-b">
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Briefcase className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                تفاصيل طلب الوظيفة
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                عرض تفاصيل كاملة لطلب الوظيفة المحدد
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">عنوان الوظيفة</Label>
                      <p className="text-lg font-medium mt-1">{selectedRequest.title}</p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">القسم</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-sm">
                          {selectedRequest.department || 'غير محدد'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">الموقع</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedRequest.location || 'غير محدد'}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">نوع الوظيفة</Label>
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-sm">
                          {selectedRequest.type || 'غير محدد'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">الراتب</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {selectedRequest.salary || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">الخبرة المطلوبة</Label>
                      <p className="mt-1">{selectedRequest.experience || 'غير محدد'}</p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">عدد المناصب</Label>
                      <p className="mt-1">{selectedRequest.positions || 1}</p>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <Label className="text-sm font-semibold text-muted-foreground">تاريخ التقديم</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedRequest.submittedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-semibold text-muted-foreground">الحالة:</Label>
                    <Badge className={`${getStatusColor(selectedRequest.status)} text-sm px-3 py-1`}>
                      {selectedRequest.status === 'قيد المراجعة' ? t('client.requestJob.status.pending') :
                       selectedRequest.status === 'تمت الموافقة' ? t('client.requestJob.status.approved') :
                       selectedRequest.status === 'مرفوض' ? t('client.requestJob.status.rejected') :
                       selectedRequest.status === 'تحتاج تعديل' ? t('client.requestJob.status.needsRevision') :
                       selectedRequest.status}
                    </Badge>
                  </div>
                </div>
                
                {/* Description */}
                {selectedRequest.description && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">وصف الوظيفة</Label>
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedRequest.description}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Requirements */}
                {selectedRequest.requirements && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">المتطلبات</Label>
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedRequest.requirements}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Deadline */}
                {selectedRequest.deadline && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">آخر موعد للتقديم</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedRequest.deadline).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleEdit(selectedRequest);
                      setIsViewModalOpen(false);
                    }}
                    className="flex-1 hover:bg-green-50 hover:border-green-200"
                  >
                    <Edit className="h-4 w-4 ml-2" />
                    تعديل
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleDelete(selectedRequest.id);
                      setIsViewModalOpen(false);
                    }}
                    className="flex-1 text-destructive hover:text-destructive hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsViewModalOpen(false)}
                    className="flex-1"
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ClientRequestJob;
