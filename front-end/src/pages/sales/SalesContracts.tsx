import { useState, useEffect, useCallback, useMemo } from "react";
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
import { salesApiService, SalesContract, SalesClient } from "@/services/salesApi";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSalesCurrency } from "@/contexts/SalesCurrencyContext";

const SalesContracts = () => {
  const { t, language } = useLanguage();
  const { currency: selectedCurrency, getCurrencyIcon, getCurrencyName } = useSalesCurrency();
  const [contracts, setContracts] = useState<SalesContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<SalesContract | null>(null);
  
  // Mock clients data for dropdown
  const mockClients = useMemo(() => [
    { id: '1', name: 'شركة التطوير المتقدم', company: 'شركة التطوير المتقدم' },
    { id: '2', name: 'مؤسسة الابتكار التقني', company: 'مؤسسة الابتكار التقني' },
    { id: '3', name: 'مجموعة الأعمال الرقمية', company: 'مجموعة الأعمال الرقمية' },
    { id: '4', name: 'شركة الحلول الذكية', company: 'شركة الحلول الذكية' },
    { id: '5', name: 'مؤسسة التقنية الحديثة', company: 'مؤسسة التقنية الحديثة' },
    { id: '6', name: 'شركة الاستشارات المهنية', company: 'شركة الاستشارات المهنية' },
    { id: '7', name: 'مجموعة الخدمات المتكاملة', company: 'مجموعة الخدمات المتكاملة' },
    { id: '8', name: 'شركة التكنولوجيا المتطورة', company: 'شركة التكنولوجيا المتطورة' }
  ], []);
  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newType, setNewType] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newCommission, setNewCommission] = useState('');
  const [newPaymentTerms, setNewPaymentTerms] = useState('');
  const [newDescription, setNewDescription] = useState('');
  // Edit contract form state
  const [isEditContractDialogOpen, setIsEditContractDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<SalesContract | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editCommission, setEditCommission] = useState('');
  const [editPaymentTerms, setEditPaymentTerms] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Add client form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientLocation, setNewClientLocation] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [clients, setClients] = useState<SalesClient[]>([]);

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const clientsRes = await salesApiService.getClients();
      setClients(clientsRes.clients || []);
      const data = await salesApiService.getContracts();
      setContracts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading contracts:', error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // Listen for localStorage changes (when clients are updated from other tabs/pages)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'salesClients' && e.newValue) {
        const updatedClients = JSON.parse(e.newValue);
        setClients(updatedClients);
      }
      if (e.key === 'salesContracts' && e.newValue) {
        const updatedContracts = JSON.parse(e.newValue);
        setContracts(updatedContracts);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleEditContract = (contract: SalesContract) => {
    setEditingContract(contract);
    setEditTitle(contract.title || '');
    setEditType(contract.type || 'recruitment');
    setEditValue(String(contract.value?.amount ?? ''));
    setEditStartDate(contract.startDate || '');
    setEditEndDate(contract.endDate || '');
    setEditCommission(String(contract.commission ?? ''));
    setEditPaymentTerms(contract.paymentTerms || '');
    setEditDescription(contract.description || '');
    setIsEditContractDialogOpen(true);
  };

  const handleUpdateContractLocal = () => {
    if (!editingContract) return;
    if (!editTitle.trim()) {
      toast.error(t('salesContracts.validation.requiredFields'));
      return;
    }
    if (!editType) {
      toast.error('الرجاء اختيار نوع العقد');
      return;
    }
    if (!editValue || Number(editValue) <= 0) {
      toast.error('الرجاء إدخال قيمة العقد');
      return;
    }
    if (!editingContract.client) {
      toast.error('الرجاء اختيار العميل');
      return;
    }
    const updated: SalesContract = {
      ...editingContract,
      title: editTitle,
      type: editType,
      value: { 
        amount: Number(editValue) || 0, 
        currency: editingContract.value?.currency || selectedCurrency 
      },
      startDate: editStartDate,
      endDate: editEndDate,
      commission: Number(editCommission) || 0,
      paymentTerms: editPaymentTerms,
      description: editDescription,
      updatedAt: new Date().toISOString(),
    } as SalesContract;

    const updatedContracts = contracts.map(c => c.id === editingContract.id ? updated : c);
    setContracts(updatedContracts);
    localStorage.setItem('salesContracts', JSON.stringify(updatedContracts));
    setIsEditContractDialogOpen(false);
    setEditingContract(null);
    toast.success(t('salesContracts.success.contractUpdated') || 'تم تحديث العقد بنجاح');
  };

  const handleDownloadContract = (contract: SalesContract) => {
    try {
      const dataStr = JSON.stringify(contract, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract.title || 'contract'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error downloading contract:', e);
      toast.error(t('salesContracts.errors.downloadFailed') || 'فشل تحميل الملف');
    }
  };

  const handleDownloadDocument = (doc: { name: string; fileUrl?: string }) => {
    try {
      if (doc.fileUrl) {
        const a = document.createElement('a');
        a.href = doc.fileUrl;
        a.download = doc.name;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
      } else {
        toast.error(t('salesContracts.errors.downloadFailed') || 'فشل تحميل الملف');
      }
    } catch (e) {
      console.error('Error downloading document:', e);
      toast.error(t('salesContracts.errors.downloadFailed') || 'فشل تحميل الملف');
    }
  };

  const handleAddContract = async (contractData: {
    title: string;
    clientName: string;
    type: string;
    value: number;
    startDate: string;
    endDate: string | null;
    commission: number | null;
    paymentTerms: string | null;
    description: string;
  }) => {
    try {
      const selectedClient = clients.find((c) => c.name === contractData.clientName);
      if (!selectedClient) {
        toast.error(t('salesContracts.validation.selectClient') || 'يرجى اختيار عميل صحيح');
        return;
      }

      // Map to API DTO
      await salesApiService.createContract({
        title: contractData.title,
        clientId: selectedClient.id,
        type: (contractData.type || 'RECRUITMENT').toUpperCase() as 'RECRUITMENT' | 'RETAINER' | 'PROJECT' | 'ANNUAL',
        value: Number(contractData.value) || 0,
        currency: selectedCurrency,
        startDate: contractData.startDate,
        endDate: contractData.endDate || contractData.startDate,
        paymentTerms: contractData.paymentTerms || undefined,
        commission: contractData.commission ?? undefined,
        description: contractData.description || undefined,
      });
      toast.success(t('salesContracts.success.contractAdded'));
      setIsAddDialogOpen(false);
      // reset form
      setNewTitle('');
      setNewClient('');
      setNewType('');
      setNewValue('');
      setNewStartDate('');
      setNewEndDate('');
      setNewCommission('');
      setNewPaymentTerms('');
      setNewDescription('');
      loadContracts();
    } catch (error) {
      console.error('Error adding contract:', error);
      toast.error(t('salesContracts.errors.createFailed') || 'فشل إضافة العقد');
    }
  };

  const handleAddClient = () => {
    if (!newClientName.trim()) {
      toast.error('الرجاء إدخال اسم العميل');
      return;
    }

    const newClient = {
      id: Date.now().toString(),
      name: newClientName,
      company: newClientCompany || newClientName,
      email: newClientEmail || undefined,
      phone: newClientPhone || undefined,
      location: newClientLocation || undefined,
      industry: newClientIndustry || undefined,
      status: 'LEAD' as const,
      totalJobs: 0,
      totalSpent: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    
    // Save to localStorage
    localStorage.setItem('salesClients', JSON.stringify(updatedClients));
    
    setNewClient(newClient.name);
    setIsAddClientDialogOpen(false);
    
    // Reset form
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientLocation('');
    setNewClientIndustry('');
    
    toast.success('تم إضافة العميل بنجاح');
  };

  const handleUpdateContract = async (id: string, contractData: Record<string, unknown>) => {
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
      await loadContracts();
      toast.success(t('salesContracts.success.contractDeleted') || 'تم حذف العقد بنجاح');
     } catch (error) {
       console.error('Error deleting contract:', error);
      toast.error(t('salesContracts.errors.deleteFailed') || 'فشل حذف العقد');
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

  // Calculate statistics with selected currency
  const totalValue = useMemo(() => {
    return filteredContracts.reduce((sum, contract) => {
      // Convert to selected currency (realistic conversion rates)
      // All rates are relative to SAR as base currency
      const conversionRates: Record<string, number> = {
        'SAR': 1,      // Base currency
        'AED': 0.98,   // 1 SAR = 0.98 AED (تقريباً متساويان)
        'USD': 0.27,   // 1 SAR = 0.27 USD (تقريباً 3.7 SAR = 1 USD)
        'EUR': 0.25,   // 1 SAR = 0.25 EUR (تقريباً 4 SAR = 1 EUR)
        'INR': 22.5,   // 1 SAR = 22.5 INR (تقريباً)
        'PKR': 75.2    // 1 SAR = 75.2 PKR (تقريباً)
      };
      
      const contractCurrency = contract.value?.currency || 'SAR';
      const contractAmount = contract.value?.amount || 0;
      
      // If contract is already in selected currency, no conversion needed
      if (contractCurrency === selectedCurrency) {
        return sum + contractAmount;
      }
      
      // Convert from contract currency to SAR, then to selected currency
      const sarAmount = contractAmount / (conversionRates[contractCurrency] || 1);
      const convertedAmount = sarAmount * (conversionRates[selectedCurrency] || 1);
      
      return sum + convertedAmount;
    }, 0);
  }, [filteredContracts, selectedCurrency]);

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
          <div className="flex items-center gap-3">
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
                  <Label htmlFor="title" className="text-xs sm:text-sm">{t('salesContracts.fields.title')} <span className="text-red-500">*</span></Label>
                  <Input id="title" placeholder={t('salesContracts.placeholders.title')} className="text-xs sm:text-sm" value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="client" className="text-xs sm:text-sm">{t('salesContracts.fields.client')} <span className="text-red-500">*</span></Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="text-xs px-2 py-1 h-6"
                      onClick={() => setIsAddClientDialogOpen(true)}
                    >
                      + إضافة عميل
                    </Button>
                  </div>
                  <Select value={newClient} onValueChange={setNewClient}>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder={t('salesContracts.placeholders.selectClient')} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs sm:text-sm">{t('salesContracts.fields.type')} <span className="text-red-500">*</span></Label>
                  <Select value={newType} onValueChange={setNewType}>
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
                  <Label htmlFor="value" className="text-xs sm:text-sm">{t('salesContracts.fields.value')} <span className="text-red-500">*</span></Label>
                  <Input id="value" type="number" placeholder="0" className="text-xs sm:text-sm" value={newValue} onChange={(e)=>setNewValue(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-xs sm:text-sm">{t('salesContracts.fields.currency')}</Label>
                  <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-md border">
                    <span className="text-2xl">{getCurrencyIcon(selectedCurrency)}</span>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">{getCurrencyName(selectedCurrency, language)}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar' ? 'العملة المحددة من الداشبورد' : 'Currency selected from dashboard'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-xs sm:text-sm">{t('salesContracts.fields.startDate')} <span className="text-red-500">*</span></Label>
                  <Input id="start-date" type="date" className="text-xs sm:text-sm" value={newStartDate} onChange={(e)=>setNewStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-xs sm:text-sm">{t('salesContracts.fields.endDate')}</Label>
                  <Input id="end-date" type="date" className="text-xs sm:text-sm" value={newEndDate} onChange={(e)=>setNewEndDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission" className="text-xs sm:text-sm">{t('salesContracts.fields.commission')}</Label>
                  <Input id="commission" type="number" placeholder="0" className="text-xs sm:text-sm" value={newCommission} onChange={(e)=>setNewCommission(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-terms" className="text-xs sm:text-sm">{t('salesContracts.fields.paymentTerms')}</Label>
                  <Select value={newPaymentTerms} onValueChange={setNewPaymentTerms}>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue placeholder={t('salesContracts.placeholders.selectPaymentTerms')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{t('salesContracts.paymentTerms.monthly')}</SelectItem>
                      <SelectItem value="quarterly">{t('salesContracts.paymentTerms.quarterly')}</SelectItem>
                      <SelectItem value="annually">{t('salesContracts.paymentTerms.annually')}</SelectItem>
                      <SelectItem value="on-completion">{t('salesContracts.paymentTerms.onCompletion')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-xs sm:text-sm">{t('salesContracts.fields.description')}</Label>
                  <Textarea id="description" placeholder={t('salesContracts.placeholders.description')} rows={4} className="text-xs sm:text-sm" value={newDescription} onChange={(e)=>setNewDescription(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-xs sm:text-sm">
                  {t('common.cancel')}
                </Button>
                <Button onClick={() => {
                  if (!newTitle || !newClient || !newType || !newValue || !newStartDate) {
                    toast.error(t('salesContracts.validation.required'));
                    return;
                  }
                  handleAddContract({
                    title: newTitle,
                    clientName: newClient,
                    type: newType,
                    value: Number(newValue),
                    startDate: newStartDate,
                    endDate: newEndDate || null,
                    commission: newCommission ? Number(newCommission) : null,
                    paymentTerms: newPaymentTerms || null,
                    description: newDescription || ''
                  });
                }} className="text-xs sm:text-sm">
                  {t('salesContracts.addContract')}
                </Button>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-2"><span className="text-red-500">*</span> {t('salesContracts.requiredFields') || 'الحقول المطلوبة'}</p>
            </DialogContent>
          </Dialog>
          </div>
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
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1">
                    {totalValue.toLocaleString()} {selectedCurrency}
                  </p>
                </div>
                <span className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0 text-2xl leading-none">
                  {getCurrencyIcon(selectedCurrency)}
                </span>
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
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
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
                    <span className="text-red-500 font-bold">{getCurrencyIcon(contract.value.currency as any)}</span>
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
                                      <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2" onClick={() => handleDownloadDocument(doc)}>
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
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2" onClick={() => handleEditContract(contract)}>
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2" onClick={() => handleDownloadContract(contract)}>
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

        {/* Edit Contract Dialog */}
        <Dialog open={isEditContractDialogOpen} onOpenChange={setIsEditContractDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{t('salesContracts.actions.edit') || 'تعديل العقد'}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {t('salesContracts.actions.editDescription') || 'قم بتحديث بيانات العقد'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle" className="text-xs sm:text-sm">{t('salesContracts.fields.title') || 'عنوان العقد'} <span className="text-red-500">*</span></Label>
                <Input id="editTitle" className="text-xs sm:text-sm" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClient" className="text-xs sm:text-sm">{t('salesContracts.fields.client') || 'العميل'} <span className="text-red-500">*</span></Label>
                <Select 
                  value={editingContract?.client?.id || ''} 
                  onValueChange={(value) => {
                    const selectedClient = clients.find(c => c.id === value || c.name === value);
                    if (selectedClient && editingContract) {
                      setEditingContract({
                        ...editingContract,
                        client: selectedClient
                      });
                    }
                  }}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder={editingContract?.client?.name || 'اختر العميل'} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Ensure the current client is in the list */}
                    {editingContract?.client && !clients.find(c => c.id === editingContract.client.id) && (
                      <SelectItem value={editingContract.client.id}>
                        {editingContract.client.name}
                      </SelectItem>
                    )}
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editType" className="text-xs sm:text-sm">{t('salesContracts.fields.type') || 'نوع العقد'} <span className="text-red-500">*</span></Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="اختر نوع العقد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recruitment">{t('salesContracts.types.recruitment') || 'عقد توظيف'}</SelectItem>
                    <SelectItem value="retainer">{t('salesContracts.types.retainer') || 'عقد استشارات'}</SelectItem>
                    <SelectItem value="project">{t('salesContracts.types.project') || 'عقد مشروع'}</SelectItem>
                    <SelectItem value="annual">{t('salesContracts.types.annual') || 'عقد سنوي'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editValue" className="text-xs sm:text-sm">{t('salesContracts.fields.value') || 'قيمة العقد'} <span className="text-red-500">*</span></Label>
                <Input id="editValue" type="number" className="text-xs sm:text-sm" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCurrency" className="text-xs sm:text-sm">{t('salesContracts.fields.currency') || 'العملة'} <span className="text-red-500">*</span></Label>
                <Select value={editingContract?.value?.currency || selectedCurrency} onValueChange={(value) => {
                  if (editingContract) {
                    setEditingContract({
                      ...editingContract,
                      value: {
                        ...editingContract.value,
                        currency: value
                      }
                    });
                  }
                }}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder={t('salesContracts.placeholders.selectCurrency')}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{getCurrencyIcon(editingContract?.value?.currency || selectedCurrency)}</span>
                        <span>{t(`salesContracts.currencies.${(editingContract?.value?.currency || selectedCurrency).toLowerCase()}`)}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🇸🇦</span>
                        <span>{t('salesContracts.currencies.sar')}</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="AED">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🇦🇪</span>
                        <span>{t('salesContracts.currencies.aed')}</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="USD">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🇺🇸</span>
                        <span>{t('salesContracts.currencies.usd')}</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="EUR">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🇪🇺</span>
                        <span>{t('salesContracts.currencies.eur')}</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="INR">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🇮🇳</span>
                        <span>{t('salesContracts.currencies.inr')}</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="PKR">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🇵🇰</span>
                        <span>{t('salesContracts.currencies.pkr')}</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStartDate" className="text-xs sm:text-sm">{t('salesContracts.fields.startDate') || 'تاريخ البداية'}</Label>
                <Input id="editStartDate" type="date" className="text-xs sm:text-sm" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEndDate" className="text-xs sm:text-sm">{t('salesContracts.fields.endDate') || 'تاريخ النهاية'}</Label>
                <Input id="editEndDate" type="date" className="text-xs sm:text-sm" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCommission" className="text-xs sm:text-sm">{t('salesContracts.fields.commission') || 'نسبة العمولة'}</Label>
                <Input id="editCommission" type="number" className="text-xs sm:text-sm" value={editCommission} onChange={(e) => setEditCommission(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPaymentTerms" className="text-xs sm:text-sm">{t('salesContracts.fields.paymentTerms') || 'شروط الدفع'}</Label>
                <Select value={editPaymentTerms} onValueChange={setEditPaymentTerms}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder={t('salesContracts.placeholders.paymentTerms') || 'اختر شروط الدفع'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t('salesContracts.paymentTerms.monthly') || 'شهري'}</SelectItem>
                    <SelectItem value="quarterly">{t('salesContracts.paymentTerms.quarterly') || 'ربعي'}</SelectItem>
                    <SelectItem value="annually">{t('salesContracts.paymentTerms.annually') || 'سنوي'}</SelectItem>
                    <SelectItem value="on-completion">{t('salesContracts.paymentTerms.onCompletion') || 'عند الإنجاز'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="editDescription" className="text-xs sm:text-sm">{t('salesContracts.fields.description') || 'الوصف'}</Label>
                <Textarea id="editDescription" className="text-xs sm:text-sm" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditContractDialogOpen(false)} className="text-xs sm:text-sm">
                {t('salesClients.form.cancel') || 'إلغاء'}
              </Button>
              <Button onClick={handleUpdateContractLocal} className="text-xs sm:text-sm">
                {t('salesClients.form.update') || 'تحديث'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Client Dialog */}
        <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">إضافة عميل جديد</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                أدخل بيانات العميل الجديد
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-xs sm:text-sm">اسم العميل <span className="text-red-500">*</span></Label>
                <Input 
                  id="clientName" 
                  placeholder="أدخل اسم العميل" 
                  className="text-xs sm:text-sm" 
                  value={newClientName} 
                  onChange={(e) => setNewClientName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCompany" className="text-xs sm:text-sm">اسم الشركة</Label>
                <Input 
                  id="clientCompany" 
                  placeholder="أدخل اسم الشركة" 
                  className="text-xs sm:text-sm" 
                  value={newClientCompany} 
                  onChange={(e) => setNewClientCompany(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-xs sm:text-sm">البريد الإلكتروني</Label>
                <Input 
                  id="clientEmail" 
                  type="email" 
                  placeholder="أدخل البريد الإلكتروني" 
                  className="text-xs sm:text-sm" 
                  value={newClientEmail} 
                  onChange={(e) => setNewClientEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-xs sm:text-sm">رقم الهاتف</Label>
                <Input 
                  id="clientPhone" 
                  placeholder="أدخل رقم الهاتف" 
                  className="text-xs sm:text-sm" 
                  value={newClientPhone} 
                  onChange={(e) => setNewClientPhone(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientLocation" className="text-xs sm:text-sm">الموقع</Label>
                <Input 
                  id="clientLocation" 
                  placeholder="أدخل الموقع" 
                  className="text-xs sm:text-sm" 
                  value={newClientLocation} 
                  onChange={(e) => setNewClientLocation(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientIndustry" className="text-xs sm:text-sm">الصناعة</Label>
                <Input 
                  id="clientIndustry" 
                  placeholder="أدخل الصناعة" 
                  className="text-xs sm:text-sm" 
                  value={newClientIndustry} 
                  onChange={(e) => setNewClientIndustry(e.target.value)} 
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddClientDialogOpen(false)} className="text-xs sm:text-sm">
                إلغاء
              </Button>
              <Button onClick={handleAddClient} className="text-xs sm:text-sm">
                إضافة العميل
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default SalesContracts;
// Edit Contract Dialog
// Note: Placed before export if UI library requires placement, otherwise can be in JSX above