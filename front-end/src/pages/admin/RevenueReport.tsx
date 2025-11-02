import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";

type RevenuePoint = { label: string; revenue: number };

type RawRevenue = { month?: string; revenue?: number };

const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const ENGLISH_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ENG_MONTH_TO_NUMBER: Record<string, number> = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };

export default function RevenueReport() {
  const { t, language } = useLanguage();
  const [raw, setRaw] = useState<RawRevenue[]>([]);
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [half, setHalf] = useState<'full'|'h1'|'h2'>('full');

  const currencyFormatter = useMemo(() => new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'SAR' }), [language]);
  const formatSAR = (value: number) => currencyFormatter.format(Number(value || 0));

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
    const rows = data.map((d, idx) => [d.label, data[idx].revenue]);
    downloadCSV(`revenue-${year}-${half}.csv`, [language === 'ar' ? 'الشهر' : 'Month', language === 'ar' ? 'الإيراد (SAR)' : 'Revenue (SAR)'], rows);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/dashboard/revenue-chart?months=24");
        setRaw(res.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const monthRevenue = new Map<number, number>();
    for (const it of raw) {
      const [abbr, yearStr] = String(it?.month ?? '').split(' ');
      const m = ENG_MONTH_TO_NUMBER[abbr as keyof typeof ENG_MONTH_TO_NUMBER];
      const y = Number(yearStr);
      if (m && y === year) monthRevenue.set(m, Number(it?.revenue ?? 0));
    }
    const months = language === 'ar' ? ARABIC_MONTHS : ENGLISH_MONTHS;
    let start = 1, end = 12;
    if (half === 'h1') { start = 1; end = 6; }
    if (half === 'h2') { start = 7; end = 12; }
    const normalized = Array.from({ length: end - start + 1 }, (_, i) => ({
      label: months[start - 1 + i],
      revenue: monthRevenue.get(start + i) ?? 0,
    }));
    setData(normalized);
  }, [raw, year, half, language]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const it of raw) {
      const parts = String(it?.month ?? '').split(' ');
      const y = Number(parts[1]);
      if (!isNaN(y)) years.add(y);
    }
    const arr = Array.from(years).sort((a,b) => b - a);
    if (!arr.length) arr.push(new Date().getFullYear());
    return arr;
  }, [raw]);

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">{t('admin.reports.revenueReport')}</h1>
          <div className="flex items-center gap-2">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border rounded px-2 py-1 text-sm bg-background">
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select value={half} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHalf(e.target.value as 'full'|'h1'|'h2')} className="border rounded px-2 py-1 text-sm bg-background">
              <option value="full">{language === 'ar' ? 'السنة كاملة' : 'Full Year'}</option>
              <option value="h1">{language === 'ar' ? 'النصف الأول' : 'First Half'}</option>
              <option value="h2">{language === 'ar' ? 'النصف الثاني' : 'Second Half'}</option>
            </select>
            <Button onClick={handleExportCSV} variant="outline" size="sm">{language === 'ar' ? 'تنزيل CSV' : 'Export CSV'}</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'الإيرادات حسب الشهر' : 'Revenue by Month'}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">{t('common.loading')}...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ left: 4, right: 4, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v: number) => formatSAR(v)} />
                  <Tooltip formatter={(value: unknown) => [formatSAR(Number(value ?? 0)), language === 'ar' ? 'الإيراد' : 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'تفاصيل الإيرادات الشهرية' : 'Monthly Revenue Details'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">{language === 'ar' ? 'الشهر' : 'Month'}</th>
                    <th className="py-2">{language === 'ar' ? 'الإيراد' : 'Revenue'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{row.label}</td>
                      <td className="py-2">{formatSAR(row.revenue)}</td>
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
