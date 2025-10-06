import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'deadline';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  dueDate: string;
  dueTime: string;
  clientName: string;
  clientId: string;
  contactInfo: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  assignedTo: string;
}

const SalesReminders = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'call',
    priority: 'medium',
    status: 'pending'
  });

  // Mock data for reminders
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "متابعة عرض الأسعار",
      description: "متابعة عرض الأسعار المرسل لشركة التقنية المتقدمة",
      type: "follow-up",
      priority: "high",
      status: "pending",
      dueDate: "2024-01-25",
      dueTime: "10:00",
      clientName: "أحمد محمد",
      clientId: "C001",
      contactInfo: "+966501234567",
      notes: "العميل مهتم بالخدمة ويحتاج تفاصيل إضافية عن التسعير",
      createdAt: "2024-01-20T00:00:00Z",
      assignedTo: "سارة أحمد"
    },
    {
      id: "2",
      title: "اجتماع مع العميل",
      description: "اجتماع لمناقشة متطلبات المشروع الجديد",
      type: "meeting",
      priority: "urgent",
      status: "pending",
      dueDate: "2024-01-24",
      dueTime: "14:30",
      clientName: "فاطمة علي",
      clientId: "C002",
      contactInfo: "fatima@company.com",
      notes: "مناقشة تفاصيل المشروع والجدول الزمني",
      createdAt: "2024-01-18T00:00:00Z",
      assignedTo: "محمد خالد"
    },
    {
      id: "3",
      title: "إرسال عقد التوظيف",
      description: "إرسال عقد التوظيف للمرشح المقبول",
      type: "email",
      priority: "medium",
      status: "completed",
      dueDate: "2024-01-22",
      dueTime: "09:00",
      clientName: "خالد سعد",
      clientId: "C003",
      contactInfo: "khalid@email.com",
      notes: "تم إرسال العقد بنجاح",
      createdAt: "2024-01-19T00:00:00Z",
      completedAt: "2024-01-22T09:15:00Z",
      assignedTo: "نورا حسن"
    },
    {
      id: "4",
      title: "مكالمة تأكيد الموعد",
      description: "تأكيد موعد المقابلة مع المرشح",
      type: "call",
      priority: "medium",
      status: "overdue",
      dueDate: "2024-01-21",
      dueTime: "11:00",
      clientName: "عبدالله أحمد",
      clientId: "C004",
      contactInfo: "+966502345678",
      notes: "لم يتم الرد على المكالمة",
      createdAt: "2024-01-20T00:00:00Z",
      assignedTo: "أمل محمد"
    },
    {
      id: "5",
      title: "موعد نهائي للعرض",
      description: "آخر موعد لتقديم العرض التجاري",
      type: "deadline",
      priority: "urgent",
      status: "pending",
      dueDate: "2024-01-26",
      dueTime: "17:00",
      clientName: "مريم سالم",
      clientId: "C005",
      contactInfo: "mariam@company.sa",
      notes: "يجب تقديم العرض قبل نهاية اليوم",
      createdAt: "2024-01-15T00:00:00Z",
      assignedTo: "علي حسن"
    }
  ]);

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || reminder.type === selectedType;
    const matchesPriority = !selectedPriority || reminder.priority === selectedPriority;
    const matchesStatus = !selectedStatus || reminder.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'follow-up': return <MessageSquare className="h-4 w-4" />;
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return 'مكالمة';
      case 'email': return 'بريد إلكتروني';
      case 'meeting': return 'اجتماع';
      case 'follow-up': return 'متابعة';
      case 'deadline': return 'موعد نهائي';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'منخفضة';
      case 'medium': return 'متوسطة';
      case 'high': return 'عالية';
      case 'urgent': return 'عاجلة';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'completed': return 'مكتمل';
      case 'overdue': return 'متأخر';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleAddReminder = () => {
    if (newReminder.title && newReminder.dueDate && newReminder.clientName) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: newReminder.title!,
        description: newReminder.description || '',
        type: newReminder.type as any,
        priority: newReminder.priority as any,
        status: 'pending',
        dueDate: newReminder.dueDate!,
        dueTime: newReminder.dueTime || '09:00',
        clientName: newReminder.clientName!,
        clientId: newReminder.clientId || '',
        contactInfo: newReminder.contactInfo || '',
        notes: newReminder.notes,
        createdAt: new Date().toISOString(),
        assignedTo: newReminder.assignedTo || 'المستخدم الحالي'
      };
      
      setReminders([...reminders, reminder]);
      setNewReminder({ type: 'call', priority: 'medium', status: 'pending' });
      setIsAddDialogOpen(false);
    }
  };

  const markAsCompleted = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { ...reminder, status: 'completed' as const, completedAt: new Date().toISOString() }
        : reminder
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const stats = {
    total: reminders.length,
    pending: reminders.filter(r => r.status === 'pending').length,
    completed: reminders.filter(r => r.status === 'completed').length,
    overdue: reminders.filter(r => r.status === 'overdue').length
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">التذكيرات</h1>
            <p className="text-gray-600 mt-1">إدارة المهام والمتابعات</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة تذكير
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة تذكير جديد</DialogTitle>
                <DialogDescription>
                  أضف تذكير جديد للمتابعة مع العملاء
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">العنوان</Label>
                  <Input
                    id="title"
                    value={newReminder.title || ''}
                    onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                    placeholder="عنوان التذكير"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={newReminder.description || ''}
                    onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                    placeholder="وصف التذكير"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">النوع</Label>
                    <Select value={newReminder.type} onValueChange={(value) => setNewReminder({...newReminder, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">مكالمة</SelectItem>
                        <SelectItem value="email">بريد إلكتروني</SelectItem>
                        <SelectItem value="meeting">اجتماع</SelectItem>
                        <SelectItem value="follow-up">متابعة</SelectItem>
                        <SelectItem value="deadline">موعد نهائي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">الأولوية</Label>
                    <Select value={newReminder.priority} onValueChange={(value) => setNewReminder({...newReminder, priority: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="urgent">عاجلة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">التاريخ</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newReminder.dueDate || ''}
                      onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dueTime">الوقت</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={newReminder.dueTime || ''}
                      onChange={(e) => setNewReminder({...newReminder, dueTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="clientName">اسم العميل</Label>
                  <Input
                    id="clientName"
                    value={newReminder.clientName || ''}
                    onChange={(e) => setNewReminder({...newReminder, clientName: e.target.value})}
                    placeholder="اسم العميل"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactInfo">معلومات الاتصال</Label>
                  <Input
                    id="contactInfo"
                    value={newReminder.contactInfo || ''}
                    onChange={(e) => setNewReminder({...newReminder, contactInfo: e.target.value})}
                    placeholder="رقم الهاتف أو البريد الإلكتروني"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={newReminder.notes || ''}
                    onChange={(e) => setNewReminder({...newReminder, notes: e.target.value})}
                    placeholder="ملاحظات إضافية"
                  />
                </div>
                
                <Button onClick={handleAddReminder} className="w-full">
                  إضافة التذكير
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي التذكيرات</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">معلقة</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">متأخرة</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
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
                  placeholder={t('reminders.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('reminders.filters.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('reminders.filters.allTypes')}</SelectItem>
                  <SelectItem value="call">مكالمة</SelectItem>
                  <SelectItem value="email">بريد إلكتروني</SelectItem>
                  <SelectItem value="meeting">اجتماع</SelectItem>
                  <SelectItem value="follow-up">متابعة</SelectItem>
                  <SelectItem value="deadline">موعد نهائي</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('reminders.filters.allPriorities')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('reminders.filters.allPriorities')}</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('reminders.filters.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('reminders.filters.allStatuses')}</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="overdue">متأخر</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("");
                  setSelectedPriority("");
                  setSelectedStatus("");
                }}
              >
                <Filter className="h-4 w-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reminders List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReminders.map(reminder => (
            <Card key={reminder.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getTypeIcon(reminder.type)}
                      {reminder.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4" />
                      {reminder.clientName}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(reminder.priority)}>
                      {getPriorityLabel(reminder.priority)}
                    </Badge>
                    <Badge className={getStatusColor(reminder.status)}>
                      {getStatusIcon(reminder.status)}
                      {getStatusLabel(reminder.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm">{reminder.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(reminder.dueDate).toLocaleDateString('ar-SA')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {reminder.dueTime}
                  </div>
                </div>
                
                {reminder.contactInfo && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {reminder.contactInfo.includes('@') ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                    {reminder.contactInfo}
                  </div>
                )}
                
                {reminder.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{reminder.notes}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>مُكلف إلى: {reminder.assignedTo}</span>
                  <span>تم الإنشاء: {new Date(reminder.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReminder(reminder)}>
                        <Eye className="h-4 w-4 ml-1" />
                        عرض
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      {selectedReminder && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getTypeIcon(selectedReminder.type)}
                              {selectedReminder.title}
                            </DialogTitle>
                            <DialogDescription>
                              {selectedReminder.clientName} - {getTypeLabel(selectedReminder.type)}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(selectedReminder.priority)}>
                                {getPriorityLabel(selectedReminder.priority)}
                              </Badge>
                              <Badge className={getStatusColor(selectedReminder.status)}>
                                {getStatusIcon(selectedReminder.status)}
                                {getStatusLabel(selectedReminder.status)}
                              </Badge>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">الوصف</h4>
                              <p className="text-gray-700">{selectedReminder.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-1">التاريخ والوقت</h4>
                                <p className="text-gray-700">
                                  {new Date(selectedReminder.dueDate).toLocaleDateString('ar-SA')} - {selectedReminder.dueTime}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">معلومات الاتصال</h4>
                                <p className="text-gray-700">{selectedReminder.contactInfo}</p>
                              </div>
                            </div>
                            
                            {selectedReminder.notes && (
                              <div>
                                <h4 className="font-semibold mb-2">الملاحظات</h4>
                                <p className="text-gray-700">{selectedReminder.notes}</p>
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-500">
                              <p>مُكلف إلى: {selectedReminder.assignedTo}</p>
                              <p>تم الإنشاء: {new Date(selectedReminder.createdAt).toLocaleDateString('ar-SA')}</p>
                              {selectedReminder.completedAt && (
                                <p>تم الإكمال: {new Date(selectedReminder.completedAt).toLocaleDateString('ar-SA')}</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  {reminder.status === 'pending' && (
                    <Button size="sm" onClick={() => markAsCompleted(reminder.id)}>
                      <CheckCircle className="h-4 w-4 ml-1" />
                      إكمال
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  
                  <Button variant="destructive" size="sm" onClick={() => deleteReminder(reminder.id)}>
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredReminders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد تذكيرات</h3>
              <p className="text-gray-600">لم يتم العثور على تذكيرات تطابق معايير البحث</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SalesReminders;