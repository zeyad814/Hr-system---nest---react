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
import { Search, Plus, DollarSign, TrendingUp, Calendar, Building2, Eye, Download, Filter, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { salesApiService, SalesRevenue, MonthlyRevenue, CreateSalesRevenueDto, SalesClient } from "@/services/salesApi";
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SalesRevenuePage = () => {
  const { t } = useLanguage();
  const [revenues, setRevenues] = useState<SalesRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [clients, setClients] = useState<SalesClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRevenue, setSelectedRevenue] = useState<SalesRevenue | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRevenue, setNewRevenue] = useState<CreateSalesRevenueDto>({
    source: '',
    clientId: '',
    amount: 0,
    currency: 'SAR',
    type: 'CONTRACT'
  });

  useEffect(() => {
    fetchRevenues();
    fetchMonthlyRevenue();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await salesApiService.getClients();
      setClients(response.clients);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchRevenues = async () => {
    try {
      const data = await salesApiService.getRevenues();
      setRevenues(data.revenues);
    } catch (err) {
      setError('فشل في تحميل الإيرادات');
      console.error('Error fetching revenues:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const data = await salesApiService.getMonthlyRevenue();
      setMonthlyRevenue(data);
    } catch (err) {
      console.error('Error fetching monthly revenue:', err);
    }
  };

  const filteredRevenues = revenues.filter(revenue => {
    const matchesSearch = revenue.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         revenue.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || revenue.status === statusFilter;
    const matchesType = typeFilter === 'all' || revenue.type === statusFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID': return 'مدفوع';
      case 'PENDING': return 'معلق';
      case 'OVERDUE': return 'متأخر';
      case 'CANCELLED': return 'ملغي';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type.toUpperCase()) {
      case 'COMMISSION': return 'عمولة';
      case 'CONTRACT': return 'عقد';
      case 'BONUS': return 'مكافأة';
      case 'RETAINER': return 'احتجاز';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'COMMISSION': return 'bg-blue-100 text-blue-800';
      case 'CONTRACT': return 'bg-green-100 text-green-800';
      case 'BONUS': return 'bg-purple-100 text-purple-800';
      case 'RETAINER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddRevenue = async () => {
    try {
      // Validation
      if (!newRevenue.source.trim()) {
        toast.error('يرجى إدخال مصدر الإيراد');
        return;
      }
      if (!newRevenue.clientId) {
        toast.error('يرجى اختيار العميل');
        return;
      }
      if (newRevenue.amount <= 0) {
        toast.error('يرجى إدخال مبلغ صحيح');
        return;
      }

      await salesApiService.createRevenue(newRevenue);
      
      // Reset form
      setNewRevenue({
        source: '',
        clientId: '',
        amount: 0,
        currency: 'SAR',
        type: 'CONTRACT'
      });
      
      // Close dialog
      setShowAddDialog(false);
      
      // Refresh revenues list
      fetchRevenues();
      
      toast.success('تم إضافة الإيراد بنجاح!');
    } catch (error) {
      console.error('Error adding revenue:', error);
      toast.error('حدث خطأ في إضافة الإيراد');
    }
  };

  // Calculate statistics
  const totalRevenue = filteredRevenues.reduce((sum, revenue) => sum + (revenue.amount || 0), 0);
  const totalCommission = filteredRevenues.reduce((sum, revenue) => sum + (revenue.commission || 0), 0);
  const receivedRevenue = filteredRevenues
    .filter(revenue => revenue.status === 'PAID')
    .reduce((sum, revenue) => sum + (revenue.amount || 0), 0);
  const pendingRevenue = filteredRevenues
    .filter(revenue => revenue.status === 'PENDING')
    .reduce((sum, revenue) => sum + (revenue.amount || 0), 0);

  // Prepare chart data
  const revenueByType = [
    { name: 'عمولة', value: filteredRevenues.filter(r => r.type === 'COMMISSION').reduce((sum, r) => sum + (r.amount || 0), 0) },
    { name: 'عقد', value: filteredRevenues.filter(r => r.type === 'CONTRACT').reduce((sum, r) => sum + (r.amount || 0), 0) },
    { name: 'مكافأة', value: filteredRevenues.filter(r => r.type === 'BONUS').reduce((sum, r) => sum + (r.amount || 0), 0) },
    { name: 'احتجاز', value: filteredRevenues.filter(r => r.type === 'RETAINER').reduce((sum, r) => sum + (r.amount || 0), 0) }
  ].filter(item => item.value > 0);

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{t('salesRevenue.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">{t('salesRevenue.subtitle')}</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('salesRevenue.addRevenue')}</span>
            <span className="sm:hidden">إضافة إيراد</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{t('salesRevenue.stats.totalRevenue')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{t('salesRevenue.stats.totalCommission')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{totalCommission.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{t('salesRevenue.stats.receivedRevenue')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{receivedRevenue.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{t('salesRevenue.stats.pendingRevenue')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{pendingRevenue.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-yellow-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-sm sm:text-base lg:text-lg">{t('salesRevenue.charts.monthlyRevenue')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('salesRevenue.charts.monthlyRevenueDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="h-48 sm:h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={10}
                      tickFormatter={(value) => {
                        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                                       'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                        return months[value - 1] || value;
                      }}
                    />
                    <YAxis fontSize={10} />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()} ر.س`, 'الإيرادات']} 
                      labelFormatter={(value) => {
                        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                                       'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                        return months[value - 1] || value;
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Type Chart */}
          <Card>
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-sm sm:text-base lg:text-lg">{t('salesRevenue.charts.revenueByType')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('salesRevenue.charts.revenueByTypeDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="h-48 sm:h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ر.س`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">{t('salesRevenue.filters.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t('salesRevenue.filters.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 lg:w-48">
                  <SelectValue placeholder={t('salesRevenue.filters.statusFilter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('salesRevenue.filters.allStatuses')}</SelectItem>
                  <SelectItem value="PAID">{t('salesRevenue.status.paid')}</SelectItem>
                  <SelectItem value="PENDING">{t('salesRevenue.status.pending')}</SelectItem>
                  <SelectItem value="OVERDUE">{t('salesRevenue.status.overdue')}</SelectItem>
                  <SelectItem value="CANCELLED">{t('salesRevenue.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40 lg:w-48">
                  <SelectValue placeholder={t('salesRevenue.filters.typeFilter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('salesRevenue.filters.allTypes')}</SelectItem>
                  <SelectItem value="COMMISSION">{t('salesRevenue.type.commission')}</SelectItem>
                  <SelectItem value="CONTRACT">{t('salesRevenue.type.contract')}</SelectItem>
                  <SelectItem value="BONUS">{t('salesRevenue.type.bonus')}</SelectItem>
                  <SelectItem value="RETAINER">{t('salesRevenue.type.retainer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Revenue List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('salesRevenue.list.title')}</CardTitle>
            <CardDescription>{t('salesRevenue.list.description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            {loading ? (
              <div className="flex justify-center items-center py-6 sm:py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm sm:text-base text-gray-600">{t('salesRevenue.list.loading')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-sm sm:text-base text-red-600 mb-2">{t('salesRevenue.list.error')}</p>
                <p className="text-xs sm:text-sm text-gray-600">{error}</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredRevenues.map((revenue) => (
                  <div key={revenue.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                          <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{revenue.source || 'غير محدد'}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{revenue.client?.name || 'غير محدد'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-sm sm:text-base">{revenue.amount ? revenue.amount.toLocaleString() : '0'} ر.س</p>
                          <p className="text-xs sm:text-sm text-gray-600">عمولة: {revenue.commission ? revenue.commission.toLocaleString() : '0'} ر.س</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getStatusColor(revenue.status)}>
                            {getStatusText(revenue.status)}
                          </Badge>
                          <Badge className={getTypeColor(revenue.type)} variant="outline">
                            {getTypeText(revenue.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedRevenue(revenue)} className="p-2">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xs sm:max-w-2xl mx-4">
                              <DialogHeader>
                                <DialogTitle className="text-sm sm:text-base">تفاصيل الإيراد</DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm">
                                  معلومات مفصلة عن الإيراد
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRevenue && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  <div>
                                    <Label className="text-xs sm:text-sm">المصدر</Label>
                                    <p className="text-xs sm:text-sm text-gray-600">{selectedRevenue.source || 'غير محدد'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs sm:text-sm">العميل</Label>
                                    <p className="text-xs sm:text-sm text-gray-600">{selectedRevenue.client?.name || 'غير محدد'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs sm:text-sm">المبلغ</Label>
                                    <p className="text-xs sm:text-sm text-gray-600">{selectedRevenue.amount ? selectedRevenue.amount.toLocaleString() : '0'} ر.س</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs sm:text-sm">العمولة</Label>
                                    <p className="text-xs sm:text-sm text-gray-600">{selectedRevenue.commission ? selectedRevenue.commission.toLocaleString() : '0'} ر.س</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs sm:text-sm">النوع</Label>
                                    <Badge className={getTypeColor(selectedRevenue.type)}>
                                      {getTypeText(selectedRevenue.type)}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label className="text-xs sm:text-sm">الحالة</Label>
                                    <Badge className={getStatusColor(selectedRevenue.status)}>
                                      {getStatusText(selectedRevenue.status)}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label className="text-xs sm:text-sm">تاريخ الاستحقاق</Label>
                                    <p className="text-xs sm:text-sm text-gray-600">{selectedRevenue.dueDate ? new Date(selectedRevenue.dueDate).toLocaleDateString('ar-SA') : 'غير محدد'}</p>
                                  </div>
                                  {selectedRevenue.paidDate && (
                                    <div>
                                      <Label className="text-xs sm:text-sm">تاريخ الدفع</Label>
                                      <p className="text-xs sm:text-sm text-gray-600">{new Date(selectedRevenue.paidDate).toLocaleDateString('ar-SA')}</p>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-xs sm:text-sm">العملة</Label>
                                    <p className="text-xs sm:text-sm text-gray-600">{selectedRevenue.currency || 'ر.س'}</p>
                                  </div>
                                  <div className="col-span-1 sm:col-span-2">
                                    <Label className="text-xs sm:text-sm">العقد</Label>
                                    <p className="text-xs sm:text-sm text-gray-600">{selectedRevenue.contract || 'لا يوجد عقد محدد'}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" className="p-2">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {filteredRevenues.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('salesRevenue.noResults.title')}</h3>
            <p className="text-gray-500">{t('salesRevenue.noResults.description')}</p>
          </div>
        )}

        {/* Add Revenue Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-xs sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">{t('salesRevenue.addDialog.title')}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {t('salesRevenue.addDialog.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="source" className="text-xs sm:text-sm">{t('salesRevenue.addDialog.fields.source')}</Label>
                <Input
                  id="source"
                  value={newRevenue.source}
                  onChange={(e) => setNewRevenue({ ...newRevenue, source: e.target.value })}
                  placeholder={t('salesRevenue.addDialog.placeholders.source')}
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="client" className="text-xs sm:text-sm">العميل *</Label>
                <Select
                  value={newRevenue.clientId}
                  onValueChange={(value) => setNewRevenue({ ...newRevenue, clientId: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="text-sm">
                        {client.name} {client.company && `- ${client.company}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount" className="text-xs sm:text-sm">المبلغ *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newRevenue.amount}
                  onChange={(e) => setNewRevenue({ ...newRevenue, amount: Number(e.target.value) })}
                  placeholder="0"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="commission" className="text-xs sm:text-sm">العمولة</Label>
                <Input
                  id="commission"
                  type="number"
                  value={newRevenue.commission || ''}
                  onChange={(e) => setNewRevenue({ ...newRevenue, commission: Number(e.target.value) })}
                  placeholder="0"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="type" className="text-xs sm:text-sm">نوع الإيراد</Label>
                <Select
                  value={newRevenue.type}
                  onValueChange={(value: 'CONTRACT' | 'COMMISSION' | 'BONUS' | 'RETAINER') => 
                    setNewRevenue({ ...newRevenue, type: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONTRACT" className="text-sm">عقد</SelectItem>
                    <SelectItem value="COMMISSION" className="text-sm">عمولة</SelectItem>
                    <SelectItem value="BONUS" className="text-sm">مكافأة</SelectItem>
                    <SelectItem value="RETAINER" className="text-sm">احتجاز</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="contract" className="text-xs sm:text-sm">العقد</Label>
                <Input
                  id="contract"
                  value={newRevenue.contract || ''}
                  onChange={(e) => setNewRevenue({ ...newRevenue, contract: e.target.value })}
                  placeholder="رقم أو اسم العقد"
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="dueDate" className="text-xs sm:text-sm">تاريخ الاستحقاق</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newRevenue.dueDate || ''}
                  onChange={(e) => setNewRevenue({ ...newRevenue, dueDate: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="text-sm">
                إلغاء
              </Button>
              <Button onClick={handleAddRevenue} className="text-sm">
                إضافة الإيراد
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default SalesRevenuePage;