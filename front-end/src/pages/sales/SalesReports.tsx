import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  FileBarChart, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Target,
  Filter,
  AlertCircle
} from "lucide-react";
import salesApiService from "@/services/salesApi";
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  reports: Report[];
}

const SalesReports = () => {
  const [reportCategories, setReportCategories] = useState<ReportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salesApiService.getReports();
      
      // Transform API data into report categories
      const categories: ReportCategory[] = [
        {
          id: 'dashboard',
          title: 'إحصائيات لوحة التحكم',
          description: 'عرض شامل لأداء المبيعات والعملاء',
          icon: TrendingUp,
          color: 'bg-blue-500',
          reports: []
        },
        {
          id: 'revenue',
          title: 'تقارير الإيرادات',
          description: 'تحليل الإيرادات حسب العملاء والفترات',
          icon: DollarSign,
          color: 'bg-green-500',
          reports: []
        },
        {
          id: 'performance',
          title: 'أداء مندوبي المبيعات',
          description: 'تقييم أداء فريق المبيعات وتحقيق الأهداف',
          icon: Target,
          color: 'bg-purple-500',
          reports: []
        }
      ];
      
      setReportCategories(categories);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('فشل في تحميل التقارير');
      toast.error('فشل في تحميل التقارير');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Generate report
  const handleGenerateReport = async (reportId: string) => {
    try {
      const reportData = await salesApiService.generateReport(reportId);
      // Handle report download or display
      toast.success('تم إنشاء التقرير بنجاح');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('فشل في إنشاء التقرير');
    }
  };

  // Download report
  const handleDownloadReport = async (reportId: string) => {
    try {
      const blob = await salesApiService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('تم تحميل التقرير بنجاح');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('فشل في تحميل التقرير');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل التقارير...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchReports} variant="outline">
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">التقارير</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">إنشاء وتحميل تقارير المبيعات المختلفة</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <DatePickerWithRange />
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">تصفية</span>
              <span className="sm:hidden">فلتر</span>
            </Button>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {reportCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${category.color} text-white flex-shrink-0`}>
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm sm:text-base lg:text-lg truncate">{category.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{category.description}</p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleGenerateReport(category.id)}
                      className="w-full text-xs sm:text-sm"
                      size="sm"
                    >
                      <FileBarChart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      <span className="hidden sm:inline">إنشاء التقرير</span>
                      <span className="sm:hidden">إنشاء</span>
                    </Button>
                    <Button 
                      onClick={() => handleDownloadReport(category.id)}
                      variant="outline" 
                      className="w-full text-xs sm:text-sm"
                      size="sm"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      <span className="hidden sm:inline">تحميل PDF</span>
                      <span className="sm:hidden">تحميل</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">إجمالي العملاء</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">الوظائف النشطة</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">42</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">الإيرادات الشهرية</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">$24,500</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Target className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">تحقيق الأهداف</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SalesReports;