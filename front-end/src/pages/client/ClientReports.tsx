import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  Download,
  Filter,
  Eye,
  FileText,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell,
} from "@/components/ui/responsive-table"

const ClientReports = () => {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState("last_month")
  const [reportType, setReportType] = useState("overview")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  // Mock data - في التطبيق الحقيقي ستأتي من API
  const overviewStats = {
    totalJobs: 12,
    activeJobs: 5,
    totalCandidates: 87,
    hiredCandidates: 8,
    pendingReviews: 15,
    averageTimeToHire: 18, // days
    totalSpent: 45000, // SAR
    successRate: 67 // percentage
  }

  const jobsData = [
    {
      id: 1,
      title: "مطور React Senior",
      department: "تقنية المعلومات",
      candidates: 15,
      hired: 1,
      status: "نشط",
      budget: 20000,
      spent: 5000,
      createdDate: "2024-01-15",
      timeToHire: 12
    },
    {
      id: 2,
      title: "مدير مبيعات",
      department: "المبيعات",
      candidates: 8,
      hired: 1,
      status: "مكتمل",
      budget: 18000,
      spent: 8000,
      createdDate: "2024-01-12",
      timeToHire: 15
    },
    {
      id: 3,
      title: "محاسب مالي",
      department: "المالية",
      candidates: 22,
      hired: 2,
      status: "مكتمل",
      budget: 12000,
      spent: 6000,
      createdDate: "2024-01-10",
      timeToHire: 20
    },
    {
      id: 4,
      title: "مصمم UI/UX",
      department: "التصميم",
      candidates: 12,
      hired: 0,
      status: "نشط",
      budget: 15000,
      spent: 3000,
      createdDate: "2024-01-08",
      timeToHire: null
    },
    {
      id: 5,
      title: "مطور Backend",
      department: "تقنية المعلومات",
      candidates: 9,
      hired: 0,
      status: "نشط",
      budget: 18000,
      spent: 2000,
      createdDate: "2024-01-05",
      timeToHire: null
    }
  ]

  const candidatesData = [
    {
      name: "سارة أحمد",
      position: "مطور React Senior",
      status: "مقبول",
      appliedDate: "2024-01-15",
      hiredDate: "2024-01-25",
      timeToHire: 10,
      rating: 4.8,
      salary: 18000
    },
    {
      name: "محمد علي",
      position: "مدير مبيعات",
      status: "مقبول",
      appliedDate: "2024-01-12",
      hiredDate: "2024-01-22",
      timeToHire: 10,
      rating: 4.9,
      salary: 16000
    },
    {
      name: "فاطمة حسن",
      position: "محاسب مالي",
      status: "مرفوض",
      appliedDate: "2024-01-10",
      hiredDate: null,
      timeToHire: null,
      rating: 4.2,
      salary: null
    },
    {
      name: "أحمد خالد",
      position: "مصمم UI/UX",
      status: "مقابلة",
      appliedDate: "2024-01-08",
      hiredDate: null,
      timeToHire: null,
      rating: 4.6,
      salary: null
    }
  ]

  const departmentStats = [
    {
      department: "تقنية المعلومات",
      jobs: 3,
      candidates: 24,
      hired: 1,
      budget: 56000,
      spent: 10000,
      successRate: 33
    },
    {
      department: "المبيعات",
      jobs: 1,
      candidates: 8,
      hired: 1,
      budget: 18000,
      spent: 8000,
      successRate: 100
    },
    {
      department: "المالية",
      jobs: 1,
      candidates: 22,
      hired: 2,
      budget: 12000,
      spent: 6000,
      successRate: 100
    },
    {
      department: "التصميم",
      jobs: 1,
      candidates: 12,
      hired: 0,
      budget: 15000,
      spent: 3000,
      successRate: 0
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "bg-green-100 text-green-800"
      case "مكتمل":
        return "bg-blue-100 text-blue-800"
      case "مقبول":
        return "bg-green-100 text-green-800"
      case "مرفوض":
        return "bg-red-100 text-red-800"
      case "مقابلة":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportReport = (type: string) => {
    // في التطبيق الحقيقي سيتم تصدير التقرير
    console.log(`Exporting ${type} report`)
  }

  return (
    <MainLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">التقارير والإحصائيات</h1>
            <p className="text-muted-foreground mt-2">تحليل شامل لأداء التوظيف والمرشحين</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport('pdf')}>
              <Download className="h-4 w-4 ml-2" />
              تصدير PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport('excel')}>
              <Download className="h-4 w-4 ml-2" />
              تصدير Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_week">الأسبوع الماضي</SelectItem>
                  <SelectItem value="last_month">الشهر الماضي</SelectItem>
                  <SelectItem value="last_quarter">الربع الماضي</SelectItem>
                  <SelectItem value="last_year">السنة الماضية</SelectItem>
                  <SelectItem value="custom">فترة مخصصة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                  <SelectItem value="المبيعات">المبيعات</SelectItem>
                  <SelectItem value="المالية">المالية</SelectItem>
                  <SelectItem value="التصميم">التصميم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={reportType} onValueChange={setReportType}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="jobs">تقرير الوظائف</TabsTrigger>
            <TabsTrigger value="candidates">تقرير المرشحين</TabsTrigger>
            <TabsTrigger value="departments">تقرير الأقسام</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الوظائف</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.totalJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    {overviewStats.activeJobs} وظيفة نشطة
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المرشحين</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.totalCandidates}</div>
                  <p className="text-xs text-muted-foreground">
                    {overviewStats.pendingReviews} في انتظار المراجعة
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">المرشحين المقبولين</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.hiredCandidates}</div>
                  <p className="text-xs text-muted-foreground">
                    معدل النجاح {overviewStats.successRate}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">متوسط وقت التوظيف</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.averageTimeToHire}</div>
                  <p className="text-xs text-muted-foreground">يوم</p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    الملخص المالي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">إجمالي الميزانية</span>
                      <span className="font-bold">{overviewStats.totalSpent.toLocaleString()} ريال</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">المبلغ المنفق</span>
                      <span className="font-bold text-blue-600">{(overviewStats.totalSpent * 0.6).toLocaleString()} ريال</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">المتبقي</span>
                      <span className="font-bold text-green-600">{(overviewStats.totalSpent * 0.4).toLocaleString()} ريال</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600  h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    أداء التوظيف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">معدل النجاح</span>
                      <span className="font-bold">{overviewStats.successRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">متوسط المرشحين لكل وظيفة</span>
                      <span className="font-bold">{Math.round(overviewStats.totalCandidates / overviewStats.totalJobs)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">الوظائف النشطة</span>
                      <span className="font-bold">{overviewStats.activeJobs}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${overviewStats.successRate}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Report Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تقرير الوظائف التفصيلي</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveTable>
                  <ResponsiveTableHeader>
                    <ResponsiveTableRow>
                      <ResponsiveTableHead>الوظيفة</ResponsiveTableHead>
                      <ResponsiveTableHead>القسم</ResponsiveTableHead>
                      <ResponsiveTableHead>المرشحين</ResponsiveTableHead>
                      <ResponsiveTableHead>المقبولين</ResponsiveTableHead>
                      <ResponsiveTableHead>الحالة</ResponsiveTableHead>
                      <ResponsiveTableHead>الميزانية</ResponsiveTableHead>
                      <ResponsiveTableHead>المنفق</ResponsiveTableHead>
                      <ResponsiveTableHead>وقت التوظيف</ResponsiveTableHead>
                      <ResponsiveTableHead>الإجراءات</ResponsiveTableHead>
                    </ResponsiveTableRow>
                  </ResponsiveTableHeader>
                  <ResponsiveTableBody>
                    {jobsData.map((job) => (
                      <ResponsiveTableRow 
                        key={job.id}
                        headers={['الوظيفة', 'القسم', 'المرشحين', 'المقبولين', 'الحالة', 'الميزانية', 'المنفق', 'وقت التوظيف', 'الإجراءات']}
                      >
                        <ResponsiveTableCell>
                          <span className="font-medium text-sm">{job.title}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{job.department}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{job.candidates}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{job.hired}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{job.budget.toLocaleString()} ريال</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{job.spent.toLocaleString()} ريال</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{job.timeToHire ? `${job.timeToHire} يوم` : '-'}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/client/jobs/${job.id}`)}
                            className="text-xs"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </ResponsiveTableCell>
                      </ResponsiveTableRow>
                    ))}
                  </ResponsiveTableBody>
                </ResponsiveTable>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidates Report Tab */}
          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تقرير المرشحين التفصيلي</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveTable>
                  <ResponsiveTableHeader>
                    <ResponsiveTableRow>
                      <ResponsiveTableHead>المرشح</ResponsiveTableHead>
                      <ResponsiveTableHead>الوظيفة</ResponsiveTableHead>
                      <ResponsiveTableHead>الحالة</ResponsiveTableHead>
                      <ResponsiveTableHead>تاريخ التقديم</ResponsiveTableHead>
                      <ResponsiveTableHead>تاريخ التوظيف</ResponsiveTableHead>
                      <ResponsiveTableHead>وقت التوظيف</ResponsiveTableHead>
                      <ResponsiveTableHead>التقييم</ResponsiveTableHead>
                      <ResponsiveTableHead>الراتب</ResponsiveTableHead>
                    </ResponsiveTableRow>
                  </ResponsiveTableHeader>
                  <ResponsiveTableBody>
                    {candidatesData.map((candidate, index) => (
                      <ResponsiveTableRow 
                        key={index}
                        headers={['المرشح', 'الوظيفة', 'الحالة', 'تاريخ التقديم', 'تاريخ التوظيف', 'وقت التوظيف', 'التقييم', 'الراتب']}
                      >
                        <ResponsiveTableCell>
                          <span className="font-medium text-sm">{candidate.name}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{candidate.position}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{candidate.appliedDate}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{candidate.hiredDate || '-'}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{candidate.timeToHire ? `${candidate.timeToHire} يوم` : '-'}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{candidate.rating}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{candidate.salary ? `${candidate.salary.toLocaleString()} ريال` : '-'}</span>
                        </ResponsiveTableCell>
                      </ResponsiveTableRow>
                    ))}
                  </ResponsiveTableBody>
                </ResponsiveTable>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Report Tab */}
          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تقرير الأقسام</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveTable>
                  <ResponsiveTableHeader>
                    <ResponsiveTableRow>
                      <ResponsiveTableHead>القسم</ResponsiveTableHead>
                      <ResponsiveTableHead>الوظائف</ResponsiveTableHead>
                      <ResponsiveTableHead>المرشحين</ResponsiveTableHead>
                      <ResponsiveTableHead>المقبولين</ResponsiveTableHead>
                      <ResponsiveTableHead>معدل النجاح</ResponsiveTableHead>
                      <ResponsiveTableHead>الميزانية</ResponsiveTableHead>
                      <ResponsiveTableHead>المنفق</ResponsiveTableHead>
                      <ResponsiveTableHead>الكفاءة</ResponsiveTableHead>
                    </ResponsiveTableRow>
                  </ResponsiveTableHeader>
                  <ResponsiveTableBody>
                    {departmentStats.map((dept, index) => (
                      <ResponsiveTableRow 
                        key={index}
                        headers={['القسم', 'الوظائف', 'المرشحين', 'المقبولين', 'معدل النجاح', 'الميزانية', 'المنفق', 'الكفاءة']}
                      >
                        <ResponsiveTableCell>
                          <span className="font-medium text-sm">{dept.department}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{dept.jobs}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{dept.candidates}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{dept.hired}</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <Badge className={dept.successRate > 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {dept.successRate}%
                          </Badge>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{dept.budget.toLocaleString()} ريال</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <span className="text-sm">{dept.spent.toLocaleString()} ريال</span>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600  h-2 rounded-full" 
                              style={{ width: `${(dept.spent / dept.budget) * 100}%` }}
                            ></div>
                          </div>
                        </ResponsiveTableCell>
                      </ResponsiveTableRow>
                    ))}
                  </ResponsiveTableBody>
                </ResponsiveTable>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default ClientReports