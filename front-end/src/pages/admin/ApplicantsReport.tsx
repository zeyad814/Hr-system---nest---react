import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicantsReport() {
  const { t, language } = useLanguage();
  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t('admin.reports.applicantsReport')}</h1>
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.reports.applicantsReportDesc')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              {language === 'ar' ? 'تقرير المتقدمين سيعرض هنا قريبًا.' : 'Applicants report will appear here soon.'}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

