import React, { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const SalesRevenue = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for real data
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenueData[]>([]);
  const [topClientsData, setTopClientsData] = useState<TopClient[]>([]);
  const [commissionBreakdownData, setCommissionBreakdownData] = useState<CommissionBreakdown[]>([]);

  // Load data on component mount and when period changes
  useEffect(() => {
    loadRevenueData();
  }, [selectedPeriod]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, monthlyRevenueData, topClientsResponse, commissionData] = await Promise.all([
        revenueService.getDashboardStats(),
        revenueService.getMonthlyRevenue(parseInt(selectedPeriod)),
        revenueService.getTopClients(10),
        revenueService.getCommissionBreakdown()
      ]);

      setStats(statsData);
      setMonthlyData(monthlyRevenueData);
      setTopClientsData(topClientsResponse);
      setCommissionBreakdownData(commissionData);
    } catch (err) {
      console.error('Error loading revenue data:', err);
      setError('فشل في تحميل بيانات الإيرادات');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!stats || !monthlyData.length) {
      alert('لا توجد بيانات للتصدير');
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
      alert('فشل في تصدير التقرير');
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
                  <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} ريال</p>
                  <p className="text-sm text-secondary">+{growthPercentage.toFixed(1)}% من الشهر الماضي</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي العمولات</p>
                  <p className="text-2xl font-bold">{totalCommissions.toLocaleString()} ريال</p>
                  <p className="text-sm text-secondary">معدل {((totalCommissions / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">متوسط قيمة العقد</p>
                  <p className="text-2xl font-bold">{averageContractValue.toLocaleString()} ريال</p>
                  <p className="text-sm text-accent">+{growthPercentage.toFixed(1)}% من الشهر الماضي</p>
                </div>
                <FileText className="h-8 w-8 text-accent" />
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
                        <p className="text-lg font-bold">{month.revenue.toLocaleString()} ريال</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">العمولة</p>
                        <p className="text-lg font-bold text-secondary">{month.commissions.toLocaleString()} ريال</p>
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
                        <p className="font-bold">{client.revenue.toLocaleString()} ريال</p>
                        <p className="text-sm text-secondary">{client.commissions.toLocaleString()} ريال عمولة</p>
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
                        <span className="font-bold">{item.amount.toLocaleString()} ريال</span>
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
                    <span>{totalCommissions.toLocaleString()} ريال</span>
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