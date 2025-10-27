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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const [pendingRequests, setPendingRequests] = useState<JobRequest[]>([]);
  const [stats, setStats] = useState({
    publishedJobs: 0,
    averageApprovalTime: t('client.requestJob.stats.averageApprovalTime'),
    approvalRate: "85%"
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form state
   const [formData, setFormData] = useState({
     title: "",
     department: "",
     description: "",
     location: "",
     type: "",
     salary: "",
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
  }, []);

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
      const requestData = {
        ...formData,
        salaryRange: formData.salaryMin && formData.salaryMax ? 
          `${formData.salaryMin} - ${formData.salaryMax}` : formData.salary,
        positions: Number(formData.positions) || 1,
        submittedDate: new Date().toISOString().split('T')[0]
      };
      
      await clientApiService.createJobRequest(requestData);
      toast({
        title: t('common.success'),
        description: t('client.requestJob.success.submitted'),
      });
      // Reset form
       setFormData({
         title: "",
         department: "",
         description: "",
         location: "",
         type: "",
         salary: "",
         experience: "",
         positions: 1,
         requirements: "",
         salaryMin: "",
         salaryMax: "",
         deadline: ""
       });
      // Refresh requests
      fetchJobRequests();
    } catch (error) {
      console.error('Error creating job request:', error);
      toast({
        title: t('common.error'),
        description: t('client.requestJob.errors.submitFailed'),
        variant: "destructive",
      });
    }
  };

  const handleView = async (request: JobRequest) => {
    try {
      const jobDetails = await clientApiService.getJobRequest(request.id);
      // You can implement a modal or navigate to a details page
      toast({
        title: t('client.requestJob.actions.view'),
        description: `${t('client.requestJob.form.jobTitle')}: ${jobDetails.title}`,
      });
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
    setFormData({
      title: request.title || "",
      department: request.department || "",
      description: request.description || "",
      location: request.location || "",
      type: request.type || "",
      salary: request.salary || "",
      experience: request.experience || "",
      positions: request.positions || 1,
      requirements: request.requirements || "",
      salaryMin: "",
      salaryMax: "",
      deadline: request.deadline || ""
    });
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

  return (
    <MainLayout userRole="client" userName={t('client.dashboard.defaultUserName')}>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('client.requestJob.title')}</h1>
          <p className="text-muted-foreground">{t('client.requestJob.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Request Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t('client.requestJob.form.title')}
                </CardTitle>
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
                    <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('client.requestJob.form.departmentPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">{t('client.requestJob.departments.development')}</SelectItem>
                        <SelectItem value="design">{t('client.requestJob.departments.design')}</SelectItem>
                        <SelectItem value="marketing">{t('client.requestJob.departments.marketing')}</SelectItem>
                        <SelectItem value="hr">{t('client.requestJob.departments.hr')}</SelectItem>
                        <SelectItem value="finance">{t('client.requestJob.departments.finance')}</SelectItem>
                        <SelectItem value="operations">{t('client.requestJob.departments.operations')}</SelectItem>
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
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('client.requestJob.form.location')} <span className="text-red-500">*</span></Label>
                    <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('client.requestJob.form.locationPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="riyadh">{t('client.requestJob.locations.riyadh')}</SelectItem>
                        <SelectItem value="jeddah">{t('client.requestJob.locations.jeddah')}</SelectItem>
                        <SelectItem value="dammam">{t('client.requestJob.locations.dammam')}</SelectItem>
                        <SelectItem value="mecca">{t('client.requestJob.locations.mecca')}</SelectItem>
                        <SelectItem value="medina">{t('client.requestJob.locations.medina')}</SelectItem>
                        <SelectItem value="remote">{t('client.requestJob.locations.remote')}</SelectItem>
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
                    <Select value={formData.experience} onValueChange={(value) => setFormData({...formData, experience: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('client.requestJob.form.experiencePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">{t('client.requestJob.experienceLevels.entry')}</SelectItem>
                        <SelectItem value="junior">{t('client.requestJob.experienceLevels.junior')}</SelectItem>
                        <SelectItem value="mid">{t('client.requestJob.experienceLevels.mid')}</SelectItem>
                        <SelectItem value="senior">{t('client.requestJob.experienceLevels.senior')}</SelectItem>
                        <SelectItem value="lead">{t('client.requestJob.experienceLevels.lead')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">{t('client.requestJob.form.requirements')}</Label>
                  <Textarea
                    id="requirements"
                    placeholder={t('client.requestJob.form.requirementsPlaceholder')}
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  />
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
                    {t('client.requestJob.form.submit')}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    {t('client.requestJob.form.saveDraft')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Guidelines and Quick Stats */}
          <div className="space-y-6">
            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
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
            <Card>
              <CardHeader>
                <CardTitle>{t('client.requestJob.sidebar.quickStats')}</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('client.requestJob.pendingRequests.title')} ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4 font-semibold">{t('client.requestJob.table.jobTitle')}</th>
                    <th className="text-right p-4 font-semibold">{t('client.requestJob.table.department')}</th>
                    <th className="text-right p-4 font-semibold">{t('client.requestJob.table.location')}</th>
                    <th className="text-right p-4 font-semibold">{t('client.requestJob.table.type')}</th>
                    <th className="text-right p-4 font-semibold">{t('client.requestJob.table.salary')}</th>
                    <th className="text-right p-4 font-semibold">{t('client.requestJob.table.submissionDate')}</th>
                    <th className="text-right p-4 font-semibold">{t('client.requestJob.table.status')}</th>
                    <th className="text-right p-4 font-semibold">{t('client.requestJob.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-muted-foreground">{t('client.requestJob.experience')}: {request.experience}</div>
                        </div>
                      </td>
                      <td className="p-4">{request.department}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {request.location}
                        </div>
                      </td>
                      <td className="p-4">{request.type}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          {request.salary} {t('client.requestJob.currency')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {request.submittedDate}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === 'قيد المراجعة' ? t('client.requestJob.status.pending') :
                           request.status === 'تمت الموافقة' ? t('client.requestJob.status.approved') :
                           request.status === 'مرفوض' ? t('client.requestJob.status.rejected') :
                           request.status === 'تحتاج تعديل' ? t('client.requestJob.status.needsRevision') :
                           request.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0" 
                            title={t('client.requestJob.actions.view')}
                            onClick={() => handleView(request)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(request)}
                            title={t('client.requestJob.actions.edit')}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(request.id)}
                            title={t('client.requestJob.actions.delete')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ClientRequestJob;
