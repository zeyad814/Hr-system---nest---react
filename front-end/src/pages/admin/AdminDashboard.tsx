import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  UserPlus, 
  Plus,
  Calendar,
  Settings,
  Shield,
  Zap,
  MessageSquare,
  Phone,
  Database,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { JobStatusChart } from '@/components/dashboard/JobStatusChart';
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivities } from '@/components/dashboard/RecentActivities'
import { useLanguage } from '@/contexts/LanguageContext';
import { WelcomeHero } from '@/components/dashboard/WelcomeHero';
import ActiveJobs from '@/components/dashboard/ActiveJobs';
import TopCandidates from '@/components/dashboard/TopCandidates';
import IntegrationsManager from '@/components/admin/IntegrationsManager';
import PermissionsManager from '@/components/admin/PermissionsManager';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminDashboard as AdminDashboardWidget } from "@/components/dashboard/AdminDashboard";
import { useSystemSettings } from '@/hooks/useSystemSettings';


interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: string;
}

interface SystemPermission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'clients' | 'jobs' | 'contracts' | 'reports' | 'system';
  icon: React.ReactNode;
  enabled: boolean;
  level: 'read' | 'write' | 'delete' | 'admin';
  critical: boolean;
}

const AdminDashboardPage = () => {
  const { t } = useLanguage();
  const { settings } = useSystemSettings();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalJobs: 0,
    totalContracts: 0,
    totalApplicants: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    visibility: {
      showTotalUsers: true,
      showTotalClients: true,
      showTotalJobs: true,
      showTotalContracts: true,
      showTotalApplicants: true,
      showMonthlyRevenue: true,
    }
  });
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'zapier',
      name: 'Zapier',
      description: t('admin.dashboard.zapierDesc'),
      icon: React.createElement(Zap, { className: "h-6 w-6" }),
      enabled: false,
      status: 'disconnected',
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/12345/abcdef'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: t('admin.dashboard.whatsappDesc'),
      icon: React.createElement(MessageSquare, { className: "h-6 w-6" }),
      enabled: true,
      status: 'connected',
      apiKey: 'wa_12345',
      lastSync: new Date().toISOString()
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: t('admin.dashboard.twilioDesc'),
      icon: React.createElement(Phone, { className: "h-6 w-6" }),
      enabled: true,
      status: 'error',
      apiKey: 'tw_67890'
    },
    {
      id: 'workable',
      name: 'Workable',
      description: t('admin.dashboard.workableDesc'),
      icon: React.createElement(UserCheck, { className: "h-6 w-6" }),
      enabled: false,
      status: 'disconnected'
    },
    {
      id: 'api',
      name: 'REST API',
      description: t('admin.dashboard.apiDesc'),
      icon: React.createElement(Database, { className: "h-6 w-6" }),
      enabled: true,
      status: 'connected',
      apiKey: 'api_key_12345'
    }
  ]);
  const [permissions, setPermissions] = useState<SystemPermission[]>([
    {
      id: 'users_create',
      name: t('admin.dashboard.permissions.usersCreate'),
      description: t('admin.dashboard.permissions.usersCreateDesc'),
      category: 'users',
      icon: React.createElement(UserPlus, { className: "h-5 w-5" }),
      enabled: true,
      level: 'write',
      critical: false
    },
    {
      id: 'users_delete',
      name: t('admin.dashboard.permissions.usersDelete'),
      description: t('admin.dashboard.permissions.usersDeleteDesc'),
      category: 'users',
      icon: React.createElement(Users, { className: "h-5 w-5" }),
      enabled: false,
      level: 'delete',
      critical: true
    },
    {
      id: 'clients_manage',
      name: t('admin.dashboard.permissions.clientsManage'),
      description: t('admin.dashboard.permissions.clientsManageDesc'),
      category: 'clients',
      icon: React.createElement(Briefcase, { className: "h-5 w-5" }),
      enabled: true,
      level: 'admin',
      critical: false
    },
    {
      id: 'contracts_manage',
      name: t('admin.dashboard.permissions.contractsManage'),
      description: t('admin.dashboard.permissions.contractsManageDesc'),
      category: 'contracts',
      icon: React.createElement(FileText, { className: "h-5 w-5" }),
      enabled: true,
      level: 'admin',
      critical: false
    },
    {
      id: 'system_settings',
      name: t('admin.dashboard.permissions.systemSettings'),
      description: t('admin.dashboard.permissions.systemSettingsDesc'),
      category: 'system',
      icon: React.createElement(Settings, { className: "h-5 w-5" }),
      enabled: true,
      level: 'admin',
      critical: true
    },
    {
      id: 'reports_access',
      name: t('admin.dashboard.permissions.reportsAccess'),
      description: t('admin.dashboard.permissions.reportsAccessDesc'),
      category: 'reports',
      icon: React.createElement(BarChart3, { className: "h-5 w-5" }),
      enabled: true,
      level: 'read',
      critical: false
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use fallback data in case of error
        setDashboardData({
          totalUsers: 156,
          totalClients: 89,
          totalJobs: 234,
          totalContracts: 67,
          totalApplicants: 1205,
          monthlyRevenue: 125000,
          revenueGrowth: 12.5,
          visibility: {
            showTotalUsers: true,
            showTotalClients: true,
            showTotalJobs: true,
            showTotalContracts: true,
            showTotalApplicants: true,
            showMonthlyRevenue: true,
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-client':
        navigate('/admin/clients?action=add');
        break;
      case 'create-job':
        navigate('/admin/jobs?action=create');
        break;
      case 'schedule-meeting':
        navigate('/admin/calendar?action=schedule');
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

  const handleIntegrationToggle = (id: string, enabled: boolean) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, enabled, status: enabled ? 'connected' : 'disconnected' }
          : integration
      )
    );
  };

  const handleUpdateApiKey = (id: string, apiKey: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, apiKey, status: 'connected' }
          : integration
      )
    );
  };

  const handlePermissionToggle = (id: string, enabled: boolean) => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.id === id 
          ? { ...permission, enabled }
          : permission
      )
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              <span className="break-words">{t('admin.dashboard.title')}</span>
            </h1>

            <div className="flex items-center gap-2 mt-2">


            </div>
          </div>

        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('admin.dashboard.dashboardTab')}</span>
              <span className="sm:hidden">لوحة</span>
            </TabsTrigger>
            <TabsTrigger value="active-jobs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('admin.dashboard.activeJobsTab')}</span>
              <span className="sm:hidden">وظائف</span>
            </TabsTrigger>

          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {dashboardData.visibility?.showTotalUsers !== false && (
                <StatCard
                  title={t('admin.dashboard.stats.totalUsers')}
                  value={dashboardData.totalUsers ?? 0}
                  icon={Users}
                  change="+12%"
                  changeType="positive"
                />
              )}
              {dashboardData.visibility?.showTotalClients !== false && (
                <StatCard
                  title={t('admin.dashboard.stats.totalClients')}
                  value={dashboardData.totalClients ?? 0}
                  icon={Briefcase}
                  change="+8%"
                  changeType="positive"
                />
              )}
              {dashboardData.visibility?.showTotalJobs !== false && (
                <StatCard
                  title={t('admin.dashboard.stats.activeJobs')}
                  value={dashboardData.totalJobs ?? 0}
                  icon={UserCheck}
                  change="+15%"
                  changeType="positive"
                />
              )}
              {dashboardData.visibility?.showTotalContracts !== false && (
                <StatCard
                  title={t('admin.dashboard.stats.signedContracts')}
                  value={dashboardData.totalContracts ?? 0}
                  icon={FileText}
                  change="+5%"
                  changeType="positive"
                />
              )}
              {dashboardData.visibility?.showTotalApplicants !== false && (
                <StatCard
                  title={t('admin.dashboard.stats.totalApplicants')}
                  value={dashboardData.totalApplicants ?? 0}
                  icon={TrendingUp}
                  change="+22%"
                  changeType="positive"
                />
              )}
            </div>

            {/* Charts and Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <RevenueChart />
              <JobStatusChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="lg:col-span-2">
                <RecentActivities />
              </div>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {t('admin.dashboard.quickActions')}
                  </CardTitle>
                  <CardDescription>
                    {t('admin.dashboard.quickActionsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction('manage-users')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {t('admin.dashboard.manageUsers')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction('add-client')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.dashboard.addClient')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction('create-job')}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    {t('admin.dashboard.createJob')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction('view-reports')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t('admin.dashboard.viewReports')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleQuickAction('system-settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('admin.dashboard.systemSettings')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="active-jobs" className="space-y-6">
            <ActiveJobs maxJobs={20} showClientFilter={true} />
          </TabsContent>

          <TabsContent value="top-candidates" className="space-y-6">
            <TopCandidates maxCandidates={15} showJobFilter={true} />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsManager 
              integrations={integrations}
              onToggleIntegration={handleIntegrationToggle}
              onUpdateApiKey={handleUpdateApiKey}
            />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsManager 
              permissions={permissions}
              onTogglePermission={handlePermissionToggle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;