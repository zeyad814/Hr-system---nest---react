import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Archive, Download, Eye, FileText, Users, Building, Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ArchivedItem {
  id: string;
  type: 'contract' | 'job' | 'client' | 'candidate';
  title: string;
  description: string;
  client?: string;
  value?: number;
  currency?: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'cancelled' | 'expired';
  reason: string;
  archivedDate: string;
  archivedBy: string;
  documents: string[];
  notes?: string;
  relatedItems?: string[];
}

const mockArchivedItems: ArchivedItem[] = [
  {
    id: '1',
    type: 'contract',
    title: 'عقد خدمات التوظيف - شركة التقنية المتقدمة',
    description: 'عقد توظيف 10 مطورين برمجيات خلال 6 أشهر',
    client: 'شركة التقنية المتقدمة',
    value: 150000,
    currency: 'SAR',
    startDate: '2023-06-01',
    endDate: '2023-12-01',
    status: 'completed',
    reason: 'تم إكمال العقد بنجاح وتوظيف جميع المطلوبين',
    archivedDate: '2023-12-05',
    archivedBy: 'سارة أحمد',
    documents: ['عقد موقع', 'تقرير إنجاز', 'فواتير'],
    notes: 'عقد ناجح، العميل راضي عن الخدمة',
    relatedItems: ['JOB-001', 'JOB-002', 'JOB-003']
  },
  {
    id: '2',
    type: 'job',
    title: 'مطور React Senior',
    description: 'وظيفة مطور React بخبرة 5+ سنوات',
    client: 'شركة الإبداع التجاري',
    startDate: '2023-08-15',
    endDate: '2023-10-15',
    status: 'completed',
    reason: 'تم العثور على المرشح المناسب وتوظيفه',
    archivedDate: '2023-10-20',
    archivedBy: 'محمد علي',
    documents: ['وصف وظيفي', 'سير ذاتية', 'تقارير مقابلات'],
    notes: 'تم توظيف أحمد محمد كمطور React Senior'
  },
  {
    id: '3',
    type: 'contract',
    title: 'عقد استشارات HR - مجموعة الخليج',
    description: 'عقد استشارات الموارد البشرية لمدة سنة',
    client: 'مجموعة الخليج للاستثمار',
    value: 200000,
    currency: 'SAR',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'cancelled',
    reason: 'تم إلغاء العقد بناءً على طلب العميل لتغيير الاستراتيجية',
    archivedDate: '2023-08-15',
    archivedBy: 'نورا حسن',
    documents: ['عقد أصلي', 'إشعار إلغاء', 'تسوية مالية'],
    notes: 'تم التسوية المالية بشكل ودي'
  },
  {
    id: '4',
    type: 'client',
    title: 'شركة البناء القديم',
    description: 'عميل سابق في قطاع البناء والتشييد',
    client: 'شركة البناء القديم',
    startDate: '2022-03-01',
    endDate: '2023-03-01',
    status: 'expired',
    reason: 'انتهت فترة التعاون وعدم تجديد العقد',
    archivedDate: '2023-03-15',
    archivedBy: 'أمل محمد',
    documents: ['ملف العميل', 'تاريخ التعاملات', 'تقييم الأداء'],
    notes: 'عميل جيد لكن قرر عدم التجديد لأسباب مالية'
  },
  {
    id: '5',
    type: 'candidate',
    title: 'فاطمة الزهراني - مديرة مشاريع',
    description: 'مرشحة لمنصب مديرة مشاريع تقنية',
    startDate: '2023-09-01',
    endDate: '2023-11-01',
    status: 'completed',
    reason: 'تم توظيف المرشحة في شركة أخرى',
    archivedDate: '2023-11-05',
    archivedBy: 'سارة أحمد',
    documents: ['سيرة ذاتية', 'تقارير مقابلات', 'شهادات'],
    notes: 'مرشحة ممتازة، تم توظيفها في شركة التطوير الذكي'
  }
];

const SalesArchive = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ArchivedItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems = mockArchivedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.client && item.client.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesType && matchesStatus && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      case 'expired': return 'منتهي';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'expired': return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'job': return <Users className="h-5 w-5 text-green-600" />;
      case 'client': return <Building className="h-5 w-5 text-purple-600" />;
      case 'candidate': return <Users className="h-5 w-5 text-orange-600" />;
      default: return <Archive className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'contract': return 'عقد';
      case 'job': return 'وظيفة';
      case 'client': return 'عميل';
      case 'candidate': return 'مرشح';
      default: return type;
    }
  };

  const totalItems = filteredItems.length;
  const completedItems = filteredItems.filter(item => item.status === 'completed').length;
  const cancelledItems = filteredItems.filter(item => item.status === 'cancelled').length;
  const expiredItems = filteredItems.filter(item => item.status === 'expired').length;

  const contractsCount = mockArchivedItems.filter(item => item.type === 'contract').length;
  const jobsCount = mockArchivedItems.filter(item => item.type === 'job').length;
  const clientsCount = mockArchivedItems.filter(item => item.type === 'client').length;
  const candidatesCount = mockArchivedItems.filter(item => item.type === 'candidate').length;

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">الأرشيف</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">إدارة العقود والوظائف والعملاء المؤرشفة</p>
          </div>
          <div className="flex gap-2 self-start sm:self-center">
            <Button variant="outline" className="flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">تصدير الأرشيف</span>
              <span className="sm:hidden">تصدير</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">إجمالي العناصر</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{totalItems}</p>
                </div>
                <Archive className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">مكتملة</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{completedItems}</p>
                </div>
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">ملغية</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{cancelledItems}</p>
                </div>
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-red-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">منتهية</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{expiredItems}</p>
                </div>
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-gray-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <div className="flex-1 min-w-0 sm:min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الأرشيف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px] lg:w-[150px] text-sm sm:text-base">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="contract">عقود</SelectItem>
                  <SelectItem value="job">وظائف</SelectItem>
                  <SelectItem value="client">عملاء</SelectItem>
                  <SelectItem value="candidate">مرشحين</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] lg:w-[150px] text-sm sm:text-base">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[140px] lg:w-[150px] text-sm sm:text-base">
                  <SelectValue placeholder="التاريخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التواريخ</SelectItem>
                  <SelectItem value="last-month">الشهر الماضي</SelectItem>
                  <SelectItem value="last-quarter">الربع الماضي</SelectItem>
                  <SelectItem value="last-year">السنة الماضية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3">الكل ({totalItems})</TabsTrigger>
            <TabsTrigger value="contract" className="text-xs sm:text-sm px-2 sm:px-3">العقود ({contractsCount})</TabsTrigger>
            <TabsTrigger value="job" className="text-xs sm:text-sm px-2 sm:px-3">الوظائف ({jobsCount})</TabsTrigger>
            <TabsTrigger value="client" className="text-xs sm:text-sm px-2 sm:px-3">العملاء ({clientsCount})</TabsTrigger>
            <TabsTrigger value="candidate" className="text-xs sm:text-sm px-2 sm:px-3">المرشحين ({candidatesCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            {/* Archive Items List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{item.title}</h3>
                            <Badge variant="outline" className="text-xs">{getTypeText(item.type)}</Badge>
                            <Badge className={`${getStatusColor(item.status)} text-xs`}>
                              {getStatusText(item.status)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3 text-xs sm:text-sm line-clamp-2">{item.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <div className="space-y-1">
                              {item.client && <p><strong>العميل:</strong> {item.client}</p>}
                              <p><strong>تاريخ البداية:</strong> {item.startDate}</p>
                              <p><strong>تاريخ النهاية:</strong> {item.endDate}</p>
                              {item.value && (
                                <p><strong>القيمة:</strong> {item.value.toLocaleString()} {item.currency}</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p><strong>تاريخ الأرشفة:</strong> {item.archivedDate}</p>
                              <p><strong>أرشف بواسطة:</strong> {item.archivedBy}</p>
                              <p><strong>عدد المستندات:</strong> {item.documents.length}</p>
                            </div>
                          </div>
                          <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-600">
                              <strong>سبب الأرشفة:</strong> {item.reason}
                            </p>
                          </div>
                          {item.notes && (
                            <div className="mt-2 p-2 sm:p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs sm:text-sm text-blue-600">
                                <strong>ملاحظات:</strong> {item.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)} className="px-2 sm:px-3">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-4xl h-[90vh] sm:h-[80vh] overflow-y-auto p-3 sm:p-6">
                            <DialogHeader className="pb-3 sm:pb-4">
                              <DialogTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                                {selectedItem && getTypeIcon(selectedItem.type)}
                                <span className="truncate">{selectedItem?.title}</span>
                              </DialogTitle>
                              <DialogDescription className="text-xs sm:text-sm">
                                تفاصيل العنصر المؤرشف
                              </DialogDescription>
                            </DialogHeader>
                            {selectedItem && (
                              <div className="space-y-4 sm:space-y-6">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className="bg-gray-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                                    {getTypeIcon(selectedItem.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold truncate">{selectedItem.title}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">{getTypeText(selectedItem.type)}</Badge>
                                      <Badge className={`${getStatusColor(selectedItem.status)} text-xs`}>
                                        {getStatusText(selectedItem.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                  <div className="space-y-3 sm:space-y-4">
                                    <div>
                                      <Label className="text-xs sm:text-sm font-medium">الوصف</Label>
                                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedItem.description}</p>
                                    </div>
                                    {selectedItem.client && (
                                      <div>
                                        <Label className="text-xs sm:text-sm font-medium">العميل</Label>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedItem.client}</p>
                                      </div>
                                    )}
                                    <div>
                                      <Label className="text-xs sm:text-sm font-medium">تاريخ البداية</Label>
                                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedItem.startDate}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs sm:text-sm font-medium">تاريخ النهاية</Label>
                                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedItem.endDate}</p>
                                    </div>
                                    {selectedItem.value && (
                                      <div>
                                        <Label className="text-xs sm:text-sm font-medium">القيمة</Label>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                          {selectedItem.value.toLocaleString()} {selectedItem.currency}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-3 sm:space-y-4">
                                    <div>
                                      <Label className="text-xs sm:text-sm font-medium">الحالة</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getStatusIcon(selectedItem.status)}
                                        <span className="text-xs sm:text-sm text-gray-600">{getStatusText(selectedItem.status)}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs sm:text-sm font-medium">تاريخ الأرشفة</Label>
                                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedItem.archivedDate}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs sm:text-sm font-medium">أرشف بواسطة</Label>
                                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedItem.archivedBy}</p>
                                    </div>
                                    <div>
                                      <Label className="text-xs sm:text-sm font-medium">المستندات</Label>
                                      <div className="mt-1 space-y-1">
                                        {selectedItem.documents.map((doc, index) => (
                                          <div key={index} className="flex items-center gap-2">
                                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm text-gray-600 flex-1 truncate">{doc}</span>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 sm:h-8 sm:w-8">
                                              <Download className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-xs sm:text-sm font-medium">سبب الأرشفة</Label>
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                    {selectedItem.reason}
                                  </p>
                                </div>
                                
                                {selectedItem.notes && (
                                  <div>
                                    <Label className="text-xs sm:text-sm font-medium">ملاحظات</Label>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 p-2 sm:p-3 bg-blue-50 rounded-lg">
                                      {selectedItem.notes}
                                    </p>
                                  </div>
                                )}
                                
                                {selectedItem.relatedItems && selectedItem.relatedItems.length > 0 && (
                                  <div>
                                    <Label className="text-xs sm:text-sm font-medium">العناصر المرتبطة</Label>
                                    <div className="mt-1 flex flex-wrap gap-1 sm:gap-2">
                                      {selectedItem.relatedItems.map((relatedId, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">{relatedId}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="px-2 sm:px-3">
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Archive className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">لا توجد عناصر مؤرشفة</h3>
                <p className="text-gray-500 text-sm sm:text-base px-4">لم يتم العثور على عناصر مطابقة لمعايير البحث</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SalesArchive;