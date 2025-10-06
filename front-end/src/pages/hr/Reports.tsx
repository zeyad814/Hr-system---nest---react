import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  FileBarChart, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
  Target,
  Filter
} from "lucide-react";

const HRReports = () => {
  const { t } = useLanguage();
  
  const reportCategories = [
    {
      title: "تقارير التوظيف",
      description: "إحصائيات شاملة عن عمليات التوظيف",
      icon: Briefcase,
      color: "bg-primary",
      reports: [

      ]
    },
    {
      title: "تقارير المرشحين",
      description: "تحليلات تفصيلية عن المتقدمين للوظائف",
      icon: Users,
      color: "bg-secondary",
      reports: [

      ]
    },
    {
      title: "تقارير المقابلات",
      description: "متابعة وتحليل جلسات المقابلات",
      icon: Calendar,
      color: "bg-accent",
      reports: [

      ]
    },
    {
      title: "تقارير الأداء",
      description: "مؤشرات أداء قسم الموارد البشرية",
      icon: Target,
      color: "bg-info",
      reports: [

      ]
    }
  ];

  const quickStats = [

  ];

  return (
    <MainLayout userRole="hr" userName="سارة أحمد">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{t('hr.reports.title')}</h1>
            <p className="text-muted-foreground">{t('hr.reports.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {t('hr.reports.filterReports')}
            </Button>
            <Button className="gap-2">
              <Calendar className="h-4 w-4" />
              {t('hr.reports.customReport')}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`${category.color} p-2 rounded-lg text-white`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground font-normal">{category.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.reports.map((report, reportIndex) => (
                    <div key={reportIndex} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{report.name}</h4>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 px-2">
                          <Download className="h-3 w-3 ml-1" />
                          {t('hr.reports.download')}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2">
                          {t('hr.reports.view')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent HR Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5" />
              {t('hr.reports.recentReports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
              
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileBarChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{report.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                        <span>•</span>
                        <span>{report.format}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">{report.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-3 w-3" />
                    {t('hr.reports.download')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('hr.reports.monthlyPerformanceSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('hr.reports.jobsPosted')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">32</span>
                    <Badge variant="outline" className="text-xs text-secondary">+15%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('hr.reports.newCandidates')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">128</span>
                    <Badge variant="outline" className="text-xs text-secondary">+23%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('hr.reports.completedInterviews')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">45</span>
                    <Badge variant="outline" className="text-xs text-accent">+8%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('hr.reports.successfulHires')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">18</span>
                    <Badge variant="outline" className="text-xs text-secondary">+12%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('hr.reports.goalAchievement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{t('hr.reports.monthlyHiringGoal')}</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{t('hr.reports.candidateQuality')}</span>
                    <span className="text-sm font-medium">88%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{t('hr.reports.clientSatisfaction')}</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-info h-2 rounded-full" style={{ width: "92%" }}></div>
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

export default HRReports;