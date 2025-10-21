import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Target, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface MonthlyTarget {
  id: string;
  month: number;
  year: number;
  targetAmount: number;
  description?: string;
  createdAt: string;
}

export default function MonthlyTargets() {
  const { t } = useLanguage();
  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTarget, setEditingTarget] = useState<MonthlyTarget | null>(null);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    targetAmount: 0,
    description: '',
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const getMonthName = (month: number) => {
    const monthKeys = [
      'months.full.january',
      'months.full.february',
      'months.full.march',
      'months.full.april',
      'months.full.may',
      'months.full.june',
      'months.full.july',
      'months.full.august',
      'months.full.september',
      'months.full.october',
      'months.full.november',
      'months.full.december',
    ];
    return t(monthKeys[month - 1]);
  };

  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/monthly-targets');
      setTargets(response.data);
    } catch (error) {
      console.error('Error loading targets:', error);
      toast({
        title: t('common.error'),
        description: 'فشل في تحميل الأهداف',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTarget) {
        await api.put(`/settings/monthly-targets/${editingTarget.id}`, formData);
        toast({
          title: t('common.success'),
          description: 'تم تحديث الهدف بنجاح',
        });
      } else {
        await api.post('/settings/monthly-targets', formData);
        toast({
          title: t('common.success'),
          description: 'تم إضافة الهدف بنجاح',
        });
      }
      setShowAddDialog(false);
      setEditingTarget(null);
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        targetAmount: 0,
        description: '',
      });
      loadTargets();
    } catch (error) {
      console.error('Error saving target:', error);
      toast({
        title: t('common.error'),
        description: 'فشل في حفظ الهدف',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (target: MonthlyTarget) => {
    setEditingTarget(target);
    setFormData({
      month: target.month,
      year: target.year,
      targetAmount: target.targetAmount,
      description: target.description || '',
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الهدف؟')) return;

    try {
      await api.delete(`/settings/monthly-targets/${id}`);
      toast({
        title: t('common.success'),
        description: 'تم حذف الهدف بنجاح',
      });
      loadTargets();
    } catch (error) {
      console.error('Error deleting target:', error);
      toast({
        title: t('common.error'),
        description: 'فشل في حذف الهدف',
        variant: 'destructive',
      });
    }
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingTarget(null);
    setFormData({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      targetAmount: 0,
      description: '',
    });
  };

  return (
    <MainLayout userRole="admin" userName={t('roles.administrator')}>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              الأهداف الشهرية
            </h1>
            <p className="text-muted-foreground mt-2">
              إدارة أهداف الإيرادات الشهرية للشركة
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة هدف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTarget ? 'تعديل الهدف' : 'إضافة هدف جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingTarget
                    ? 'قم بتعديل بيانات الهدف الشهري'
                    : 'أضف هدف إيرادات جديد لشهر معين'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">الشهر</Label>
                    <Select
                      value={formData.month.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, month: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {getMonthName(month)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">السنة</Label>
                    <Select
                      value={formData.year.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, year: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">المبلغ المستهدف</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف (اختياري)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="أضف ملاحظات أو تفاصيل حول الهدف..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit">
                    {editingTarget ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-semibold mb-2">لا توجد أهداف</p>
                  <p className="text-muted-foreground text-center">
                    ابدأ بإضافة أهداف شهرية لتتبع أداء الإيرادات
                  </p>
                </CardContent>
              </Card>
            ) : (
              targets.map((target) => (
                <Card key={target.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        {getMonthName(target.month)} {target.year}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(target)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(target.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {target.description || 'لا يوجد وصف'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {target.targetAmount.toLocaleString()} {t('common.currency')}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

