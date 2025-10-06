import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell,
} from "@/components/ui/responsive-table";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";

const SalesContracts = () => {
  const contracts = [
    {
      id: "CON-001",
      title: "عقد توظيف مطور تطبيقات",
      client: "شركة التطوير المتقدم",
      jobTitle: "مطور تطبيقات موبايل",
      candidate: "محمد أحمد علي",
      value: "24,000",
      commission: "2,400",
      status: "موقع",
      signedDate: "2024-03-15",
      startDate: "2024-04-01",
      duration: "12 شهر"
    },
    {
      id: "CON-002", 
      title: "عقد توظيف مصمم واجهات",
      client: "مؤسسة الابتكار التقني",
      jobTitle: "مصمم UX/UI",
      candidate: "سارة خالد محمد",
      value: "18,000",
      commission: "1,800",
      status: "قيد المراجعة",
      signedDate: "2024-03-12",
      startDate: "2024-03-25",
      duration: "6 أشهر"
    },
    {
      id: "CON-003",
      title: "عقد توظيف محاسب مالي",
      client: "مجموعة الأعمال الرقمية",
      jobTitle: "محاسب مالي",
      candidate: "أحمد سعد الهاشمي",
      value: "21,000",
      commission: "2,100",
      status: "مكتمل",
      signedDate: "2024-03-08",
      startDate: "2024-03-15",
      duration: "دائم"
    },
    {
      id: "CON-004",
      title: "عقد توظيف مهندس برمجيات",
      client: "شركة الحلول الذكية",
      jobTitle: "مهندس برمجيات",
      candidate: "فاطمة عمر السليمان",
      value: "36,000",
      commission: "3,600",
      status: "موقع",
      signedDate: "2024-03-18",
      startDate: "2024-04-05",
      duration: "24 شهر"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "موقع":
        return "bg-secondary text-secondary-foreground";
      case "مكتمل":
        return "bg-info text-info-foreground";
      case "قيد المراجعة":
        return "bg-warning text-warning-foreground";
      case "ملغي":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "موقع":
        return <CheckCircle className="h-4 w-4" />;
      case "مكتمل":
        return <CheckCircle className="h-4 w-4" />;
      case "قيد المراجعة":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة العقود</h1>
            <p className="text-muted-foreground">متابعة العقود والعمولات والمدفوعات</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إنشاء عقد جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">العقود الموقعة</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <CheckCircle className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">قيد المراجعة</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">قيمة العقود</p>
                  <p className="text-2xl font-bold">459,000 ريال</p>
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
                  <p className="text-2xl font-bold">45,900 ريال</p>
                </div>
                <DollarSign className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="البحث عن عقد..."
                    className="pr-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                فلترة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              قائمة العقود ({contracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>رقم العقد</ResponsiveTableHead>
                  <ResponsiveTableHead>العميل</ResponsiveTableHead>
                  <ResponsiveTableHead>المرشح</ResponsiveTableHead>
                  <ResponsiveTableHead>الوظيفة</ResponsiveTableHead>
                  <ResponsiveTableHead>قيمة العقد</ResponsiveTableHead>
                  <ResponsiveTableHead>العمولة</ResponsiveTableHead>
                  <ResponsiveTableHead>تاريخ البداية</ResponsiveTableHead>
                  <ResponsiveTableHead>الحالة</ResponsiveTableHead>
                  <ResponsiveTableHead>الإجراءات</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                {contracts.map((contract) => (
                  <ResponsiveTableRow 
                    key={contract.id} 
                    headers={['رقم العقد', 'العميل', 'المرشح', 'الوظيفة', 'قيمة العقد', 'العمولة', 'تاريخ البداية', 'الحالة', 'الإجراءات']}
                  >
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-xs">{contract.id}</div>
                          <div className="text-xs text-muted-foreground">{contract.duration}</div>
                        </div>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-xs truncate">{contract.client}</span>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-xs truncate">{contract.candidate}</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-xs truncate">{contract.jobTitle}</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-xs">{contract.value} ريال</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-secondary text-xs">{contract.commission} ريال</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{contract.startDate}</span>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <Badge className={`gap-2 ${getStatusColor(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        {contract.status}
                      </Badge>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </ResponsiveTableCell>
                  </ResponsiveTableRow>
                ))}
              </ResponsiveTableBody>
            </ResponsiveTable>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalesContracts;