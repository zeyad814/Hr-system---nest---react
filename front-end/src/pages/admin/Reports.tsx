import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileBarChart, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Target,
  Filter
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminReports = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<{ newClients: number; closedContracts: number; totalRevenue: number; since: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [revSeries, setRevSeries] = useState<{ date: string; amount: number }[]>([]);
  const [cliSeries, setCliSeries] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sum, rev, cli] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/revenues/timeseries"),
          api.get("/admin/clients/timeseries"),
        ]);
        setSummary(sum.data);
        setRevSeries(rev.data ?? []);
        setCliSeries(cli.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reportCategories = [
    {
      title: t('admin.reports.salesReports'),
      description: t('admin.reports.salesReportsDesc'),
      icon: DollarSign,
      color: "bg-accent",
      reports: [

      ]
    },
    {
      title: t('admin.reports.recruitmentReports'),
      description: t('admin.reports.recruitmentReportsDesc'),
      icon: Briefcase,
      color: "bg-secondary",
      reports: [

      ]
    },
    {
      title: t('admin.reports.clientReports'),
      description: t('admin.reports.clientReportsDesc'),
      icon: Users,
      color: "bg-primary",
      reports: [

      ]
    },
    {
      title: t('admin.reports.generalPerformance'),
      description: t('admin.reports.generalPerformanceDesc'),
      icon: Target,
      color: "bg-info",
      reports: [

      ]
    }
  ];

  const quickStats = [

  ];

  return (
    <MainLayout userRole="admin" >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">{t('admin.reports.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t('admin.reports.subtitle')}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">

          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{String(stat.value)}</p>
                </div>
                <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 ${stat.color} shrink-0`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Time Series */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg break-words">{t('admin.reports.revenue30Days')}</CardTitle>
            </CardHeader>
            <CardContent className="h-48 sm:h-64 lg:h-72 p-3 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revSeries} margin={{ left: 4, right: 4, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={16} fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg break-words">{t('admin.reports.newClientsOverTime')}</CardTitle>
            </CardHeader>
            <CardContent className="h-48 sm:h-64 lg:h-72 p-3 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cliSeries} margin={{ left: 4, right: 4, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={16} fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {reportCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className={`${category.color} p-1.5 sm:p-2 rounded-lg text-white shrink-0`}>
                    <category.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold break-words">{category.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-normal">{category.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {category.reports.map((report, reportIndex) => (
                    <div key={reportIndex} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors gap-2 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm break-words">{report.name}</h4>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                      </div>
                      <div className="flex gap-1 sm:gap-2 shrink-0">
                        <Button size="sm" variant="outline" className="h-7 sm:h-8 px-1 sm:px-2 text-xs">
                          <Download className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                          <span className="hidden sm:inline">{t('common.download')}</span>
                          <span className="sm:hidden">DL</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 sm:h-8 px-1 sm:px-2 text-xs">
                          <span className="hidden sm:inline">{t('common.view')}</span>
                          <span className="sm:hidden">{t('common.view')}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg break-words">{t('admin.reports.recentReports')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {[
               
              ].map((report, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 border border-border rounded-lg gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <FileBarChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm truncate">{report.name}</h4>
                      <div className="flex items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                        <span className="truncate">{report.date}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{report.size}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{report.format}</span>
                      </div>
                      <div className="sm:hidden text-xs text-muted-foreground">
                        {report.size} • {report.format}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 sm:gap-2 h-7 sm:h-8 px-2 text-xs w-full sm:w-auto">
                    <Download className="h-2 w-2 sm:h-3 sm:w-3" />
                    {t('common.download')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminReports;