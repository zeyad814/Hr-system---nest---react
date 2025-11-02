import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OverallPerformanceReport() {
  const { t, language } = useLanguage();
  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('admin.reports.overallPerformance')}</h1>
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.reports.overallPerformanceDesc')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              {language === 'ar' ? 'تقرير الأداء العام سيعرض هنا قريبًا.' : 'Overall performance report will appear here soon.'}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
