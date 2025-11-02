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
import { Search, Plus, Building2, Phone, Mail, MapPin, Calendar, DollarSign, Users, Briefcase, Eye, Edit, Trash2 } from "lucide-react";
import { salesApiService, SalesClient, CreateSalesClientDto } from "@/services/salesApi";
import { toast } from 'sonner';
import { useLanguage } from "@/contexts/LanguageContext";

// Using SalesClient interface from salesApi

// Removed mock data - will use API data

const SalesClients = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<SalesClient | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<SalesClient | null>(null);
  const [clients, setClients] = useState<SalesClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add client form state (same as contracts page)
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientLocation, setNewClientLocation] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');

  // Edit client form state
  const [editClientName, setEditClientName] = useState('');
  const [editClientCompany, setEditClientCompany] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientLocation, setEditClientLocation] = useState('');
  const [editClientIndustry, setEditClientIndustry] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  // No mock data — using API only

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await salesApiService.getClients();
      setClients(data.clients);
      setError(null);
    } catch (err) {
      toast.error('فشل تحميل العملاء من الخادم');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!newClientName.trim()) {
      toast.error('الرجاء إدخال اسم العميل');
      return;
    }
    try {
      const payload: CreateSalesClientDto = {
        name: newClientName,
        company: newClientCompany || undefined,
        email: newClientEmail || undefined,
        phone: newClientPhone || undefined,
        location: newClientLocation || undefined,
        industry: newClientIndustry || undefined,
        description: undefined,
        contactPerson: undefined,
      };

      await salesApiService.createClient(payload);
      await fetchClients();
      setIsAddDialogOpen(false);
      setNewClientName('');
      setNewClientCompany('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientLocation('');
      setNewClientIndustry('');
      toast.success('تم إضافة العميل بنجاح');
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('فشل إضافة العميل');
    }
  };

  const handleEditClient = (client: SalesClient) => {
    setEditingClient(client);
    setEditClientName(client.name);
    setEditClientCompany(client.company || '');
    setEditClientEmail(client.email || '');
    setEditClientPhone(client.phone || '');
    setEditClientLocation(client.location || '');
    setEditClientIndustry(client.industry || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!editClientName.trim() || !editingClient) {
      toast.error('الرجاء إدخال اسم العميل');
      return;
    }
    try {
      await salesApiService.updateClient(editingClient.id, {
        name: editClientName,
        company: editClientCompany || undefined,
        email: editClientEmail || undefined,
        phone: editClientPhone || undefined,
        location: editClientLocation || undefined,
        industry: editClientIndustry || undefined,
      });

      await fetchClients();
      setIsEditDialogOpen(false);
      setEditingClient(null);
      setEditClientName('');
      setEditClientCompany('');
      setEditClientEmail('');
      setEditClientPhone('');
      setEditClientLocation('');
      setEditClientIndustry('');
      toast.success('تم تحديث العميل بنجاح');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('فشل تحديث بيانات العميل');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await salesApiService.deleteClient(id);
        await fetchClients();
        toast.success('تم حذف العميل بنجاح');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('فشل حذف العميل');
      }
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return t('salesClients.status.active');
      case 'INACTIVE': return t('salesClients.status.inactive');
      case 'LEAD': return t('salesClients.status.lead');
      case 'PROSPECT': return t('salesClients.status.prospect');
      case 'CLOSED': return t('salesClients.status.closed');
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'LEAD': return 'bg-blue-100 text-blue-800';
      case 'PROSPECT': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || client.status.toLowerCase() === statusFilter;
    const matchesIndustry = industryFilter === 'all' || (client.industry && client.industry === industryFilter);
    return matchesSearch && matchesStatus && matchesIndustry;
  });



  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t('salesClients.title')}</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">{t('salesClients.subtitle')}</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full sm:w-auto text-sm md:text-base">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('salesClients.addNewClient')}</span>
                <span className="sm:hidden">{t('salesClients.add')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-lg mx-4 md:mx-auto">
                <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">{t('salesClients.addNewClient')}</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {t('salesClients.addClientDescription')}
                  </DialogDescription>
                </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-xs sm:text-sm">{t('salesClients.form.contactName')} <span className="text-red-500">*</span></Label>
                  <Input 
                    id="clientName" 
                    placeholder={t('salesClients.form.contactName')} 
                    className="text-xs sm:text-sm" 
                    value={newClientName} 
                    onChange={(e) => setNewClientName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientCompany" className="text-xs sm:text-sm">{t('salesClients.form.companyName')}</Label>
                  <Input 
                    id="clientCompany" 
                    placeholder={t('salesClients.form.companyName')} 
                    className="text-xs sm:text-sm" 
                    value={newClientCompany} 
                    onChange={(e) => setNewClientCompany(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail" className="text-xs sm:text-sm">{t('salesClients.form.email')}</Label>
                  <Input 
                    id="clientEmail" 
                    type="email" 
                    placeholder={t('salesClients.form.email')} 
                    className="text-xs sm:text-sm" 
                    value={newClientEmail} 
                    onChange={(e) => setNewClientEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone" className="text-xs sm:text-sm">{t('salesClients.form.phone')}</Label>
                  <Input 
                    id="clientPhone" 
                    placeholder={t('salesClients.form.phone')} 
                    className="text-xs sm:text-sm" 
                    value={newClientPhone} 
                    onChange={(e) => setNewClientPhone(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientLocation" className="text-xs sm:text-sm">{t('salesClients.form.location')}</Label>
                  <Input 
                    id="clientLocation" 
                    placeholder={t('salesClients.form.location')} 
                    className="text-xs sm:text-sm" 
                    value={newClientLocation} 
                    onChange={(e) => setNewClientLocation(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientIndustry" className="text-xs sm:text-sm">{t('salesClients.form.industry')}</Label>
                  <Input 
                    id="clientIndustry" 
                    placeholder={t('salesClients.form.industry')} 
                    className="text-xs sm:text-sm" 
                    value={newClientIndustry} 
                    onChange={(e) => setNewClientIndustry(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-xs sm:text-sm">
                  {t('salesClients.form.cancel')}
                </Button>
                <Button onClick={handleAddClient} className="text-xs sm:text-sm">
                  {t('salesClients.form.add')}
                </Button>
                </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-2"><span className="text-red-500">*</span> {t('salesContracts.requiredFields')}</p>
            </DialogContent>
          </Dialog>

          {/* Edit Client Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="w-[95vw] max-w-lg mx-4 md:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">{t('salesClients.editClient')}</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {t('salesClients.editClientDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editClientName" className="text-xs sm:text-sm">{t('salesClients.form.contactName')} <span className="text-red-500">*</span></Label>
                  <Input 
                    id="editClientName" 
                    placeholder={t('salesClients.form.contactName')} 
                    className="text-xs sm:text-sm" 
                    value={editClientName} 
                    onChange={(e) => setEditClientName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClientCompany" className="text-xs sm:text-sm">{t('salesClients.form.companyName')}</Label>
                  <Input 
                    id="editClientCompany" 
                    placeholder={t('salesClients.form.companyName')} 
                    className="text-xs sm:text-sm" 
                    value={editClientCompany} 
                    onChange={(e) => setEditClientCompany(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClientEmail" className="text-xs sm:text-sm">{t('salesClients.form.email')}</Label>
                  <Input 
                    id="editClientEmail" 
                    type="email" 
                    placeholder={t('salesClients.form.email')} 
                    className="text-xs sm:text-sm" 
                    value={editClientEmail} 
                    onChange={(e) => setEditClientEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClientPhone" className="text-xs sm:text-sm">{t('salesClients.form.phone')}</Label>
                  <Input 
                    id="editClientPhone" 
                    placeholder={t('salesClients.form.phone')} 
                    className="text-xs sm:text-sm" 
                    value={editClientPhone} 
                    onChange={(e) => setEditClientPhone(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClientLocation" className="text-xs sm:text-sm">{t('salesClients.form.location')}</Label>
                  <Input 
                    id="editClientLocation" 
                    placeholder={t('salesClients.form.location')} 
                    className="text-xs sm:text-sm" 
                    value={editClientLocation} 
                    onChange={(e) => setEditClientLocation(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClientIndustry" className="text-xs sm:text-sm">{t('salesClients.form.industry')}</Label>
                  <Input 
                    id="editClientIndustry" 
                    placeholder={t('salesClients.form.industry')} 
                    className="text-xs sm:text-sm" 
                    value={editClientIndustry} 
                    onChange={(e) => setEditClientIndustry(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-xs sm:text-sm">
                  {t('salesClients.form.cancel')}
                </Button>
                <Button onClick={handleUpdateClient} className="text-xs sm:text-sm">
                  {t('salesClients.form.update')}
                </Button>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-2"><span className="text-red-500">*</span> {t('salesContracts.requiredFields')}</p>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('salesClients.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm md:text-base"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] text-sm md:text-base">
              <SelectValue placeholder={t('salesClients.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('salesClients.allStatuses')}</SelectItem>
              <SelectItem value="active">{t('salesClients.status.active')}</SelectItem>
              <SelectItem value="inactive">{t('salesClients.status.inactive')}</SelectItem>
              <SelectItem value="lead">{t('salesClients.status.lead')}</SelectItem>
              <SelectItem value="prospect">{t('salesClients.status.prospect')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] text-sm md:text-base">
              <SelectValue placeholder={t('salesClients.filterByIndustry')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('salesClients.allIndustries')}</SelectItem>
              <SelectItem value="تقنية المعلومات">{t('salesClients.industries.tech')}</SelectItem>
              <SelectItem value="الخدمات المالية">{t('salesClients.industries.finance')}</SelectItem>
              <SelectItem value="البناء والتشييد">{t('salesClients.industries.construction')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('salesClients.loading')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchClients} variant="outline">
                {t('salesClients.retry')}
              </Button>
            </div>
          </div>
        )}

        {/* Clients Grid */}
        {!loading && !error && filteredClients.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 md:pb-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="bg-blue-100 p-1.5 md:p-2 rounded-lg">
                        <Building2 className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base md:text-lg truncate">{client.company || t('sales.clients.notSpecified')}</CardTitle>
                        <CardDescription className="text-sm truncate">{client.name}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(client.status)} text-xs whitespace-nowrap`}>
                      {getStatusText(client.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                      <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">{client.email || t('sales.clients.notSpecified')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                      <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">{client.phone || t('sales.clients.notSpecified')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                      <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">{client.location || t('sales.clients.notSpecified')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs md:text-sm text-gray-600">
                        <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">{t('sales.clients.jobs')}</span>
                        <span className="sm:hidden">{t('sales.clients.jobsShort')}</span>
                      </div>
                      <div className="font-semibold text-base md:text-lg">{client.jobs?.length || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs md:text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">{t('sales.clients.createdDate')}</span>
                        <span className="sm:hidden">{t('sales.clients.created')}</span>
                      </div>
                      <div className="font-semibold text-xs md:text-sm">{new Date(client.createdAt).toLocaleDateString('ar-SA')}</div>
                    </div>
                  </div>

                <div className="flex gap-1.5 md:gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 text-xs md:text-sm px-2 md:px-3" onClick={() => setSelectedClient(client)}>
                        <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                        <span className="hidden sm:inline">{t('sales.clients.view')}</span>
                        <span className="sm:hidden">{t('sales.clients.viewShort')}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl mx-4 md:mx-auto max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-lg md:text-xl">{t('sales.clients.clientDetails')}</DialogTitle>
                      </DialogHeader>
                      {selectedClient && (
                        <Tabs defaultValue="info" className="w-full">
                          <TabsList className="grid w-full grid-cols-3 h-auto">
                            <TabsTrigger value="info" className="text-xs md:text-sm px-2 md:px-4 py-2">{t('sales.clients.basicInfo')}</TabsTrigger>
                            <TabsTrigger value="jobs" className="text-xs md:text-sm px-2 md:px-4 py-2">{t('sales.clients.jobs')}</TabsTrigger>
                            <TabsTrigger value="activity" className="text-xs md:text-sm px-2 md:px-4 py-2">{t('sales.clients.activity')}</TabsTrigger>
                          </TabsList>
                          <TabsContent value="info" className="space-y-3 md:space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                              <div>
                                <Label className="text-sm md:text-base">{t('sales.clients.form.contactName')}</Label>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">{selectedClient.name}</p>
                              </div>
                              <div>
                                <Label className="text-sm md:text-base">{t('sales.clients.form.companyName')}</Label>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">{selectedClient.company || t('sales.clients.notSpecified')}</p>
                              </div>
                              <div>
                                <Label className="text-sm md:text-base">{t('sales.clients.form.email')}</Label>
                                <p className="text-xs md:text-sm text-gray-600 mt-1 break-all">{selectedClient.email || t('sales.clients.notSpecified')}</p>
                              </div>
                              <div>
                                <Label className="text-sm md:text-base">{t('sales.clients.form.phone')}</Label>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">{selectedClient.phone || t('sales.clients.notSpecified')}</p>
                              </div>
                              <div>
                                <Label className="text-sm md:text-base">{t('sales.clients.form.location')}</Label>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">{selectedClient.location || t('sales.clients.notSpecified')}</p>
                              </div>
                              <div>
                                <Label className="text-sm md:text-base">{t('sales.clients.form.industry')}</Label>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">{selectedClient.industry || t('sales.clients.notSpecified')}</p>
                              </div>
                              <div>
                                <Label className="text-sm md:text-base">{t('sales.clients.createdDate')}</Label>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">{new Date(selectedClient.createdAt).toLocaleDateString('ar-SA')}</p>
                              </div>
                              <div>
                                <Label className="text-sm md:text-base">{t('sales.clients.lastUpdate')}</Label>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">{new Date(selectedClient.updatedAt).toLocaleDateString('ar-SA')}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm md:text-base">{t('sales.clients.form.description')}</Label>
                              <p className="text-xs md:text-sm text-gray-600 mt-1">{selectedClient.description || t('sales.clients.notSpecified')}</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="jobs" className="mt-4">
                            <p className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">{t('sales.clients.jobsListPlaceholder')}</p>
                          </TabsContent>
                          <TabsContent value="activity" className="mt-4">
                            <p className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">{t('sales.clients.activityLogPlaceholder')}</p>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 px-2 md:px-3"
                    onClick={() => handleEditClient(client)}>
                    <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 px-2 md:px-3"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!loading && !error && filteredClients.length === 0 && (
          <div className="text-center py-8 md:py-12 px-4">
            <Building2 className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">{t('salesClients.noClients')}</h3>
            <p className="text-sm md:text-base text-gray-500">{t('salesClients.noClientsDescription')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SalesClients;