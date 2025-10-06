import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  Users, 
  DollarSign, 
  Briefcase,
  Eye,
  Edit,
  Trash2,
  Loader2,
  FileCheck
} from 'lucide-react';
import { salesApiService, SalesTarget, CreateSalesTargetDto } from '@/services/salesApi';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const SalesTargets = () => {
  const { t } = useLanguage();
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTarget, setNewTarget] = useState({
    title: '',
    type: '',
    target: '',
    description: '',
    startDate: '',
    endDate: '',
    assignedTo: '',
    period: ''
  });

  // Dummy data for quarterly performance and achievements
  const quarterlyPerformance = [
    {
      quarter: 'الربع الأول 2024',
      target: 1000000,
      achieved: 850000,
      percentage: 85,
      status: 'جيد'
    },
    {
      quarter: 'الربع الثاني 2024',
      target: 1200000,
      achieved: 1100000,
      percentage: 92,
      status: 'ممتاز'
    },
    {
      quarter: 'الربع الثالث 2024',
      target: 1100000,
      achieved: 750000,
      percentage: 68,
      status: 'يحتاج تحسين'
    }
  ];

  const achievements = [
    {
      title: 'أفضل مبيعات شهرية',
      description: 'تحقيق أعلى مبيعات في شهر مارس',
      date: '2024-03-31',
      type: 'monthly'
    },
    {
      title: 'هدف العملاء الجدد',
      description: 'إضافة 50 عميل جديد',
      date: '2024-02-28',
      type: 'clients'
    }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const targetsData = await salesApiService.getTargets();
      setTargets(targetsData);
    } catch (error) {
      console.error('Error loading targets:', error);
      toast.error('فشل في تحميل الأهداف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REVENUE': return DollarSign;
      case 'CONTRACTS': return Briefcase;
      case 'CLIENTS': return Users;
      case 'JOBS': return Target;
      default: return Target;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-success text-success-foreground';
      case 'completed': return 'bg-info text-info-foreground';
      case 'paused': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'paused': return 'متوقف';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-secondary";
    if (percentage >= 80) return "bg-info";  
    if (percentage >= 60) return "bg-warning";
    return "bg-destructive";
  };

  const handleAddTarget = async () => {
    try {
      // Validation
      if (!newTarget.title || !newTarget.type || !newTarget.target) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      const targetData: CreateSalesTargetDto = {
        title: newTarget.title,
        type: newTarget.type as any,
        target: parseFloat(newTarget.target),
        description: newTarget.description,
        startDate: newTarget.startDate,
        endDate: newTarget.endDate,
        assignedTo: newTarget.assignedTo,
        period: newTarget.period
      };

      await salesApiService.createTarget(targetData);
      toast.success('تم إضافة الهدف بنجاح');
      
      // Reset form
      setNewTarget({
        title: '',
        type: '',
        target: '',
        description: '',
        startDate: '',
        endDate: '',
        assignedTo: '',
        period: ''
      });
      
      setShowAddModal(false);
      
      // Refresh targets list
      const updatedTargets = await salesApiService.getTargets();
      setTargets(updatedTargets);
      
    } catch (error) {
      console.error('Error adding target:', error);
      toast.error('حدث خطأ أثناء إضافة الهدف');
    }
  };

  const handleUpdateTarget = async (targetId: string, updatedData: Partial<SalesTarget>) => {
    try {
      await salesApiService.updateTarget(targetId, updatedData);
      
      // Reload data
      const targetsData = await salesApiService.getTargets();
      setTargets(targetsData);
      
      toast.success('تم تحديث الهدف بنجاح');
    } catch (error) {
      console.error('Error updating target:', error);
      toast.error('فشل في تحديث الهدف');
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    try {
      await salesApiService.deleteTarget(targetId);
      
      // Reload data
      const targetsData = await salesApiService.getTargets();
      setTargets(targetsData);
      
      toast.success('تم حذف الهدف بنجاح');
    } catch (error) {
      console.error('Error deleting target:', error);
      toast.error('فشل في حذف الهدف');
    }
  };

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('targets.title')}</h1>
          <Button onClick={() => setShowAddModal(true)}>{t('targets.addTarget')}</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="crm-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t('targets.stats.totalTargets')}</p>
                  <p className="text-xl sm:text-2xl font-bold">{targets.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t('targets.stats.activeTarget')}</p>
                </div>
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t('targets.stats.achievedTargets')}</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {targets.filter(t => t.status?.toLowerCase() === 'completed').length} {t('targets.stats.of')} {targets.length}
                  </p>
                  <p className="text-xs sm:text-sm text-info">
                    {targets.length > 0 ? Math.round((targets.filter(t => t.status?.toLowerCase() === 'completed').length / targets.length) * 100) : 0}% {t('targets.stats.successRate')}
                  </p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">{t('targets.stats.daysRemaining')}</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {targets.length > 0 ? Math.min(...targets.map(t => t.daysLeft || 0)) : 0} {t('targets.stats.days')}
                  </p>
                  <p className="text-xs sm:text-sm text-warning">{t('targets.stats.endOfMonth')}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('targets.currentTargets')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="mr-2">جاري تحميل الأهداف...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {targets.map((target) => {
                  const IconComponent = getTypeIcon(target.type);
                  const progressPercentage = target.target > 0 ? Math.round((target.achieved / target.target) * 100) : 0;
                  
                  return (
                    <div key={target.id} className="border rounded-lg p-4 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{target.title}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{target.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <Badge className={`${getStatusColor(target.status)} text-xs`}>
                            {getStatusText(target.status)}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                // TODO: Implement edit functionality
                                toast.info('سيتم تنفيذ وظيفة التعديل قريباً');
                              }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteTarget(target.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">الهدف</p>
                          <p className="font-semibold text-sm sm:text-base">{target.target?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">المحقق</p>
                          <p className="font-semibold text-sm sm:text-base">{target.achieved?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">المسؤول</p>
                          <p className="font-semibold text-sm sm:text-base truncate">{target.assignedTo}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium">التقدم</span>
                          <span className="text-xs sm:text-sm font-medium">{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quarterly Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('salesTargets.quarterlyPerformance.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="mr-2">{t('salesTargets.quarterlyPerformance.loading')}</span>
                </div>
              ) : (
                quarterlyPerformance.map((quarter, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{quarter.quarter}</h4>
                        <p className="text-sm text-muted-foreground">{quarter.achieved} من {quarter.target}</p>
                      </div>
                      <Badge variant={quarter.percentage >= 90 ? "default" : quarter.percentage >= 70 ? "secondary" : "destructive"}>
                        {quarter.status}
                      </Badge>
                    </div>
                    <Progress value={quarter.percentage} className="h-2" />
                    <div className="text-right">
                      <span className="text-sm font-medium">{quarter.percentage}%</span>
                    </div>
                    {index < quarterlyPerformance.length - 1 && <hr className="my-4" />}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Outstanding Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('salesTargets.achievements.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                  <span className="mr-2 text-sm sm:text-base">{t('salesTargets.achievements.loading')}</span>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {achievements.map((achievement, index) => {
                    const getAchievementIcon = (type: string) => {
                      switch (type) {
                        case 'monthly': return TrendingUp;
                        case 'clients': return Users;
                        case 'revenue': return DollarSign;
                        default: return Award;
                      }
                    };
                    
                    const IconComponent = getAchievementIcon(achievement.type);
                    
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                          <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">{achievement.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Target Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{t('targets.modal.addTarget')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm sm:text-base">{t('targets.modal.titleLabel')}</Label>
              <Input
                id="title"
                value={newTarget.title}
                onChange={(e) => setNewTarget({...newTarget, title: e.target.value})}
                placeholder={t('targets.modal.titlePlaceholder')}
                className="text-sm sm:text-base"
              />
            </div>
            
            <div>
              <Label htmlFor="type" className="text-sm sm:text-base">{t('targets.modal.typeLabel')}</Label>
              <Select value={newTarget.type} onValueChange={(value) => setNewTarget({...newTarget, type: value})}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder={t('targets.modal.typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="REVENUE">{t('targets.modal.types.revenue')}</SelectItem>
                   <SelectItem value="JOBS">{t('targets.modal.types.sales')}</SelectItem>
                   <SelectItem value="CLIENTS">{t('targets.modal.types.clients')}</SelectItem>
                   <SelectItem value="CONTRACTS">{t('targets.modal.types.contracts')}</SelectItem>
                 </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target">{t('targets.modal.valueLabel')}</Label>
              <Input
                id="target"
                type="number"
                value={newTarget.target}
                onChange={(e) => setNewTarget({...newTarget, target: e.target.value})}
                placeholder={t('targets.modal.valuePlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="period">{t('targets.modal.periodLabel')}</Label>
              <Select value={newTarget.period} onValueChange={(value) => setNewTarget({...newTarget, period: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('targets.modal.periodPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">{t('targets.modal.periods.monthly')}</SelectItem>
                  <SelectItem value="QUARTERLY">{t('targets.modal.periods.quarterly')}</SelectItem>
                  <SelectItem value="YEARLY">{t('targets.modal.periods.yearly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">{t('targets.modal.descriptionLabel')}</Label>
              <Textarea
                id="description"
                value={newTarget.description}
                onChange={(e) => setNewTarget({...newTarget, description: e.target.value})}
                placeholder={t('targets.modal.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm sm:text-base">{t('targets.modal.startDateLabel')}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newTarget.startDate}
                  onChange={(e) => setNewTarget({...newTarget, startDate: e.target.value})}
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm sm:text-base">{t('targets.modal.endDateLabel')}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newTarget.endDate}
                  onChange={(e) => setNewTarget({...newTarget, endDate: e.target.value})}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assignedTo">{t('targets.modal.assignedToLabel')}</Label>
              <Input
                id="assignedTo"
                value={newTarget.assignedTo}
                onChange={(e) => setNewTarget({...newTarget, assignedTo: e.target.value})}
                placeholder={t('targets.modal.assignedToPlaceholder')}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="text-sm sm:text-base">
                {t('targets.modal.cancel')}
              </Button>
              <Button onClick={handleAddTarget} className="text-sm sm:text-base">
                 {t('targets.modal.addButton')}
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default SalesTargets;