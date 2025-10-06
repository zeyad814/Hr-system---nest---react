import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Archive, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  Download, 
  Eye, 
  RotateCcw, 
  Trash2, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

interface ArchivedItem {
  id: string;
  type: 'contract' | 'client' | 'job' | 'application' | 'document';
  title: string;
  description: string;
  clientName?: string;
  clientId?: string;
  value?: number;
  currency?: string;
  status: 'completed' | 'cancelled' | 'expired' | 'rejected';
  archivedDate: string;
  originalDate: string;
  archivedBy: string;
  reason: string;
  tags: string[];
  attachments?: string[];
  metadata?: Record<string, any>;
}

const SalesArchive = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [selectedItem, setSelectedItem] = useState<ArchivedItem | null>(null);

  // Mock data for archived items
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([
    {
      id: "1",
      type: "contract",
      title: "عقد توظيف مطور برمجيات",
      description: "عقد توظيف لمنصب مطور برمجيات أول في شركة التقنية المتقدمة",
      clientName: "شركة التقنية المتقدمة",
      clientId: "C001",
      value: 120000,
      currency: "SAR",
      status: "completed",
      archivedDate: "2024-01-20T00:00:00Z",
      originalDate: "2023-12-15T00:00:00Z",
      archivedBy: "سارة أحمد",
      reason: "تم إكمال العقد بنجاح",
      tags: ["مطور", "تقنية", "دوام كامل"],
      attachments: ["contract_001.pdf", "job_description.pdf"],
      metadata: {
        duration: "12 شهر",
        position: "مطور برمجيات أول",
        department: "تقنية المعلومات"
      }
    },
    {
      id: "2",
      type: "client",
      title: "ملف عميل - مؤسسة الإبداع التجاري",
      description: "ملف عميل تم إغلاقه بسبب عدم التجديد",
      clientName: "مؤسسة الإبداع التجاري",
      clientId: "C002",
      status: "expired",
      archivedDate: "2024-01-18T00:00:00Z",
      originalDate: "2023-06-10T00:00:00Z",
      archivedBy: "محمد خالد",
      reason: "انتهاء فترة التعاقد وعدم التجديد",
      tags: ["تجارة", "متوسط", "منتهي"],
      metadata: {
        totalContracts: 3,
        totalValue: 85000,
        lastActivity: "2023-12-30"
      }
    },
    {
      id: "3",
      type: "job",
      title: "وظيفة مصمم UI/UX",
      description: "إعلان وظيفة مصمم واجهات المستخدم تم إلغاؤه",
      clientName: "استوديو الإبداع الرقمي",
      clientId: "C003",
      status: "cancelled",
      archivedDate: "2024-01-15T00:00:00Z",
      originalDate: "2023-11-20T00:00:00Z",
      archivedBy: "نورا حسن",
      reason: "تم إلغاء المشروع من قبل العميل",
      tags: ["تصميم", "UI/UX", "ملغي"],
      metadata: {
        applicants: 25,
        interviews: 8,
        salary: "6000-9000 SAR"
      }
    },
    {
      id: "4",
      type: "application",
      title: "طلب توظيف - أحمد محمد",
      description: "طلب توظيف لمنصب محلل بيانات تم رفضه",
      clientName: "أحمد محمد",
      status: "rejected",
      archivedDate: "2024-01-12T00:00:00Z",
      originalDate: "2023-12-05T00:00:00Z",
      archivedBy: "أمل محمد",
      reason: "عدم توافق المؤهلات مع متطلبات الوظيفة",
      tags: ["محلل بيانات", "مرفوض", "خبرة قليلة"],
      metadata: {
        position: "محلل بيانات",
        experience: "سنة واحدة",
        education: "بكالوريوس إحصاء"
      }
    },
    {
      id: "5",
      type: "document",
      title: "عرض أسعار - شركة البناء الحديث",
      description: "عرض أسعار لخدمات التوظيف انتهت صلاحيته",
      clientName: "شركة البناء الحديث",
      clientId: "C004",
      value: 45000,
      currency: "SAR",
      status: "expired",
      archivedDate: "2024-01-10T00:00:00Z",
      originalDate: "2023-11-15T00:00:00Z",
      archivedBy: "علي حسن",
      reason: "انتهاء صلاحية العرض دون رد من العميل",
      tags: ["عرض أسعار", "بناء", "منتهي"],
      attachments: ["quote_004.pdf", "service_details.pdf"],
      metadata: {
        validUntil: "2024-01-10",
        services: ["توظيف مهندسين", "توظيف عمال"],
        positions: 15
      }
    },
    {
      id: "6",
      type: "contract",
      title: "عقد خدمات استشارية",
      description: "عقد تقديم خدمات استشارية في الموارد البشرية",
      clientName: "مجموعة الأعمال المتكاملة",
      clientId: "C005",
      value: 75000,
      currency: "SAR",
      status: "completed",
      archivedDate: "2024-01-08T00:00:00Z",
      originalDate: "2023-09-01T00:00:00Z",
      archivedBy: "فاطمة علي",
      reason: "انتهاء فترة العقد بنجاح",
      tags: ["استشارات", "موارد بشرية", "مكتمل"],
      attachments: ["consulting_contract.pdf", "final_report.pdf"],
      metadata: {
        duration: "4 أشهر",
        consultants: 2,
        deliverables: ["تقييم الأداء", "تطوير السياسات"]
      }
    }
  ]);

  const filteredItems = archivedItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.clientName && item.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !selectedType || item.type === selectedType;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    
    // Date range filter
    let matchesDate = true;
    if (selectedDateRange) {
      const itemDate = new Date(item.archivedDate);
      const now = new Date();
      switch (selectedDateRange) {
        case 'week':
          matchesDate = (now.getTime() - itemDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          matchesDate = (now.getTime() - itemDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          break;
        case 'quarter':
          matchesDate = (now.getTime() - itemDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
          break;
        case 'year':
          matchesDate = (now.getTime() - itemDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="h-4 w-4" />;
      case 'client': return <Building className="h-4 w-4" />;
      case 'job': return <Users className="h-4 w-4" />;
      case 'application': return <User className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Archive className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contract': return 'عقد';
      case 'client': return 'عميل';
      case 'job': return 'وظيفة';
      case 'application': return 'طلب توظيف';
      case 'document': return 'مستند';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      case 'expired': return 'منتهي الصلاحية';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const restoreItem = (id: string) => {
    // In a real app, this would restore the item from archive
    console.log('Restoring item:', id);
    // For demo, we'll just remove it from the archive
    setArchivedItems(archivedItems.filter(item => item.id !== id));
  };

  const permanentlyDelete = (id: string) => {
    setArchivedItems(archivedItems.filter(item => item.id !== id));
  };

  const downloadItem = (item: ArchivedItem) => {
    // In a real app, this would download the item's files
    console.log('Downloading item:', item.title);
  };

  const stats = {
    total: archivedItems.length,
    contracts: archivedItems.filter(item => item.type === 'contract').length,
    clients: archivedItems.filter(item => item.type === 'client').length,
    jobs: archivedItems.filter(item => item.type === 'job').length,
    applications: archivedItems.filter(item => item.type === 'application').length,
    documents: archivedItems.filter(item => item.type === 'document').length
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">الأرشيف</h1>
            <p className="text-gray-600 mt-1">إدارة العناصر المؤرشفة والمحذوفة</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي العناصر</p>
                  <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Archive className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">العقود</p>
                  <p className="text-xl font-bold text-green-600">{stats.contracts}</p>
                </div>
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">العملاء</p>
                  <p className="text-xl font-bold text-purple-600">{stats.clients}</p>
                </div>
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الوظائف</p>
                  <p className="text-xl font-bold text-orange-600">{stats.jobs}</p>
                </div>
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الطلبات</p>
                  <p className="text-xl font-bold text-red-600">{stats.applications}</p>
                </div>
                <User className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المستندات</p>
                  <p className="text-xl font-bold text-indigo-600">{stats.documents}</p>
                </div>
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="البحث في الأرشيف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الأنواع</SelectItem>
                  <SelectItem value="contract">عقد</SelectItem>
                  <SelectItem value="client">عميل</SelectItem>
                  <SelectItem value="job">وظيفة</SelectItem>
                  <SelectItem value="application">طلب توظيف</SelectItem>
                  <SelectItem value="document">مستند</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الحالات</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع التواريخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع التواريخ</SelectItem>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                  <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
                  <SelectItem value="year">آخر سنة</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("");
                  setSelectedStatus("");
                  setSelectedDateRange("");
                }}
              >
                <Filter className="h-4 w-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Archive List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      {item.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {item.clientName && (
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {item.clientName}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {getTypeLabel(item.type)}
                    </Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      {getStatusLabel(item.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm">{item.description}</p>
                
                {item.value && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {item.value.toLocaleString()} {item.currency}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>أُرشف في: {new Date(item.archivedDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>بواسطة: {item.archivedBy}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">سبب الأرشفة:</span> {item.reason}
                  </p>
                </div>
                
                {item.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {item.attachments && item.attachments.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">المرفقات:</span> {item.attachments.length} ملف
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                        <Eye className="h-4 w-4 ml-1" />
                        عرض
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      {selectedItem && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getTypeIcon(selectedItem.type)}
                              {selectedItem.title}
                            </DialogTitle>
                            <DialogDescription>
                              {selectedItem.clientName} - {getTypeLabel(selectedItem.type)}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                {getTypeLabel(selectedItem.type)}
                              </Badge>
                              <Badge className={getStatusColor(selectedItem.status)}>
                                {getStatusIcon(selectedItem.status)}
                                {getStatusLabel(selectedItem.status)}
                              </Badge>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">الوصف</h4>
                              <p className="text-gray-700">{selectedItem.description}</p>
                            </div>
                            
                            {selectedItem.value && (
                              <div>
                                <h4 className="font-semibold mb-2">القيمة</h4>
                                <p className="text-lg font-bold text-green-600">
                                  {selectedItem.value.toLocaleString()} {selectedItem.currency}
                                </p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-1">تاريخ الأرشفة</h4>
                                <p className="text-gray-700">
                                  {new Date(selectedItem.archivedDate).toLocaleDateString('ar-SA')}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">التاريخ الأصلي</h4>
                                <p className="text-gray-700">
                                  {new Date(selectedItem.originalDate).toLocaleDateString('ar-SA')}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">سبب الأرشفة</h4>
                              <p className="text-gray-700">{selectedItem.reason}</p>
                            </div>
                            
                            {selectedItem.tags.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">العلامات</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {selectedItem.tags.map(tag => (
                                    <Badge key={tag} variant="secondary">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">المرفقات</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {selectedItem.attachments.map((attachment, index) => (
                                    <li key={index}>{attachment}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {selectedItem.metadata && (
                              <div>
                                <h4 className="font-semibold mb-2">معلومات إضافية</h4>
                                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                                  {Object.entries(selectedItem.metadata).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                      <span className="font-medium">{key}:</span> {Array.isArray(value) ? value.join(', ') : value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-500">
                              <p>أُرشف بواسطة: {selectedItem.archivedBy}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm" onClick={() => downloadItem(item)}>
                    <Download className="h-4 w-4 ml-1" />
                    تحميل
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => restoreItem(item.id)}>
                    <RotateCcw className="h-4 w-4 ml-1" />
                    استعادة
                  </Button>
                  
                  <Button variant="destructive" size="sm" onClick={() => permanentlyDelete(item.id)}>
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف نهائي
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد عناصر مؤرشفة</h3>
              <p className="text-gray-600">لم يتم العثور على عناصر تطابق معايير البحث</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SalesArchive;