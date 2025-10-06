import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Target, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Filter
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const SalesReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedReport, setSelectedReport] = useState("overview");
  const [selectedYear, setSelectedYear] = useState("2024");

  // Mock data for charts
  const monthlyRevenue = [
    { month: 'يناير', revenue: 120000, contracts: 15, clients: 8 },
    { month: 'فبراير', revenue: 135000, contracts: 18, clients: 10 },
    { month: 'مارس', revenue: 148000, contracts: 22, clients: 12 },
    { month: 'أبريل', revenue: 162000, contracts: 25, clients: 14 },
    { month: 'مايو', revenue: 178000, contracts: 28, clients: 16 },
    { month: 'يونيو', revenue: 195000, contracts: 32, clients: 18 },
    { month: 'يوليو', revenue: 210000, contracts: 35, clients: 20 },
    { month: 'أغسطس', revenue: 225000, contracts: 38, clients: 22 },
    { month: 'سبتمبر', revenue: 240000, contracts: 42, clients: 24 },
    { month: 'أكتوبر', revenue: 255000, contracts: 45, clients: 26 },
    { month: 'نوفمبر', revenue: 270000, contracts: 48, clients: 28 },
    { month: 'ديسمبر', revenue: 285000, contracts: 52, clients: 30 }
  ];

  const salesByTeam = [
    { name: 'فريق الشركات الكبيرة', sales: 850000, percentage: 35, color: '#8884d8' },
    { name: 'فريق الشركات المتوسطة', sales: 620000, percentage: 25, color: '#82ca9d' },
    { name: 'فريق الشركات الصغيرة', sales: 480000, percentage: 20, color: '#ffc658' },
    { name: 'فريق التوظيف المتخصص', sales: 380000, percentage: 15, color: '#ff7300' },
    { name: 'فريق الاستشارات', sales: 120000, percentage: 5, color: '#8dd1e1' }
  ];

  const clientAcquisition = [
    { month: 'يناير', newClients: 8, lostClients: 2, netGrowth: 6 },
    { month: 'فبراير', newClients: 10, lostClients: 1, netGrowth: 9 },
    { month: 'مارس', newClients: 12, lostClients: 3, netGrowth: 9 },
    { month: 'أبريل', newClients: 14, lostClients: 2, netGrowth: 12 },
    { month: 'مايو', newClients: 16, lostClients: 4, netGrowth: 12 },
    { month: 'يونيو', newClients: 18, lostClients: 2, netGrowth: 16 },
    { month: 'يوليو', newClients: 20, lostClients: 3, netGrowth: 17 },
    { month: 'أغسطس', newClients: 22, lostClients: 1, netGrowth: 21 },
    { month: 'سبتمبر', newClients: 24, lostClients: 2, netGrowth: 22 },
    { month: 'أكتوبر', newClients: 26, lostClients: 3, netGrowth: 23 },
    { month: 'نوفمبر', newClients: 28, lostClients: 2, netGrowth: 26 },
    { month: 'ديسمبر', newClients: 30, lostClients: 1, netGrowth: 29 }
  ];

  const performanceMetrics = [
    { metric: 'معدل إغلاق الصفقات', current: 68, target: 70, trend: 'up' },
    { metric: 'متوسط قيمة الصفقة', current: 45000, target: 50000, trend: 'up' },
    { metric: 'دورة المبيعات (أيام)', current: 32, target: 30, trend: 'down' },
    { metric: 'رضا العملاء', current: 4.6, target: 4.5, trend: 'up' },
    { metric: 'معدل الاحتفاظ بالعملاء', current: 92, target: 90, trend: 'up' },
    { metric: 'عدد المكالمات اليومية', current: 45, target: 50, trend: 'down' }
  ];

  const topPerformers = [
    { name: 'أحمد محمد', sales: 285000, deals: 18, conversion: 72 },
    { name: 'فاطمة علي', sales: 265000, deals: 16, conversion: 68 },
    { name: 'محمد خالد', sales: 245000, deals: 15, conversion: 65 },
    { name: 'نورا حسن', sales: 225000, deals: 14, conversion: 62 },
    { name: 'علي أحمد', sales: 205000, deals: 13, conversion: 58 }
  ];

  const contractTypes = [
    { type: 'توظيف دائم', count: 145, value: 1250000, percentage: 45 },
    { type: 'توظيف مؤقت', count: 98, value: 680000, percentage: 30 },
    { type: 'استشارات HR', count: 52, value: 420000, percentage: 15 },
    { type: 'تدريب وتطوير', count: 35, value: 280000, percentage: 10 }
  ];

  const currentStats = {
    totalRevenue: 2850000,
    totalContracts: 425,
    totalClients: 185,
    avgDealSize: 45000,
    conversionRate: 68,
    clientRetention: 92,
    monthlyGrowth: 12.5,
    quarterlyGrowth: 28.3
  };

  const exportReport = (type: string) => {
    console.log(`Exporting ${type} report...`);
    // In a real app, this would generate and download the report
  };

  const getMetricIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getMetricColor = (current: number, target: number, isReverse = false) => {
    const isGood = isReverse ? current < target : current >= target;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">التقارير والتحليلات</h1>
            <p className="text-gray-600 mt-1">تحليل شامل لأداء المبيعات والعمليات</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="quarter">هذا الربع</SelectItem>
                <SelectItem value="year">هذا العام</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => exportReport('comprehensive')}>
              <Download className="h-4 w-4 ml-2" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-600">
                    {currentStats.totalRevenue.toLocaleString()} ر.س
                  </p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +{currentStats.monthlyGrowth}% هذا الشهر
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي العقود</p>
                  <p className="text-2xl font-bold text-blue-600">{currentStats.totalContracts}</p>
                  <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +15% هذا الشهر
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-purple-600">{currentStats.totalClients}</p>
                  <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +8% هذا الشهر
                  </p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">معدل التحويل</p>
                  <p className="text-2xl font-bold text-orange-600">{currentStats.conversionRate}%</p>
                  <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +3% هذا الشهر
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Tabs */}
        <Tabs value={selectedReport} onValueChange={setSelectedReport}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
            <TabsTrigger value="clients">العملاء</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
            <TabsTrigger value="team">الفريق</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    الإيرادات الشهرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toLocaleString()} ر.س`, 'الإيرادات']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    المبيعات حسب الفريق
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={salesByTeam}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                      >
                        {salesByTeam.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toLocaleString()} ر.س`, 'المبيعات']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{metric.metric}</h4>
                        {getMetricIcon(metric.trend)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-bold ${getMetricColor(metric.current, metric.target, metric.metric.includes('دورة'))}`}>
                          {typeof metric.current === 'number' && metric.current > 100 ? 
                            metric.current.toLocaleString() : 
                            metric.current}{metric.metric.includes('رضا') ? '/5' : metric.metric.includes('معدل') || metric.metric.includes('رضا') ? '' : metric.metric.includes('دورة') ? ' يوم' : '%'}
                        </span>
                        <span className="text-sm text-gray-600">
                          الهدف: {typeof metric.target === 'number' && metric.target > 100 ? 
                            metric.target.toLocaleString() : 
                            metric.target}{metric.metric.includes('رضا') ? '/5' : metric.metric.includes('معدل') || metric.metric.includes('رضا') ? '' : metric.metric.includes('دورة') ? ' يوم' : '%'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل الإيرادات التفصيلي</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="الإيرادات (ر.س)" />
                    <Bar dataKey="contracts" fill="#82ca9d" name="عدد العقود" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>الإيرادات حسب نوع العقد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contractTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">{type.type}</h4>
                        <p className="text-sm text-gray-600">{type.count} عقد</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{type.value.toLocaleString()} ر.س</p>
                        <p className="text-sm text-gray-600">{type.percentage}% من الإجمالي</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>نمو قاعدة العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={clientAcquisition}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="newClients" stroke="#8884d8" name="عملاء جدد" />
                    <Line type="monotone" dataKey="lostClients" stroke="#ff7300" name="عملاء مفقودون" />
                    <Line type="monotone" dataKey="netGrowth" stroke="#82ca9d" name="النمو الصافي" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">معدل الاحتفاظ</p>
                      <p className="text-2xl font-bold text-green-600">{currentStats.clientRetention}%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">متوسط قيمة العميل</p>
                      <p className="text-2xl font-bold text-blue-600">{currentStats.avgDealSize.toLocaleString()} ر.س</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">النمو الربعي</p>
                      <p className="text-2xl font-bold text-purple-600">+{currentStats.quarterlyGrowth}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء التفصيلية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">{metric.metric}</h4>
                        {getMetricIcon(metric.trend)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>القيمة الحالية:</span>
                          <span className={`font-bold ${getMetricColor(metric.current, metric.target, metric.metric.includes('دورة'))}`}>
                            {typeof metric.current === 'number' && metric.current > 100 ? 
                              metric.current.toLocaleString() : 
                              metric.current}{metric.metric.includes('رضا') ? '/5' : metric.metric.includes('معدل') || metric.metric.includes('رضا') ? '' : metric.metric.includes('دورة') ? ' يوم' : '%'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>الهدف:</span>
                          <span className="text-gray-600">
                            {typeof metric.target === 'number' && metric.target > 100 ? 
                              metric.target.toLocaleString() : 
                              metric.target}{metric.metric.includes('رضا') ? '/5' : metric.metric.includes('معدل') || metric.metric.includes('رضا') ? '' : metric.metric.includes('دورة') ? ' يوم' : '%'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              getMetricColor(metric.current, metric.target, metric.metric.includes('دورة')).includes('green') ? 
                              'bg-green-600' : 'bg-red-600'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (metric.current / metric.target) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>أفضل المؤدين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          <span className="font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{performer.name}</h4>
                          <p className="text-sm text-gray-600">{performer.deals} صفقة مغلقة</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{performer.sales.toLocaleString()} ر.س</p>
                        <p className="text-sm text-gray-600">معدل التحويل: {performer.conversion}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>أداء الفريق حسب الشهر</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="contracts" fill="#8884d8" name="عدد العقود" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>تصدير التقارير</CardTitle>
            <CardDescription>اختر نوع التقرير المطلوب تصديره</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => exportReport('revenue')}>
                <Download className="h-4 w-4 ml-2" />
                تقرير الإيرادات
              </Button>
              <Button variant="outline" onClick={() => exportReport('clients')}>
                <Download className="h-4 w-4 ml-2" />
                تقرير العملاء
              </Button>
              <Button variant="outline" onClick={() => exportReport('performance')}>
                <Download className="h-4 w-4 ml-2" />
                تقرير الأداء
              </Button>
              <Button variant="outline" onClick={() => exportReport('team')}>
                <Download className="h-4 w-4 ml-2" />
                تقرير الفريق
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SalesReports;