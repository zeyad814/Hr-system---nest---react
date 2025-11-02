import React, { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText, 
  Download,
  Calendar,
  Building2,
  Target,
  Award,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { revenueService, RevenueStats, MonthlyRevenueData, TopClient, CommissionBreakdown } from '@/services/revenueService';
import { useSalesCurrency } from "@/contexts/SalesCurrencyContext";

const SalesRevenue = () => {
  const { t } = useLanguage();
  const { currency, getCurrencyIcon, getCurrencyName } = useSalesCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for real data
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenueData[]>([]);
  const [topClientsData, setTopClientsData] = useState<TopClient[]>([]);
  const [commissionBreakdownData, setCommissionBreakdownData] = useState<CommissionBreakdown[]>([]);

  // Load data on component mount and when period or currency changes
  useEffect(() => {
    loadRevenueData();
  }, [selectedPeriod, currency]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, monthlyRevenueRaw] = await Promise.all([
        revenueService.getDashboardStats(currency),
        revenueService.getMonthlyRevenue(parseInt(selectedPeriod), currency)
      ]);

      // Normalize monthly data to avoid undefined fields
      const monthsNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      const monthlyRevenueData: MonthlyRevenueData[] = (monthlyRevenueRaw || []).map((m: any) => ({
        month: typeof m.month === 'number' ? (monthsNames[m.month - 1] || `${m.month}`) : (m.month || ''),
        revenue: Number(m.revenue || 0),
        commissions: Number(m.commissions || 0),
        contracts: Number(m.contracts || 0),
        clients: Number(m.clients || 0)
      }));

      setStats(statsData);
      setMonthlyData(monthlyRevenueData);
      // Optional: leave empty until backend endpoints are available
      setTopClientsData([]);
      setCommissionBreakdownData([]);
    } catch (err) {
      console.error('Error loading revenue data:', err);
      setError('فشل في تحميل بيانات الإيرادات');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!stats || !monthlyData.length) {
      alert(t('errors.noDataToExport'));
      return;
    }

    try {
      const blob = await revenueService.exportRevenuePDF({
        stats,
        monthlyData,
        topClients: topClientsData,
        commissionBreakdown: commissionBreakdownData
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `revenue-report-${selectedPeriod}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert(t('errors.failedToExport'));
    }
  };

  if (loading) {
    return (
      <MainLayout userRole="sales" userName="عمر حسن">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">جاري تحميل البيانات...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userRole="sales" userName="عمر حسن">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </MainLayout>
    );
  }

  // Calculate totals from real data
  const totalRevenue = stats?.totalRevenue || 0;
  const totalCommissions = stats?.totalCommissions || 0;
  const averageContractValue = stats?.averageContractValue || 0;
  const contractCount = stats?.contractCount || 0;
  const growthPercentage = stats?.growthPercentage || 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">تتبع الإيرادات</h1>
            <p className="text-muted-foreground">متابعة الإيرادات والعمولات والأداء المالي</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              تصدير التقرير
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              فترة زمنية
            </Button>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}</p>
                    <span className="text-xl font-bold">{currency}</span>
                  </div>
                  <p className="text-sm text-secondary">+{growthPercentage.toFixed(1)}% من الشهر الماضي</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl text-red-500 font-bold">{getCurrencyIcon(currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي العمولات</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{totalCommissions.toLocaleString()}</p>
                    <span className="text-xl font-bold">{currency}</span>
                  </div>
                  <p className="text-sm text-secondary">معدل {((totalCommissions / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <span className="text-3xl text-red-500 font-bold">{getCurrencyIcon(currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">متوسط قيمة العقد</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{averageContractValue.toLocaleString()}</p>
                    <span className="text-xl font-bold">{currency}</span>
                  </div>
                  <p className="text-sm text-accent">+{growthPercentage.toFixed(1)}% من الشهر الماضي</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-3xl text-red-500 font-bold">{getCurrencyIcon(currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">العقود الشهر</p>
                  <p className="text-2xl font-bold">{contractCount}</p>
                  <p className="text-sm text-info">عقد نشط</p>
                </div>
                <BarChart3 className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              أداء الإيرادات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{month.month}</h4>
                        <p className="text-sm text-muted-foreground">
                          {month.contracts} عقد من {month.clients} عميل
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">الإيرادات</p>
                        <div className="flex items-center gap-1 justify-center">
                          <p className="text-lg font-bold">{month.revenue.toLocaleString()}</p>
                          <span className="text-base font-bold">{currency}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">العمولة</p>
                        <div className="flex items-center gap-1 justify-center">
                          <p className="text-lg font-bold text-secondary">{month.commissions.toLocaleString()}</p>
                          <span className="text-base font-bold">{currency}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">النمو</p>
                        <Badge className={`${
                          growthPercentage >= 0 
                            ? 'bg-secondary text-secondary-foreground' 
                            : 'bg-destructive text-destructive-foreground'
                        }`}>
                          {growthPercentage >= 0 ? (
                            <TrendingUp className="h-3 w-3 ml-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 ml-1" />
                          )}
                          {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Clients by Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                أفضل العملاء حسب الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClientsData.map((client, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{client.name}</h4>
                        <p className="text-sm text-muted-foreground">{client.contracts} عقد</p>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1">
                          <p className="font-bold">{client.revenue.toLocaleString()}</p>
                          <span className="font-bold">{currency}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-secondary">{client.commissions.toLocaleString()} عمولة</p>
                          <span className="text-sm font-bold">{currency}</span>
                        </div>
                        <Badge className="bg-secondary text-secondary-foreground mt-1">
                          {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Commission Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                توزيع العمولات حسب النوع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commissionBreakdownData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.type}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{item.amount.toLocaleString()}</span>
                          <span className="font-bold">{currency}</span>
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`bg-primary h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center font-bold">
                    <span>إجمالي العمولات</span>
                    <div className="flex items-center gap-1">
                      <span>{totalCommissions.toLocaleString()}</span>
                      <span className="font-bold">{currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SalesRevenue;