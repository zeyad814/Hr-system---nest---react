import { useState, useEffect } from "react";
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
import { Search, Plus, FileText, Calendar, DollarSign, Building2, Eye, Edit, Download, Clock, CheckCircle, XCircle } from "lucide-react";
import { salesApiService, SalesContract } from "@/services/salesApi";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const SalesContracts = () => {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<SalesContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<SalesContract | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await salesApiService.getContracts();
      setContracts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error(t('salesContracts.errors.loadFailed'));
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContract = async (contractData: any) => {
    try {
      await salesApiService.createContract(contractData);
      toast.success(t('salesContracts.success.contractAdded'));
      setIsAddDialogOpen(false);
      loadContracts();
    } catch (error) {
      console.error('Error adding contract:', error);
      toast.error(t('salesContracts.errors.addFailed'));
    }
  };

  const handleUpdateContract = async (id: string, contractData: any) => {
    try {
      await salesApiService.updateContract(id, contractData);
      toast.success(t('salesContracts.success.contractUpdated'));
      loadContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      toast.error(t('salesContracts.errors.updateFailed'));
    }
  };

  const handleDeleteContract = async (id: string) => {
     try {
       await salesApiService.deleteContract(id);
       toast.success(t('salesContracts.success.contractDeleted'));
       loadContracts();
     } catch (error) {
       console.error('Error deleting contract:', error);
       toast.error(t('salesContracts.errors.deleteFailed'));
     }
   };

  const filteredContracts = (contracts || []).filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contract.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type.toLowerCase() === typeFilter;
    const matchesClient = clientFilter === 'all' || contract.client.name === clientFilter;
    return matchesSearch && matchesStatus && matchesType && matchesClient;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return t('salesContracts.status.active');
      case 'pending': return t('salesContracts.status.pending');
      case 'completed': return t('salesContracts.status.completed');
      case 'cancelled': return t('salesContracts.status.cancelled');
      case 'draft': return t('salesContracts.status.draft');
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'recruitment': return t('salesContracts.types.recruitment');
      case 'retainer': return t('salesContracts.types.retainer');
      case 'project': return t('salesContracts.types.project');
      case 'annual': return t('salesContracts.types.annual');
      default: return type;
    }
  };

  const getMilestoneStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const totalValue = filteredContracts.reduce((sum, contract) => sum + contract.value.amount, 0);
  const activeContracts = filteredContracts.filter(c => c.status.toLowerCase() === 'active').length;
  const completedContracts = filteredContracts.filter(c => c.status.toLowerCase() === 'completed').length;

  if (loading) {
    return (
      <MainLayout userRole="sales" userName="عمر حسن">
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('salesContracts.loading')}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{t('salesContracts.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">{t('salesContracts.description')}</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('salesContracts.addContract')}</span>
                <span className="sm:hidden">إضافة عقد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] overflow-y-auto p-3 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg lg:text-xl">{t('salesContracts.addContract')}</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {t('salesContracts.addContractDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs sm:text-sm">{t('salesContracts.fields.title')}</Label>
                  <Input id="title" placeholder={t('salesContracts.placeholders.title')} className="text-xs sm:text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client" className="text-xs sm:text-sm">{t('salesContracts.fields.client')}</Label>
                  <Select>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder={t('salesContracts.placeholders.selectClient')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(contracts.map(c => c.client.name))).map(clientName => (
                        <SelectItem key={clientName} value={clientName}>{clientName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs sm:text-sm">{t('salesContracts.fields.type')}</Label>
                  <Select>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder={t('salesContracts.placeholders.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recruitment">{t('salesContracts.types.recruitment')}</SelectItem>
                      <SelectItem value="retainer">{t('salesContracts.types.retainer')}</SelectItem>
                      <SelectItem value="project">{t('salesContracts.types.project')}</SelectItem>
                      <SelectItem value="annual">{t('salesContracts.types.annual')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-xs sm:text-sm">{t('salesContracts.fields.value')}</Label>
                  <Input id="value" type="number" placeholder="0" className="text-xs sm:text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-xs sm:text-sm">{t('salesContracts.fields.startDate')}</Label>
                  <Input id="start-date" type="date" className="text-xs sm:text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-xs sm:text-sm">{t('salesContracts.fields.endDate')}</Label>
                  <Input id="end-date" type="date" className="text-xs sm:text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission" className="text-xs sm:text-sm">{t('salesContracts.fields.commission')}</Label>
                  <Input id="commission" type="number" placeholder="0" className="text-xs sm:text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-terms" className="text-xs sm:text-sm">{t('salesContracts.fields.paymentTerms')}</Label>
                  <Select>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder={t('salesContracts.placeholders.selectPaymentTerms')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t('salesContracts.paymentTerms.monthly')}</SelectItem>
                      <SelectItem value="quarterly">{t('salesContracts.paymentTerms.quarterly')}</SelectItem>
                      <SelectItem value="on-completion">{t('salesContracts.paymentTerms.onCompletion')}</SelectItem>
                      <SelectItem value="milestone">{t('salesContracts.paymentTerms.milestone')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-xs sm:text-sm">{t('salesContracts.fields.description')}</Label>
                  <Textarea id="description" placeholder={t('salesContracts.placeholders.description')} rows={4} className="text-xs sm:text-sm" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-xs sm:text-sm">
                  {t('common.cancel')}
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)} className="text-xs sm:text-sm">
                  {t('salesContracts.addContract')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{t('salesContracts.stats.totalContracts')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{filteredContracts.length}</p>
                </div>
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{t('salesContracts.stats.activeContracts')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{activeContracts}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{t('salesContracts.stats.completedContracts')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{completedContracts}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{t('salesContracts.stats.totalValue')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{totalValue.toLocaleString()} ر.س</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('salesContracts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[120px] lg:w-[150px]">
                <SelectValue placeholder={t('salesContracts.filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('salesContracts.filters.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('salesContracts.status.active')}</SelectItem>
                <SelectItem value="pending">{t('salesContracts.status.pending')}</SelectItem>
                <SelectItem value="completed">{t('salesContracts.status.completed')}</SelectItem>
                <SelectItem value="cancelled">{t('salesContracts.status.cancelled')}</SelectItem>
                <SelectItem value="draft">{t('salesContracts.status.draft')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[120px] lg:w-[150px]">
                <SelectValue placeholder={t('salesContracts.filters.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('salesContracts.filters.allTypes')}</SelectItem>
                <SelectItem value="recruitment">{t('salesContracts.types.recruitment')}</SelectItem>
                <SelectItem value="retainer">{t('salesContracts.types.retainer')}</SelectItem>
                <SelectItem value="project">{t('salesContracts.types.project')}</SelectItem>
                <SelectItem value="annual">{t('salesContracts.types.annual')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full sm:w-[140px] lg:w-[200px]">
                <SelectValue placeholder={t('salesContracts.filters.client')} />
              </SelectTrigger>
              <SelectContent>
                        <SelectItem value="all">{t('salesContracts.filters.allClients')}</SelectItem>
                        {Array.from(new Set(contracts.map(c => c.client.name))).map(clientName => (
                          <SelectItem key={clientName} value={clientName}>{clientName}</SelectItem>
                        ))}
                      </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {filteredContracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm sm:text-base lg:text-lg truncate">{contract.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm truncate">{contract.client.name}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(contract.status)} text-xs flex-shrink-0`}>
                    {getStatusText(contract.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{getTypeText(contract.type)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{contract.value.amount.toLocaleString()} {contract.value.currency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{contract.startDate} - {contract.endDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600">العمولة</div>
                    <div className="font-semibold text-sm sm:text-base lg:text-lg">{contract.commission}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs sm:text-sm text-gray-600">المراحل</div>
                    <div className="font-semibold text-sm sm:text-base lg:text-lg">{contract.milestones.length}</div>
                  </div>
                </div>

                <div className="flex gap-1.5 sm:gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2" onClick={() => setSelectedContract(contract)}>
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">عرض</span>
                        <span className="sm:hidden">عرض</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-6xl h-[90vh] max-h-[90vh] overflow-y-auto p-3 sm:p-6">
                      <DialogHeader className="pb-3 sm:pb-4">
                        <DialogTitle className="text-base sm:text-lg">تفاصيل العقد</DialogTitle>
                      </DialogHeader>
                      {selectedContract && (
                        <Tabs defaultValue="info" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                            <TabsTrigger value="info" className="text-xs sm:text-sm px-2 sm:px-3 py-2">المعلومات</TabsTrigger>
                            <TabsTrigger value="milestones" className="text-xs sm:text-sm px-2 sm:px-3 py-2">المراحل</TabsTrigger>
                            <TabsTrigger value="documents" className="text-xs sm:text-sm px-2 sm:px-3 py-2">المستندات</TabsTrigger>
                            <TabsTrigger value="terms" className="text-xs sm:text-sm px-2 sm:px-3 py-2">الشروط</TabsTrigger>
                          </TabsList>
                          <TabsContent value="info" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <Label className="text-xs sm:text-sm font-medium">عنوان العقد</Label>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedContract.title}</p>
                              </div>
                              <div>
                                <Label className="text-xs sm:text-sm font-medium">العميل</Label>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedContract.client.name}</p>
                              </div>
                              <div>
                                <Label className="text-xs sm:text-sm font-medium">نوع العقد</Label>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{getTypeText(selectedContract.type)}</p>
                              </div>
                              <div>
                                <Label className="text-xs sm:text-sm font-medium">قيمة العقد</Label>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                  {selectedContract.value.amount.toLocaleString()} {selectedContract.value.currency}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs sm:text-sm font-medium">تاريخ البداية</Label>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedContract.startDate}</p>
                              </div>
                              <div>
                                <Label className="text-xs sm:text-sm font-medium">تاريخ النهاية</Label>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedContract.endDate}</p>
                              </div>
                              <div>
                                <Label className="text-xs sm:text-sm font-medium">شروط الدفع</Label>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedContract.paymentTerms}</p>
                              </div>
                              <div>
                                <Label className="text-xs sm:text-sm font-medium">نسبة العمولة</Label>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedContract.commission}%</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-medium">وصف العقد</Label>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedContract.description}</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="milestones" className="mt-3 sm:mt-4">
                            <div className="space-y-3 sm:space-y-4">
                              {selectedContract.milestones.map((milestone) => (
                                <Card key={milestone.id}>
                                  <CardContent className="p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        {getMilestoneStatusIcon(milestone.status)}
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-medium text-xs sm:text-sm truncate">{milestone.title}</h4>
                                          <p className="text-xs text-gray-600">استحقاق: {milestone.dueDate}</p>
                                        </div>
                                      </div>
                                      <div className="flex justify-between sm:block sm:text-right">
                                        <p className="font-semibold text-xs sm:text-sm">{milestone.amount.toLocaleString()} ر.س</p>
                                        <Badge className={`${getStatusColor(milestone.status)} text-xs`}>
                                          {getStatusText(milestone.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          <TabsContent value="documents" className="mt-3 sm:mt-4">
                            <div className="space-y-3 sm:space-y-4">
                              {selectedContract.documents.map((doc) => (
                                <Card key={doc.id}>
                                  <CardContent className="p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-medium text-xs sm:text-sm truncate">{doc.name}</h4>
                                          <p className="text-xs text-gray-600">تم الرفع: {doc.uploadDate}</p>
                                        </div>
                                      </div>
                                      <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        <span className="hidden sm:inline">تحميل</span>
                                        <span className="sm:hidden">تحميل</span>
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          <TabsContent value="terms" className="mt-3 sm:mt-4">
                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <Label className="text-xs sm:text-sm font-medium">شروط العقد</Label>
                                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mt-2">
                                  {selectedContract.terms.map((term, index) => (
                                    <li key={index}>{term}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2" onClick={() => {
                    // TODO: Implement edit functionality
                    toast.info('سيتم إضافة وظيفة التحديث قريباً');
                  }}>
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">{t('salesContracts.noResults.title')}</h3>
            <p className="text-sm sm:text-base text-gray-500 px-4">{t('salesContracts.noResults.description')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SalesContracts;