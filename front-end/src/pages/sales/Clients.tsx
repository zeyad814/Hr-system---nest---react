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
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  Phone,
  Mail,
  Calendar,
  DollarSign
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SalesClients = () => {
  const { t } = useLanguage();
  const clients = [
    {
      id: 1,
      name: "شركة التطوير المتقدم",
      contact: "أحمد محمد السلمي",
      email: "ahmed@advanced-dev.com",
      phone: "+966501234567",
      joinDate: "2024-01-15",
      status: "نشط",
      jobsCount: 12,
      revenue: "150,000",
      lastContract: "2024-03-10"
    },
    {
      id: 2,
      name: "مؤسسة الابتكار التقني",
      contact: "سارة علي الأحمد",
      email: "sara@innovation-tech.com", 
      phone: "+966507654321",
      joinDate: "2024-02-20",
      status: "نشط",
      jobsCount: 8,
      revenue: "95,000",
      lastContract: "2024-03-15"
    },
    {
      id: 3,
      name: "مجموعة الأعمال الرقمية",
      contact: "خالد حسن المطيري",
      email: "khaled@digital-business.com",
      phone: "+966502468135",
      joinDate: "2024-03-10",
      status: "محتمل",
      jobsCount: 5,
      revenue: "72,000",
      lastContract: "2024-02-28"
    },
    {
      id: 4,
      name: "شركة الحلول الذكية",
      contact: "فاطمة عبدالله",
      email: "fatima@smart-solutions.com",
      phone: "+966509876543",
      joinDate: "2024-01-30",
      status: "نشط",
      jobsCount: 15,
      revenue: "220,000",
      lastContract: "2024-03-20"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "bg-secondary text-secondary-foreground";
      case "محتمل":
        return "bg-warning text-warning-foreground";
      case "معلق":
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
            <h1 className="text-3xl font-bold text-foreground">{t('clients.title')}</h1>
            <p className="text-muted-foreground">{t('clients.subtitle')}</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('clients.addClient')}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('clients.stats.activeClients')}</p>
                  <p className="text-2xl font-bold">34</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('clients.stats.potentialClients')}</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Building2 className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('clients.stats.totalRevenue')}</p>
                  <p className="text-2xl font-bold">537,000 ريال</p>
                </div>
                <DollarSign className="h-8 w-8 text-secondary" />
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
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('clients.searchPlaceholder')}
                    className="pr-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {t('clients.filter')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('clients.clientsList')} ({clients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>{t('clients.table.company')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('clients.table.contact')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('clients.table.contactInfo')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('clients.table.lastContract')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('clients.table.jobsCount')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('clients.table.revenue')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('clients.table.status')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('clients.table.actions')}</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                {clients.map((client) => (
                  <ResponsiveTableRow 
                    key={client.id} 
                    headers={[t('clients.table.company'), t('clients.table.contact'), t('clients.table.contactInfo'), t('clients.table.lastContract'), t('clients.table.jobsCount'), t('clients.table.revenue'), t('clients.table.status'), t('clients.table.actions')]}
                  >
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-xs truncate">{client.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {client.id}</div>
                        </div>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-xs truncate">{client.contact}</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Mail className="h-2 w-2 text-muted-foreground" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-2 w-2 text-muted-foreground" />
                          <span className="truncate">{client.phone}</span>
                        </div>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-2 w-2 text-muted-foreground" />
                        <span className="truncate">{client.lastContract}</span>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-xs">{client.jobsCount}</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-xs">{client.revenue} ريال</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <Badge className={`${getStatusColor(client.status)} text-xs`}>
                        {client.status}
                      </Badge>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                          <Eye className="h-2 w-2" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                          <Edit className="h-2 w-2" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-2 w-2" />
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

export default SalesClients;