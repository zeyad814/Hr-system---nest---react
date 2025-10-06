import { Users, Briefcase, DollarSign, FileText, TrendingUp, Calendar, Building2, UserCheck, Shield, Settings, Zap, Globe, MessageSquare, Phone, BarChart3, UserCog, Lock, Unlock, Eye, EyeOff } from "lucide-react"
import { StatCard } from "./StatCard"
import { RevenueChart } from "./RevenueChart"
import { JobStatusChart } from "./JobStatusChart"
import { RecentActivities } from "./RecentActivities"
import { WelcomeHero } from "./WelcomeHero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/contexts/LanguageContext"
import api from "@/lib/api"

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalJobs: number;
  totalContracts: number;
  totalApplicants: number;
}

interface Integration {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  description: string;
  icon: any;
  lastSync?: string;
}

interface SystemPermission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'users' | 'clients' | 'jobs' | 'contracts' | 'integrations';
}

export function AdminDashboard() {
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [permissions, setPermissions] = useState<SystemPermission[]>([]);
  const navigate = useNavigate();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-client':
        navigate('/admin/clients');
        break;
      case 'create-job':
        navigate('/admin/jobs');
        break;
      case 'manage-users':
        navigate('/admin/users');
        break;
      case 'view-reports':
        navigate('/admin/reports');
        break;
      case 'system-settings':
        navigate('/admin/settings');
        break;
      default:
        break;
    }
  };

  const handleIntegrationToggle = async (integrationId: string, enabled: boolean) => {
    try {
      await api.post(`/admin/integrations/${integrationId}/toggle`, { enabled });
      setIntegrations(prev => prev.map(int => 
        int.id === integrationId ? { ...int, status: enabled ? 'active' : 'inactive' } : int
      ));
    } catch (error) {
      console.error('Error toggling integration:', error);
    }
  };

  const handlePermissionToggle = async (permissionId: string, enabled: boolean) => {
    try {
      await api.post(`/admin/permissions/${permissionId}/toggle`, { enabled });
      setPermissions(prev => prev.map(perm => 
        perm.id === permissionId ? { ...perm, enabled } : perm
      ));
    } catch (error) {
      console.error('Error toggling permission:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, integrationsResponse, permissionsResponse] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/integrations'),
          api.get('/admin/permissions')
        ]);
        
        setDashboardData(statsResponse.data);
        setIntegrations(integrationsResponse.data || mockIntegrations);
        setPermissions(permissionsResponse.data || mockPermissions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // {t('admin.dashboard.fallbackData')}
        setIntegrations(mockIntegrations);
        setPermissions(mockPermissions);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // بيانات وهمية للتكاملات
  const mockIntegrations: Integration[] = [
    {
      id: 'zapier',
      name: 'Zapier',
      status: 'active',
      description: t('admin.integrations.zapier.description'),
      icon: Zap,
      lastSync: '2024-01-15T10:30:00Z'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      status: 'active',
      description: t('admin.integrations.whatsapp.description'),
      icon: MessageSquare,
      lastSync: '2024-01-15T09:15:00Z'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      status: 'inactive',
      description: t('admin.integrations.twilio.description'),
      icon: Phone,
      lastSync: '2024-01-10T14:20:00Z'
    },
    {
      id: 'workable',
      name: 'Workable ATS',
      status: 'active',
      description: t('admin.integrations.workable.description'),
      icon: Users,
      lastSync: '2024-01-15T08:45:00Z'
    }
  ];

  // بيانات وهمية للصلاحيات
  const mockPermissions: SystemPermission[] = [
    {
      id: 'user_management',
      name: t('admin.permissions.userManagement.name'),
      description: t('admin.permissions.userManagement.description'),
      enabled: true,
      category: 'users'
    },
    {
      id: 'client_management',
      name: t('admin.permissions.clientManagement.name'),
      description: t('admin.permissions.clientManagement.description'),
      enabled: true,
      category: 'clients'
    },
    {
      id: 'job_management',
      name: t('admin.permissions.jobManagement.name'),
      description: t('admin.permissions.jobManagement.description'),
      enabled: true,
      category: 'jobs'
    },
    {
      id: 'contract_management',
      name: t('admin.permissions.contractManagement.name'),
      description: t('admin.permissions.contractManagement.description'),
      enabled: true,
      category: 'contracts'
    },
    {
      id: 'integration_management',
      name: t('admin.permissions.integrationManagement.name'),
      description: t('admin.permissions.integrationManagement.description'),
      enabled: true,
      category: 'integrations'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData ? [
    {
      title: t('admin.dashboard.totalClients'),
      value: dashboardData.totalClients.toString(),
      change: `+${Math.floor(Math.random() * 5 + 1)} ${t('common.thisWeek')}`,
      changeType: "positive" as const,
      icon: Building2,
      gradient: true,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: t('admin.dashboard.availableJobs'),
      value: dashboardData.totalJobs.toString(),
      change: `${Math.floor(Math.random() * 3 + 1)} ${t('admin.dashboard.newJobs')}`,
      changeType: "positive" as const,
      icon: Briefcase,
      gradient: true,
      color: "from-green-500 to-green-600",
    },
    {
      title: t('admin.dashboard.totalContracts'),
      value: dashboardData.totalContracts.toString(),
      change: `+${Math.floor(Math.random() * 2 + 1)} ${t('common.thisMonth')}`,
      changeType: "positive" as const,
      icon: FileText,
      gradient: true,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: t('admin.dashboard.totalUsers'),
      value: dashboardData.totalUsers.toString(),
      change: `${t('common.active')} ${Math.floor(dashboardData.totalUsers * 0.8)} ${t('common.user')}`,
      changeType: "neutral" as const,
      icon: Users,
      gradient: true,
      color: "from-orange-500 to-orange-600",
    },
    {
      title: t('admin.dashboard.jobApplicants'),
      value: dashboardData.totalApplicants.toString(),
      change: `+${Math.floor(Math.random() * 10 + 5)} ${t('common.today')}`,
      changeType: "positive" as const,
      icon: UserCheck,
      gradient: true,
      color: "from-teal-500 to-teal-600",
    },
  ] : []

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Hero */}
      <WelcomeHero userRole="admin" userName={t('admin.dashboard.defaultUserName')} />

      {/* Page Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                👑 {t('admin.dashboard.title')}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t('admin.dashboard.subtitle')}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{t('admin.dashboard.lastUpdate')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>{t('admin.dashboard.adminPermissions')}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="default" className="mb-2">
                <Shield className="h-3 w-3 mr-1" />
                {t('admin.dashboard.adminRole')}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {t('admin.dashboard.fullAccess')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="transform hover:scale-105 transition-all duration-200">
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Charts and Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="transform hover:scale-[1.02] transition-all duration-300">
          <RevenueChart />
        </div>

        {/* Job Status Chart */}
        <div className="transform hover:scale-[1.02] transition-all duration-300">
          <JobStatusChart />
        </div>
      </div>

      {/* Admin Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* System Integrations */}
        <Card className="crm-card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              🔗 {t('admin.dashboard.externalIntegrations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => {
                const IconComponent = integration.icon;
                return (
                  <div key={integration.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${integration.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <IconComponent className={`h-4 w-4 ${integration.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{integration.name}</div>
                        <div className="text-xs text-muted-foreground">{integration.description}</div>
                        {integration.lastSync && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {t('admin.dashboard.lastSync')}: {new Date(integration.lastSync).toLocaleString('ar-SA')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                        {integration.status === 'active' ? t('common.active') : t('common.inactive')}
                      </Badge>
                      <Switch
                        checked={integration.status === 'active'}
                        onCheckedChange={(checked) => handleIntegrationToggle(integration.id, checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Permissions */}
        <Card className="crm-card bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Shield className="h-5 w-5 text-secondary" />
              </div>
              🔐 {t('admin.dashboard.systemPermissions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${permission.enabled ? 'bg-green-100' : 'bg-red-100'}`}>
                      {permission.enabled ? (
                        <Unlock className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{permission.name}</div>
                      <div className="text-xs text-muted-foreground">{permission.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={permission.enabled ? 'default' : 'destructive'}>
                      {permission.enabled ? t('common.enabled') : t('common.disabled')}
                    </Badge>
                    <Switch
                      checked={permission.enabled}
                      onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
        
        {/* Admin Quick Actions - Takes 1 column */}
        <div className="space-y-6">
          <Card className="crm-card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserCog className="h-5 w-5 text-primary" />
                </div>
                ⚡ {t('admin.dashboard.quickActions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  onClick={() => handleQuickAction('manage-users')}
                  className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 cursor-pointer border border-blue-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-blue-800">{t('admin.dashboard.userManagement')}</span>
                  </div>
                  <div className="text-blue-600 group-hover:translate-x-1 transition-transform">←</div>
                </div>
                <div 
                  onClick={() => handleQuickAction('add-client')}
                  className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 cursor-pointer border border-green-200 hover:border-green-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-green-800">{t('admin.dashboard.addClient')}</span>
                  </div>
                  <div className="text-green-600 group-hover:translate-x-1 transition-transform">←</div>
                </div>
                <div 
                  onClick={() => handleQuickAction('create-job')}
                  className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 cursor-pointer border border-purple-200 hover:border-purple-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-purple-800">{t('admin.dashboard.createJob')}</span>
                  </div>
                  <div className="text-purple-600 group-hover:translate-x-1 transition-transform">←</div>
                </div>
                <div 
                  onClick={() => handleQuickAction('view-reports')}
                  className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 cursor-pointer border border-orange-200 hover:border-orange-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-orange-800">{t('admin.dashboard.viewReports')}</span>
                  </div>
                  <div className="text-orange-600 group-hover:translate-x-1 transition-transform">←</div>
                </div>
                <div 
                  onClick={() => handleQuickAction('system-settings')}
                  className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all duration-300 cursor-pointer border border-red-200 hover:border-red-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-red-800">{t('admin.dashboard.systemSettings')}</span>
                  </div>
                  <div className="text-red-600 group-hover:translate-x-1 transition-transform">←</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}