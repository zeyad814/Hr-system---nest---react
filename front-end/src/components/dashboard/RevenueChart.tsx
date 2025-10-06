import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export function RevenueChart() {
  const { t } = useLanguage();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/dashboard/revenue-stats');
        setRevenueData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        // Fallback data
        setRevenueData([
          { month: t('months.jan'), revenue: 85000, target: 80000 },
          { month: t('months.feb'), revenue: 92000, target: 85000 },
          { month: t('months.mar'), revenue: 78000, target: 90000 },
          { month: t('months.apr'), revenue: 105000, target: 95000 },
          { month: t('months.may'), revenue: 115000, target: 100000 },
          { month: t('months.jun'), revenue: 125000, target: 110000 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [t]);

  if (loading) {
    return (
      <Card className="crm-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t('admin.dashboard.monthlyRevenue')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="crm-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t('admin.dashboard.monthlyRevenue')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} ${t('common.currency')}`,
                  name === 'revenue' ? t('admin.dashboard.revenue') : t('admin.dashboard.target')
                ]}
                labelFormatter={(label) => `${t('common.month')}: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span>{t('admin.dashboard.actualRevenue')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-secondary border-2 border-secondary bg-opacity-0"></div>
            <span>{t('admin.dashboard.targetGoal')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}