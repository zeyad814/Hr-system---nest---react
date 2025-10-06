import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Target, 
  Calendar,
  Download,
  Filter,
  Eye,
  UserCheck,
  Building,
  Award,
  DollarSign
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const ClientReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedYear, setSelectedYear] = useState("2024");

  // Mock data for charts
  const applicationTrends = [
    { month: 'يناير', applications: 45, interviews: 12, hires: 3 },
    { month: 'فبراير', applications: 52, interviews: 15, hires: 4 },
    { month: 'مارس', applications: 38, interviews: 10, hires: 2 },
    { month: 'أبريل', applications: 61, interviews: 18, hires: 5 },
    { month: 'مايو', applications: 49, interviews: 14, hires: 4 },
    { month: 'يونيو', applications: 67, interviews: 20, hires: 6 }
  ];

  const jobPerformance = [
    { name: 'مطور برمجيات أول', applications: 45, views: 320, conversion: 14.1 },
    { name: 'مصمم UI/UX', applications: 28, views: 185, conversion: 15.1 },
    { name: 'محلل بيانات', applications: 32, views: 210, conversion: 15.2 },
    { name: 'مدير مشروع', applications: 18, views: 95, conversion: 18.9 },
    { name: 'متدرب تطوير ويب', applications: 67, views: 450, conversion: 14.9 },
    { name: 'مختص أمن سيبراني', applications: 23, views: 140, conversion: 16.4 }
  ];

  const departmentStats = [
    { name: 'تقنية المعلومات', value: 45, color: '#3B82F6' },
    { name: 'التصميم', value: 20, color: '#10B981' },
    { name: 'التحليل والبيانات', value: 15, color: '#F59E0B' },
    { name: 'إدارة المشاريع', value: 12, color: '#EF4444' },
    { name: 'أمن المعلومات', value: 8, color: '#8B5CF6' }
  ];

  const hiringFunnel = [
    { stage: 'التقديمات', count: 213, percentage: 100 },
    { stage: 'المراجعة الأولية', count: 156, percentage: 73.2 },
    { stage: 'المقابلات الهاتفية', count: 89, percentage: 41.8 },
    { stage: 'المقابلات الشخصية', count: 45, percentage: 21.1 },
    { stage: 'الاختبارات التقنية', count: 28, percentage: 13.1 },
    { stage: 'العروض المقدمة', count: 18, percentage: 8.5 },
    { stage: 'التوظيف النهائي', count: 14, percentage: 6.6 }
  ];

  const timeToHire = [
    { department: 'تقنية المعلومات', days: 28 },
    { department: 'التصميم', days: 22 },
    { department: 'التحليل والبيانات', days: 25 },
    { department: 'إدارة المشاريع', days: 35 },
    { department: 'أمن المعلومات', days: 32 }
  ];

  const candidateQuality = [
    { month: 'يناير', qualified: 65, unqualified: 35 },
    { month: 'فبراير', qualified: 72, unqualified: 28 },
    { month: 'مارس', qualified: 58, unqualified: 42 },
    { month: 'أبريل', qualified: 78, unqualified: 22 },
    { month: 'مايو', qualified: 69, unqualified: 31 },
    { month: 'يونيو', qualified: 81, unqualified: 19 }
  ];

  const topSources = [
    { source: 'LinkedIn', applications: 89, hires: 8, cost: 1200 },
    { source: 'موقع الشركة', applications: 67, hires: 6, cost: 0 },
    { source: 'Indeed', applications: 45, hires: 3, cost: 800 },
    { source: 'Bayt.com', applications: 32, hires: 2, cost: 600 },
    { source: 'الإحالات', applications: 28, hires: 4, cost: 400 }
  ];

  // Key metrics
  const keyMetrics = {
    totalApplications: 213,
    totalHires: 14,
    averageTimeToHire: 28,
    costPerHire: 2850,
    offerAcceptanceRate: 77.8,
    qualityOfHire: 4.2,
    hiringManagerSatisfaction: 4.5,
    candidateExperience: 4.1
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تقارير التوظيف</h1>
            <p className="text-gray-600 mt-1">تحليل شامل لأداء عمليات التوظيف والإحصائيات</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">أسبوعي</SelectItem>
                <SelectItem value="month">شهري</SelectItem>
                <SelectItem value="quarter">ربع سنوي</SelectItem>
                <SelectItem value="year">سنوي</SelectItem>
              </SelectContent>
            </Select>
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
            <Button variant="outline">
              <Download className="h-4 w-4 ml-2" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي التقديمات</p>
                  <p className="text-2xl font-bold text-blue-600">{keyMetrics.totalApplications}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+12.5%</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي التوظيف</p>
                  <p className="text-2xl font-bold text-green-600">{keyMetrics.totalHires}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+8.3%</span>
                  </div>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">متوسط وقت التوظيف</p>
                  <p className="text-2xl font-bold text-orange-600">{keyMetrics.averageTimeToHire} يوم</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">-5.2%</span>
                  </div>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">تكلفة التوظيف</p>
                  <p className="text-2xl font-bold text-purple-600">{keyMetrics.costPerHire.toLocaleString()} ر.س</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">-3.1%</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">معدل قبول العروض</p>
                  <p className="text-xl font-bold text-green-600">{keyMetrics.offerAcceptanceRate}%</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">جودة التوظيف</p>
                  <p className="text-xl font-bold text-blue-600">{keyMetrics.qualityOfHire}/5</p>
                </div>
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">رضا مدراء التوظيف</p>
                  <p className="text-xl font-bold text-indigo-600">{keyMetrics.hiringManagerSatisfaction}/5</p>
                </div>
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">تجربة المرشحين</p>
                  <p className="text-xl font-bold text-pink-600">{keyMetrics.candidateExperience}/5</p>
                </div>
                <Users className="h-6 w-6 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="applications">التقديمات</TabsTrigger>
            <TabsTrigger value="jobs">الوظائف</TabsTrigger>
            <TabsTrigger value="funnel">مسار التوظيف</TabsTrigger>
            <TabsTrigger value="sources">مصادر التوظيف</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>اتجاهات التقديمات الشهرية</CardTitle>
                  <CardDescription>مقارنة التقديمات والمقابلات والتوظيف</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={applicationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="applications" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="interviews" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="hires" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع التقديمات حسب القسم</CardTitle>
                  <CardDescription>نسبة التقديمات لكل قسم</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>جودة المرشحين</CardTitle>
                  <CardDescription>نسبة المرشحين المؤهلين مقابل غير المؤهلين</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={candidateQuality}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="qualified" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="unqualified" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات التقديمات</CardTitle>
                  <CardDescription>تفاصيل شاملة عن التقديمات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">إجمالي التقديمات</span>
                      <span className="text-xl font-bold text-blue-600">213</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">التقديمات المؤهلة</span>
                      <span className="text-xl font-bold text-green-600">156 (73%)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">قيد المراجعة</span>
                      <span className="text-xl font-bold text-yellow-600">45 (21%)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">مرفوضة</span>
                      <span className="text-xl font-bold text-red-600">12 (6%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>أداء الوظائف</CardTitle>
                <CardDescription>إحصائيات التقديمات والمشاهدات لكل وظيفة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobPerformance.map((job, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{job.name}</h4>
                        <Badge variant="outline">{job.conversion.toFixed(1)}% معدل التحويل</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>{job.applications} تقديم</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-green-600" />
                          <span>{job.views} مشاهدة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span>{job.conversion.toFixed(1)}% تحويل</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>مسار التوظيف</CardTitle>
                  <CardDescription>تتبع المرشحين عبر مراحل التوظيف</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hiringFunnel.map((stage, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <span className="text-sm text-gray-600">{stage.count} ({stage.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600  h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stage.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>متوسط وقت التوظيف حسب القسم</CardTitle>
                  <CardDescription>الوقت المطلوب لإكمال عملية التوظيف</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeToHire}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="days" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>أداء مصادر التوظيف</CardTitle>
                <CardDescription>مقارنة فعالية مصادر التوظيف المختلفة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSources.map((source, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{source.source}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {((source.hires / source.applications) * 100).toFixed(1)}% معدل التوظيف
                          </Badge>
                          <Badge variant="outline">
                            {source.cost > 0 ? `${(source.cost / source.hires).toFixed(0)} ر.س/توظيف` : 'مجاني'}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>{source.applications} تقديم</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span>{source.hires} توظيف</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                          <span>{source.cost.toLocaleString()} ر.س تكلفة</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-orange-600" />
                          <span>{((source.hires / source.applications) * 100).toFixed(1)}% نجاح</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
                  <CardDescription>قياس فعالية عملية التوظيف</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">معدل قبول العروض</span>
                        <p className="text-sm text-gray-600">نسبة المرشحين الذين قبلوا العروض</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-green-600">{keyMetrics.offerAcceptanceRate}%</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">+2.1%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">جودة التوظيف</span>
                        <p className="text-sm text-gray-600">تقييم أداء الموظفين الجدد</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-blue-600">{keyMetrics.qualityOfHire}/5</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">+0.3</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">رضا مدراء التوظيف</span>
                        <p className="text-sm text-gray-600">تقييم رضا المدراء عن المرشحين</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-indigo-600">{keyMetrics.hiringManagerSatisfaction}/5</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">+0.2</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">تجربة المرشحين</span>
                        <p className="text-sm text-gray-600">تقييم المرشحين لعملية التوظيف</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-pink-600">{keyMetrics.candidateExperience}/5</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">+0.1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>التحسينات المقترحة</CardTitle>
                  <CardDescription>توصيات لتحسين عملية التوظيف</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800">تحسين مصادر التوظيف</h4>
                      <p className="text-sm text-blue-700 mt-1">زيادة الاستثمار في LinkedIn و الإحالات لتحسين جودة المرشحين</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800">تسريع عملية التوظيف</h4>
                      <p className="text-sm text-green-700 mt-1">تقليل وقت التوظيف في قسم إدارة المشاريع من 35 إلى 28 يوم</p>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800">تحسين تجربة المرشحين</h4>
                      <p className="text-sm text-yellow-700 mt-1">تطوير عملية التواصل وتقديم ردود فعل أسرع للمرشحين</p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-800">تحسين معدل القبول</h4>
                      <p className="text-sm text-purple-700 mt-1">مراجعة حزم التعويضات والمزايا لزيادة معدل قبول العروض</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ClientReports;