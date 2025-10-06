import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Target, FileText, TrendingUp, Building2 } from "lucide-react";
import { salesApiService, DashboardStats, SalesClient, SalesContract } from "@/services/salesApi";
import { toast } from 'sonner';
import { useLanguage } from "@/contexts/LanguageContext";

const SalesDashboard = () => {
  const { t, language } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [recentClients, setRecentClients] = useState<SalesClient[]>([]);
  const [recentContracts, setRecentContracts] = useState<SalesContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard statistics
      const stats = await salesApiService.getDashboardStats();
      setDashboardData(stats);
      
      // Load recent clients (first 3)
      const clientsResponse = await salesApiService.getClients({ limit: 3 });
      setRecentClients(clientsResponse.clients || []);
      
      // Load recent contracts (first 3)
      const contracts = await salesApiService.getContracts();
      setRecentContracts((contracts || []).slice(0, 3));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(language === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading dashboard data');
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getSalesStats = () => {
    if (!dashboardData) return [];
    
    return [
      {
        title: language === 'ar' ? 'العملاء النشطون' : 'Active Clients',
        value: dashboardData.activeClients.toString(),
        change: language === 'ar' 
          ? `إجمالي العملاء: ${dashboardData.totalClients}` 
          : `Total Clients: ${dashboardData.totalClients}`,
        changeType: "positive" as const,
        icon: Building2,
        color: "primary"
      },
      {
        title: language === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue',
        value: `${dashboardData.monthlyRevenue.toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`,
        change: language === 'ar'
          ? `إجمالي الإيرادات: ${dashboardData.totalRevenue.toLocaleString()}`
          : `Total Revenue: ${dashboardData.totalRevenue.toLocaleString()}`,
        changeType: "positive" as const,
        icon: DollarSign,
        color: "secondary"
      },
      {
        title: language === 'ar' ? 'المهام المفتوحة' : 'Open Jobs',
        value: dashboardData.openJobs.toString(),
        change: language === 'ar'
          ? `إجمالي المهام: ${dashboardData.totalJobs}`
          : `Total Jobs: ${dashboardData.totalJobs}`,
        changeType: "neutral" as const,
        icon: FileText,
      },
      {
        title: language === 'ar' ? 'معدل النجاح' : 'Success Rate',
        value: dashboardData.totalJobs > 0 ? `${Math.round((dashboardData.totalJobs - dashboardData.openJobs) / dashboardData.totalJobs * 100)}%` : "0%",
        change: language === 'ar' ? 'المهام المكتملة' : 'Completed Jobs',
        changeType: "positive" as const,
        icon: TrendingUp,
        color: "accent"
      }
    ];
  };

  const getClientStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return language === 'ar' ? 'نشط' : 'Active';
      case 'LEAD': return language === 'ar' ? 'محتمل' : 'Lead';
      case 'PROSPECT': return language === 'ar' ? 'مرتقب' : 'Prospect';
      case 'INACTIVE': return language === 'ar' ? 'غير نشط' : 'Inactive';
      case 'CLOSED': return language === 'ar' ? 'مغلق' : 'Closed';
      default: return status;
    }
  };

  const getContractStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return language === 'ar' ? 'نشط' : 'Active';
      case 'COMPLETED': return language === 'ar' ? 'مكتمل' : 'Completed';
      case 'PENDING': return language === 'ar' ? 'معلق' : 'Pending';
      case 'DRAFT': return language === 'ar' ? 'مسودة' : 'Draft';
      case 'CANCELLED': return language === 'ar' ? 'ملغي' : 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <MainLayout userRole="sales" userName="عمر حسن">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout userRole="sales" userName="عمر حسن">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4" dir="rtl">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {language === 'ar' ? 'لوحة المبيعات' : 'Sales Dashboard'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {language === 'ar' 
              ? 'نظرة عامة على أداء المبيعات والعملاء والعقود'
              : 'Overview of sales performance, clients, and contracts'
            }
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {getSalesStats().map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent Clients and Contracts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Clients */}
          <Card className="crm-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {language === 'ar' ? 'العملاء الجدد' : 'Recent Clients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {recentClients.length > 0 ? recentClients.map((client, index) => (
                  <div key={index} className="p-2 sm:p-3 border border-border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base truncate">{client.company || client.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{client.contactPerson || client.name}</p>
                      </div>
                      <div className="flex justify-between sm:block sm:text-left">
                        <span className={`text-xs px-2 py-1 rounded ${
                          client.status === 'ACTIVE' ? 'bg-secondary-light text-secondary' : 'bg-primary-light text-primary'
                        }`}>
                          {getClientStatusText(client.status)}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0 sm:mt-1">
                          {client.totalSpent?.toLocaleString() || '0'} {language === 'ar' ? 'ريال' : 'SAR'}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <p className="text-sm">
                      {language === 'ar' ? 'لا يوجد عملاء' : 'No clients found'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Contracts */}
          <Card className="crm-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {language === 'ar' ? 'العقود الحديثة' : 'Recent Contracts'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {recentContracts.length > 0 ? recentContracts.map((contract, index) => (
                  <div key={index} className="p-2 sm:p-3 border border-border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base truncate">{contract.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{contract.client?.company || contract.client?.name}</p>
                      </div>
                      <div className="flex justify-between sm:block sm:text-left">
                        <span className={`text-xs px-2 py-1 rounded ${
                          contract.status === 'ACTIVE' ? 'bg-secondary-light text-secondary' : 
                          contract.status === 'COMPLETED' ? 'bg-info-light text-info' : 'bg-accent-light text-accent'
                        }`}>
                          {getContractStatusText(contract.status)}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0 sm:mt-1">
                          {contract.value?.amount?.toLocaleString() || '0'} {language === 'ar' ? 'ريال' : 'SAR'}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <p className="text-sm">
                      {language === 'ar' ? 'لا توجد عقود' : 'No contracts found'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart would go here */}
        <Card className="crm-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              {language === 'ar' ? 'الأداء' : 'Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground">
              <p className="text-sm sm:text-base">
                {language === 'ar' ? 'سيتم إضافة الرسم البياني قريباً' : 'Chart coming soon'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalesDashboard;