import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Plus,
  Users,
  FileText,
  Settings,
  UserPlus,
  Building2,
  Briefcase,
  BarChart3
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  color?: string;
}

interface QuickActionsProps {
  onCreateJob?: () => void;
  onAddUser?: () => void;
  onAddClient?: () => void;
  onViewReports?: () => void;
  onSystemSettings?: () => void;
  onManageUsers?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateJob,
  onAddUser,
  onAddClient,
  onViewReports,
  onSystemSettings,
  onManageUsers
}) => {
  const { t } = useLanguage();

  const quickActions: QuickAction[] = [
    {
      id: 'create-job',
      title: t('admin.dashboard.createJob'),
      description: t('admin.dashboard.createJobDesc'),
      icon: Plus,
      onClick: onCreateJob || (() => {}),
      variant: 'default',
      color: 'bg-primary'
    },
    {
      id: 'add-user',
      title: t('admin.dashboard.addUser'),
      description: t('admin.dashboard.addUserDesc'),
      icon: UserPlus,
      onClick: onAddUser || (() => {}),
      variant: 'outline',
      color: 'bg-blue-500'
    },
    {
      id: 'add-client',
      title: t('admin.dashboard.addClient'),
      description: t('admin.dashboard.addClientDesc'),
      icon: Building2,
      onClick: onAddClient || (() => {}),
      variant: 'outline',
      color: 'bg-green-500'
    },
    {
      id: 'view-reports',
      title: t('admin.dashboard.viewReports'),
      description: t('admin.dashboard.viewReportsDesc'),
      icon: BarChart3,
      onClick: onViewReports || (() => {}),
      variant: 'outline',
      color: 'bg-purple-500'
    },
    {
      id: 'manage-users',
      title: t('admin.dashboard.manageUsers'),
      description: t('admin.dashboard.manageUsersDesc'),
      icon: Users,
      onClick: onManageUsers || (() => {}),
      variant: 'outline',
      color: 'bg-orange-500'
    },
    {
      id: 'system-settings',
      title: t('admin.dashboard.systemSettings'),
      description: t('admin.dashboard.systemSettingsDesc'),
      icon: Settings,
      onClick: onSystemSettings || (() => {}),
      variant: 'secondary',
      color: 'bg-gray-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          {t('admin.dashboard.quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="group p-4 rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={action.onClick}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${action.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                    <Icon className={`h-5 w-5 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;