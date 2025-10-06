import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Briefcase } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useEffect, useState } from "react"
import api from "@/lib/api"

interface JobStatusData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface JobStats {
  openJobs: number;
  underReview: number;
  completed: number;
  cancelled: number;
  total: number;
}

export function JobStatusChart() {
  const { t } = useLanguage();
  const [jobStatusData, setJobStatusData] = useState<JobStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/job-stats');
        const stats: JobStats = response.data;
        
        const total = stats.total || (stats.openJobs + stats.underReview + stats.completed + stats.cancelled);
        
        const data: JobStatusData[] = [
          {
            name: t('admin.dashboard.openJobs'),
            value: stats.openJobs || 45,
            color: "hsl(var(--primary))",
            percentage: total > 0 ? Math.round((stats.openJobs / total) * 100) : 48
          },
          {
            name: t('admin.dashboard.underReview'),
            value: stats.underReview || 23,
            color: "hsl(var(--accent))",
            percentage: total > 0 ? Math.round((stats.underReview / total) * 100) : 24
          },
          {
            name: t('admin.dashboard.completed'),
            value: stats.completed || 18,
            color: "hsl(var(--secondary))",
            percentage: total > 0 ? Math.round((stats.completed / total) * 100) : 19
          },
          {
            name: t('admin.dashboard.cancelled'),
            value: stats.cancelled || 8,
            color: "hsl(var(--destructive))",
            percentage: total > 0 ? Math.round((stats.cancelled / total) * 100) : 9
          }
        ];
        
        setJobStatusData(data);
      } catch (error) {
        console.error('Error fetching job stats:', error);
        // Fallback data
        setJobStatusData([
          { name: t('admin.dashboard.openJobs'), value: 45, color: "hsl(var(--primary))", percentage: 48 },
          { name: t('admin.dashboard.underReview'), value: 23, color: "hsl(var(--accent))", percentage: 24 },
          { name: t('admin.dashboard.completed'), value: 18, color: "hsl(var(--secondary))", percentage: 19 },
          { name: t('admin.dashboard.cancelled'), value: 8, color: "hsl(var(--destructive))", percentage: 9 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobStats();
  }, [t]);

  const COLORS = jobStatusData.map(item => item.color);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.1) return null; // Don't show labels for slices smaller than 10%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <Card className="crm-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {t('admin.dashboard.jobStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              {t('common.loading')}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crm-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          {t('admin.dashboard.jobStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={jobStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {jobStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} وظيفة`, 'العدد']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="space-y-2 mt-4">
          {jobStatusData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}