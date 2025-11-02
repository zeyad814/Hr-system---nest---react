import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";

type JobStatusPoint = { status: string; count: number };

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function JobStatusReport() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<JobStatusPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/dashboard/job-status-chart");
        const raw: Array<{ status: string; count: number }> = res.data ?? [];
        setData(raw.map(r => ({ status: r.status, count: Number(r.count || 0) })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const downloadCSV = (filename: string, headers: string[], rows: Array<(string | number)[]>) => {
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const rows = data.map(d => [d.status, d.count]);
    downloadCSV('job-status.csv', [language === 'ar' ? 'الحالة' : 'Status', language === 'ar' ? 'العدد' : 'Count'], rows);
  };

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">{t('admin.reports.jobStatusDistribution')}</h1>
          <div>
            <Button onClick={handleExportCSV} variant="outline" size="sm">{language === 'ar' ? 'تنزيل CSV' : 'Export CSV'}</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.reports.jobStatusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">{t('common.loading')}...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90}
                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'تفاصيل الحالات' : 'Status Details'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="py-2">{language === 'ar' ? 'العدد' : 'Count'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{row.status}</td>
                      <td className="py-2">{row.count}</td>
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
}
