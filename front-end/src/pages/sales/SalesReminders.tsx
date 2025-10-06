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
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Bell, Calendar, Clock, AlertCircle, CheckCircle, Phone, Mail, MessageSquare, Eye, Edit, Trash2 } from "lucide-react";
import { salesApiService, SalesReminder } from "@/services/salesApi";
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

type Reminder = SalesReminder;

// Removed mock data - will use API data

const SalesReminders = () => {
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Fetch reminders from API
  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salesApiService.getReminders();
      setReminders(data);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError(t('salesReminders.errors.loadFailed'));
      toast.error(t('salesReminders.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Add new reminder
  const handleAddReminder = async (reminderData: Omit<Reminder, 'id' | 'createdDate'>) => {
    try {
      const newReminder = await salesApiService.createReminder(reminderData);
      setReminders(prev => [...prev, newReminder]);
      setIsAddDialogOpen(false);
      toast.success(t('salesReminders.messages.addSuccess'));
    } catch (err) {
      console.error('Error adding reminder:', err);
      toast.error(t('salesReminders.errors.addFailed'));
    }
  };

  // Update reminder
  const handleUpdateReminder = async (id: string, reminderData: Partial<Reminder>) => {
    try {
      const updatedReminder = await salesApiService.updateReminder(id, reminderData);
      setReminders(prev => prev.map(r => r.id === id ? updatedReminder : r));
      setIsEditDialogOpen(false);
      setSelectedReminder(null);
      toast.success(t('salesReminders.messages.updateSuccess'));
    } catch (err) {
      console.error('Error updating reminder:', err);
      toast.error(t('salesReminders.errors.updateFailed'));
    }
  };

  // Delete reminder
  const handleDeleteReminder = async (id: string) => {
    try {
      await salesApiService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success(t('salesReminders.messages.deleteSuccess'));
    } catch (err) {
      console.error('Error deleting reminder:', err);
      toast.error(t('salesReminders.errors.deleteFailed'));
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reminder.description && reminder.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (reminder.client && reminder.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && !reminder.completed) ||
                         (statusFilter === 'completed' && reminder.completed) ||
                         (statusFilter === 'overdue' && !reminder.completed && new Date(reminder.remindAt) < new Date());
    const matchesType = typeFilter === 'all' || reminder.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || reminder.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || reminder.assignedTo === assigneeFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesAssignee;
  });

  const getStatusColor = (reminder: Reminder) => {
    if (reminder.completed) return 'bg-green-100 text-green-800';
    if (new Date(reminder.remindAt) < new Date()) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (reminder: Reminder) => {
    if (reminder.completed) return t('salesReminders.status.completed');
    if (new Date(reminder.remindAt) < new Date()) return t('salesReminders.status.overdue');
    return t('salesReminders.status.pending');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT': return t('salesReminders.priority.urgent');
      case 'HIGH': return t('salesReminders.priority.high');
      case 'MEDIUM': return t('salesReminders.priority.medium');
      case 'LOW': return t('salesReminders.priority.low');
      default: return priority;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="h-4 w-4" />;
      case 'EMAIL': return <Mail className="h-4 w-4" />;
      case 'MEETING': return <Calendar className="h-4 w-4" />;
      case 'FOLLOW_UP': return <MessageSquare className="h-4 w-4" />;
      case 'CONTRACT_DEADLINE':
      case 'PAYMENT_DUE':
      case 'PROPOSAL_DEADLINE': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CALL': return t('salesReminders.type.call');
      case 'EMAIL': return t('salesReminders.type.email');
      case 'MEETING': return t('salesReminders.type.meeting');
      case 'FOLLOW_UP': return t('salesReminders.type.followUp');
      case 'CONTRACT_DEADLINE': return t('salesReminders.type.contractDeadline');
      case 'PAYMENT_DUE': return t('salesReminders.type.paymentDue');
      case 'PROPOSAL_DEADLINE': return t('salesReminders.type.proposalDeadline');
      case 'OTHER': return t('salesReminders.type.other');
      default: return type;
    }
  };

  const getStatusIcon = (reminder: Reminder) => {
    if (reminder.completed) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (new Date(reminder.remindAt) < new Date()) return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const totalReminders = filteredReminders.length;
  const pendingReminders = filteredReminders.filter(r => !r.completed).length;
  const overdueReminders = filteredReminders.filter(r => !r.completed && new Date(r.remindAt) < new Date()).length;
  const completedReminders = filteredReminders.filter(r => r.completed).length;

  const markAsCompleted = (id: string) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { ...reminder, completed: true, updatedAt: new Date().toISOString() }
        : reminder
    ));
  };

  if (loading) {
    return (
      <MainLayout userRole="sales" userName="عمر حسن">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('salesReminders.loading')}</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userRole="sales" userName="عمر حسن">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchReminders} variant="outline">
                {t('common.retry')}
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('salesReminders.title')}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{t('salesReminders.subtitle')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-xs sm:text-sm"
              >
                {t('salesReminders.viewMode.list')}
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="text-xs sm:text-sm"
              >
                {t('salesReminders.viewMode.calendar')}
              </Button>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t('salesReminders.addReminder')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('salesReminders.dialog.addTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('salesReminders.dialog.addDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm">{t('salesReminders.form.title')}</Label>
                    <Input id="title" placeholder={t('salesReminders.form.titlePlaceholder')} className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm">{t('salesReminders.form.type')}</Label>
                    <Select>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder={t('salesReminders.form.typePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">{t('salesReminders.type.call')}</SelectItem>
                        <SelectItem value="email">{t('salesReminders.type.email')}</SelectItem>
                        <SelectItem value="meeting">{t('salesReminders.type.meeting')}</SelectItem>
                        <SelectItem value="follow-up">{t('salesReminders.type.followUp')}</SelectItem>
                        <SelectItem value="deadline">{t('salesReminders.type.deadline')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">{t('salesReminders.form.priority')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('salesReminders.form.priorityPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('salesReminders.priority.low')}</SelectItem>
                        <SelectItem value="medium">{t('salesReminders.priority.medium')}</SelectItem>
                        <SelectItem value="high">{t('salesReminders.priority.high')}</SelectItem>
                        <SelectItem value="urgent">{t('salesReminders.priority.urgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">{t('salesReminders.form.assignee')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('salesReminders.form.assigneePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="سارة أحمد">سارة أحمد</SelectItem>
                        <SelectItem value="محمد علي">محمد علي</SelectItem>
                        <SelectItem value="نورا حسن">نورا حسن</SelectItem>
                        <SelectItem value="أمل محمد">أمل محمد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">{t('salesReminders.form.dueDate')}</Label>
                    <Input id="due-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-time">{t('salesReminders.form.dueTime')}</Label>
                    <Input id="due-time" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">{t('salesReminders.form.client')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('salesReminders.form.clientPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="شركة التقنية المتقدمة">شركة التقنية المتقدمة</SelectItem>
                        <SelectItem value="مجموعة الخليج للاستثمار">مجموعة الخليج للاستثمار</SelectItem>
                        <SelectItem value="شركة البناء الحديث">شركة البناء الحديث</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">{t('salesReminders.form.contact')}</Label>
                    <Input id="contact" placeholder={t('salesReminders.form.contactPlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="related-to">{t('salesReminders.form.relatedTo')}</Label>
                    <Input id="related-to" placeholder={t('salesReminders.form.relatedToPlaceholder')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-before">{t('salesReminders.form.reminderBefore')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('salesReminders.form.timingPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t('salesReminders.timing.onTime')}</SelectItem>
                        <SelectItem value="15">{t('salesReminders.timing.15min')}</SelectItem>
                        <SelectItem value="30">{t('salesReminders.timing.30min')}</SelectItem>
                        <SelectItem value="60">{t('salesReminders.timing.1hour')}</SelectItem>
                        <SelectItem value="120">{t('salesReminders.timing.2hours')}</SelectItem>
                        <SelectItem value="1440">{t('salesReminders.timing.1day')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">{t('salesReminders.form.description')}</Label>
                    <Textarea id="description" placeholder={t('salesReminders.form.descriptionPlaceholder')} rows={3} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">{t('salesReminders.form.notes')}</Label>
                    <Textarea id="notes" placeholder={t('salesReminders.form.notesPlaceholder')} rows={2} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    {t('salesReminders.form.addButton')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t('salesReminders.stats.total')}</p>
                  <p className="text-lg sm:text-2xl font-bold">{totalReminders}</p>
                </div>
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t('salesReminders.stats.pending')}</p>
                  <p className="text-lg sm:text-2xl font-bold">{pendingReminders}</p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t('salesReminders.stats.overdue')}</p>
                  <p className="text-lg sm:text-2xl font-bold">{overdueReminders}</p>
                </div>
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t('salesReminders.stats.completed')}</p>
                  <p className="text-lg sm:text-2xl font-bold">{completedReminders}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <div className="flex-1 min-w-[200px] sm:min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                placeholder={t('salesReminders.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 text-sm"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] text-sm">
              <SelectValue placeholder={t('salesReminders.filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('salesReminders.filters.allStatuses')}</SelectItem>
              <SelectItem value="pending">{t('salesReminders.status.pending')}</SelectItem>
              <SelectItem value="completed">{t('salesReminders.status.completed')}</SelectItem>
              <SelectItem value="overdue">{t('salesReminders.status.overdue')}</SelectItem>
              <SelectItem value="cancelled">{t('common.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px] text-sm">
              <SelectValue placeholder={t('salesReminders.filters.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('salesReminders.filters.allTypes')}</SelectItem>
              <SelectItem value="call">{t('salesReminders.type.call')}</SelectItem>
              <SelectItem value="email">{t('salesReminders.type.email')}</SelectItem>
              <SelectItem value="meeting">{t('salesReminders.type.meeting')}</SelectItem>
              <SelectItem value="follow-up">{t('salesReminders.type.followUp')}</SelectItem>
              <SelectItem value="deadline">{t('salesReminders.type.deadline')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[150px] text-sm">
              <SelectValue placeholder={t('salesReminders.filters.priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('salesReminders.filters.allPriorities')}</SelectItem>
              <SelectItem value="urgent">{t('salesReminders.priority.urgent')}</SelectItem>
              <SelectItem value="high">{t('salesReminders.priority.high')}</SelectItem>
              <SelectItem value="medium">{t('salesReminders.priority.medium')}</SelectItem>
              <SelectItem value="low">{t('salesReminders.priority.low')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reminders List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredReminders.map((reminder) => (
            <Card key={reminder.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                  <div className="flex items-start gap-3 sm:gap-4 w-full">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Checkbox
                        checked={reminder.completed}
                        onCheckedChange={() => markAsCompleted(reminder.id)}
                        disabled={reminder.completed}
                        className="h-4 w-4"
                      />
                      {getStatusIcon(reminder)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 p-1 rounded flex-shrink-0">
                            {getTypeIcon(reminder.type)}
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg truncate">{reminder.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Badge className={`${getPriorityColor(reminder.priority)} text-xs`}>
                            {getPriorityText(reminder.priority)}
                          </Badge>
                          <Badge className={`${getStatusColor(reminder)} text-xs`}>
                            {getStatusText(reminder)}
                          </Badge>
                        </div>
                      </div>
                      {reminder.description && <p className="text-gray-600 mb-2 text-sm line-clamp-2">{reminder.description}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <div className="space-y-1">
                          <p><strong>{t('salesReminders.type')}:</strong> {getTypeText(reminder.type)}</p>
                          <p><strong>{t('salesReminders.date')}:</strong> {new Date(reminder.remindAt).toLocaleDateString('ar-SA')} في {new Date(reminder.remindAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                          {reminder.client && <p><strong>{t('salesReminders.client')}:</strong> {reminder.client.name}</p>}
                        </div>
                        <div className="space-y-1">
                          {reminder.assignedUser && <p><strong>{t('salesReminders.assignedUser')}:</strong> {reminder.assignedUser.name}</p>}
                          {reminder.contract && <p><strong>{t('salesReminders.contract')}:</strong> {reminder.contract.title}</p>}
                          <p><strong>{t('salesReminders.createdAt')}:</strong> {new Date(reminder.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 w-full sm:w-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedReminder(reminder)} className="text-xs p-1 sm:p-2">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t('salesReminders.reminderDetails')}</DialogTitle>
                          <DialogDescription>
                            {t('salesReminders.reminderDetailsDesc')}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedReminder && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>{t('salesReminders.title')}</Label>
                                <p className="text-sm text-gray-600">{selectedReminder.title}</p>
                              </div>
                              <div>
                                <Label>{t('salesReminders.type')}</Label>
                                <p className="text-sm text-gray-600">{getTypeText(selectedReminder.type)}</p>
                              </div>
                              <div>
                                <Label>{t('salesReminders.priority')}</Label>
                                <Badge className={getPriorityColor(selectedReminder.priority)}>
                                  {getPriorityText(selectedReminder.priority)}
                                </Badge>
                              </div>
                              <div>
                                <Label>{t('salesReminders.status')}</Label>
                                <Badge className={getStatusColor(selectedReminder)}>
                                  {getStatusText(selectedReminder)}
                                </Badge>
                              </div>
                              <div>
                                <Label>{t('salesReminders.date')}</Label>
                                <p className="text-sm text-gray-600">{new Date(selectedReminder.remindAt).toLocaleDateString('ar-SA')} في {new Date(selectedReminder.remindAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              {selectedReminder.assignedUser && (
                                <div>
                                  <Label>{t('salesReminders.assignedUser')}</Label>
                                  <p className="text-sm text-gray-600">{selectedReminder.assignedUser.name}</p>
                                </div>
                              )}
                              {selectedReminder.client && (
                                <div>
                                  <Label>{t('salesReminders.client')}</Label>
                                  <p className="text-sm text-gray-600">{selectedReminder.client.name}</p>
                                </div>
                              )}
                              {selectedReminder.contract && (
                                <div>
                                  <Label>{t('salesReminders.contract')}</Label>
                                  <p className="text-sm text-gray-600">{selectedReminder.contract.title}</p>
                                </div>
                              )}
                              <div>
                                <Label>{t('salesReminders.createdAt')}</Label>
                                <p className="text-sm text-gray-600">{new Date(selectedReminder.createdAt).toLocaleDateString('ar-SA')}</p>
                              </div>
                            </div>
                            {selectedReminder.description && (
                              <div>
                                <Label>{t('salesReminders.description')}</Label>
                                <p className="text-sm text-gray-600">{selectedReminder.description}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedReminder(reminder);
                        setIsEditDialogOpen(true);
                      }}
                      className="text-xs p-1 sm:p-2"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (confirm(t('salesReminders.confirmDelete'))) {
                          handleDeleteReminder(reminder.id);
                        }
                      }}
                      className="text-xs p-1 sm:p-2"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('salesReminders.noReminders')}</h3>
            <p className="text-gray-500 mb-4">{t('salesReminders.noRemindersDesc')}</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('salesReminders.addFirstReminder')}
            </Button>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('salesReminders.noResults')}</h3>
            <p className="text-gray-500">{t('salesReminders.noResultsDesc')}</p>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default SalesReminders;