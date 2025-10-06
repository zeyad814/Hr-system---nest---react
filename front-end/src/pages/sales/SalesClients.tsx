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
  const [clients, setClients] = useState<SalesClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await salesApiService.getClients();
      setClients(data.clients);
      setError(null);
    } catch (err) {
      setError(t('sales.clients.errors.fetchFailed'));
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (clientData: CreateSalesClientDto) => {
    try {
      await salesApiService.createClient(clientData);
      toast.success(t('sales.clients.messages.addSuccess'));
      setIsAddDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error(t('sales.clients.errors.addFailed'));
    }
  };

  const handleUpdateClient = async (id: string, clientData: Partial<SalesClient>) => {
    try {
      await salesApiService.updateClient(id, clientData);
      toast.success(t('sales.clients.messages.updateSuccess'));
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error(t('sales.clients.errors.updateFailed'));
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await salesApiService.deleteClient(id);
        toast.success(t('sales.clients.messages.deleteSuccess'));
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error(t('sales.clients.errors.deleteFailed'));
      }
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return t('sales.clients.status.active');
      case 'INACTIVE': return t('sales.clients.status.inactive');
      case 'LEAD': return t('sales.clients.status.lead');
      case 'PROSPECT': return t('sales.clients.status.prospect');
      case 'CLOSED': return t('sales.clients.status.closed');
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
            <h1 className="text-2xl md:text-3xl font-bold">{t('sales.clients.title')}</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">{t('sales.clients.subtitle')}</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full sm:w-auto text-sm md:text-base">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('sales.clients.addNewClient')}</span>
                <span className="sm:hidden">{t('sales.clients.add')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 md:mx-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">{t('sales.clients.addNewClient')}</DialogTitle>
                  <DialogDescription className="text-sm md:text-base">
                    {t('sales.clients.addClientDescription')}
                  </DialogDescription>
                </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="name" className="text-sm md:text-base">{t('sales.clients.form.contactName')}</Label>
                  <Input id="name" placeholder={t('sales.clients.form.contactNamePlaceholder')} className="text-sm md:text-base" />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="company" className="text-sm md:text-base">{t('sales.clients.form.companyName')}</Label>
                  <Input id="company" placeholder={t('sales.clients.form.companyNamePlaceholder')} className="text-sm md:text-base" />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="email" className="text-sm md:text-base">{t('sales.clients.form.email')}</Label>
                  <Input id="email" type="email" placeholder={t('sales.clients.form.emailPlaceholder')} className="text-sm md:text-base" />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="phone" className="text-sm md:text-base">{t('sales.clients.form.phone')}</Label>
                  <Input id="phone" placeholder={t('sales.clients.form.phonePlaceholder')} className="text-sm md:text-base" />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="location" className="text-sm md:text-base">{t('sales.clients.form.location')}</Label>
                  <Input id="location" placeholder={t('sales.clients.form.locationPlaceholder')} className="text-sm md:text-base" />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="industry" className="text-sm md:text-base">{t('sales.clients.form.industry')}</Label>
                  <Select>
                    <SelectTrigger className="text-sm md:text-base">
                      <SelectValue placeholder={t('sales.clients.form.industryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">{t('sales.clients.industries.tech')}</SelectItem>
                      <SelectItem value="finance">{t('sales.clients.industries.finance')}</SelectItem>
                      <SelectItem value="construction">{t('sales.clients.industries.construction')}</SelectItem>
                      <SelectItem value="healthcare">{t('sales.clients.industries.healthcare')}</SelectItem>
                      <SelectItem value="education">{t('sales.clients.industries.education')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1.5 md:space-y-2">
                  <Label htmlFor="description" className="text-sm md:text-base">{t('sales.clients.form.description')}</Label>
                  <Textarea id="description" placeholder={t('sales.clients.form.descriptionPlaceholder')} className="text-sm md:text-base" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3 md:mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-sm md:text-base">
                  {t('sales.clients.form.cancel')}
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)} className="text-sm md:text-base">
                  {t('sales.clients.form.add')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('sales.clients.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm md:text-base"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] text-sm md:text-base">
              <SelectValue placeholder={t('sales.clients.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('sales.clients.allStatuses')}</SelectItem>
              <SelectItem value="active">{t('sales.clients.status.active')}</SelectItem>
              <SelectItem value="inactive">{t('sales.clients.status.inactive')}</SelectItem>
              <SelectItem value="potential">{t('sales.clients.status.potential')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] text-sm md:text-base">
              <SelectValue placeholder={t('sales.clients.filterByIndustry')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('sales.clients.allIndustries')}</SelectItem>
              <SelectItem value="تقنية المعلومات">{t('sales.clients.industries.tech')}</SelectItem>
              <SelectItem value="الخدمات المالية">{t('sales.clients.industries.finance')}</SelectItem>
              <SelectItem value="البناء والتشييد">{t('sales.clients.industries.construction')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('sales.clients.loading')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchClients} variant="outline">
                {t('sales.clients.retry')}
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
                  <Button variant="outline" size="sm" className="px-2 md:px-3" onClick={() => {
                    // TODO: Implement edit functionality
                    toast.info(t('sales.clients.editFeatureComingSoon'));
                  }}>
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
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">{t('sales.clients.noClients')}</h3>
            <p className="text-sm md:text-base text-gray-500">{t('sales.clients.noClientsDescription')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SalesClients;