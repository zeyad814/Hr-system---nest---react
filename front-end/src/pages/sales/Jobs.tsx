import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Calendar
} from "lucide-react";

const SalesJobs = () => {
  const jobs = [
    {
      id: 1,
      title: "مطور تطبيقات موبايل",
      client: "شركة التطوير المتقدم",
      location: "الرياض",
      type: "دوام كامل",
      salary: "8,000 - 12,000",
      applicants: 24,
      status: "نشط",
      postedDate: "2024-03-15",
      commission: "2,400"
    },
    {
      id: 2,
      title: "مصمم واجهات UX/UI",
      client: "مؤسسة الابتكار التقني",
      location: "جدة",
      type: "دوام جزئي",
      salary: "5,000 - 8,000",
      applicants: 18,
      status: "نشط",
      postedDate: "2024-03-12",
      commission: "1,800"
    },
    {
      id: 3,
      title: "محاسب مالي",
      client: "مجموعة الأعمال الرقمية",
      location: "الدمام",
      type: "دوام كامل",
      salary: "6,000 - 9,000",
      applicants: 12,
      status: "مغلق",
      postedDate: "2024-03-08",
      commission: "2,100"
    },
    {
      id: 4,
      title: "مهندس برمجيات",
      client: "شركة الحلول الذكية",
      location: "الرياض",
      type: "دوام كامل",
      salary: "10,000 - 15,000",
      applicants: 31,
      status: "نشط",
      postedDate: "2024-03-18",
      commission: "3,750"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "bg-secondary text-secondary-foreground";
      case "مغلق":
        return "bg-muted text-muted-foreground";
      case "معلق":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "دوام كامل":
        return "bg-primary text-primary-foreground";
      case "دوام جزئي":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الوظائف</h1>
            <p className="text-muted-foreground">متابعة الوظائف والمرشحين والعمولات</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة وظيفة جديدة
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="crm-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">الوظائف النشطة</p>
                  <p className="text-xl sm:text-2xl font-bold">28</p>
                </div>
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">إجمالي المتقدمين</p>
                  <p className="text-xl sm:text-2xl font-bold">85</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">العمولات المتوقعة</p>
                  <p className="text-xl sm:text-2xl font-bold">10,050 ريال</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">الوظائف المكتملة</p>
                  <p className="text-xl sm:text-2xl font-bold">12</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                  <Input
                    placeholder="البحث عن وظيفة..."
                    className="pr-8 sm:pr-10 text-sm"
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-2 w-full sm:w-auto text-sm">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                فلترة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
              قائمة الوظائف ({jobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile Cards View */}
            <div className="block sm:hidden space-y-3 p-3">
              {jobs.map((job) => (
                <Card key={job.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{job.title}</div>
                            <div className="text-xs text-muted-foreground">ID: {job.id}</div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status) + " text-xs"}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{job.client}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{job.applicants} متقدم</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span>{job.commission} ريال</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getTypeColor(job.type) + " text-xs"}>
                          {job.type}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 sm:p-4 font-semibold text-sm">الوظيفة</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-sm">العميل</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-sm">الموقع</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-sm">النوع</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-sm">الراتب</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-sm">المتقدمين</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-sm">العمولة</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-sm">الحالة</th>
                    <th className="text-right p-3 sm:p-4 font-semibold text-sm">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{job.title}</div>
                            <div className="text-xs text-muted-foreground">ID: {job.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{job.client}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {job.location}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge className={getTypeColor(job.type) + " text-xs"}>
                          {job.type}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="font-medium text-sm">{job.salary} ريال</div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{job.applicants}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="font-medium text-secondary text-sm">{job.commission} ريال</div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge className={getStatusColor(job.status) + " text-xs"}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button size="sm" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalesJobs;