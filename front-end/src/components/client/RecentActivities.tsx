import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '../../contexts/LanguageContext';

interface Activity {
  id: string;
  type: 'application' | 'contract';
  description: string;
  details?: string;
  timestamp: string;
  applicantName?: string;
  jobTitle?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
  loading?: boolean;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, loading = false }) => {
  const { t } = useLanguage();
  const formatActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'application':
        return `${t('activities.applied')} ${activity.applicantName || t('activities.candidate')} ${t('activities.forJob')} ${activity.jobTitle || t('activities.unspecified')}`;
      case 'contract':
        return `${t('activities.contractSigned')}: ${activity.description}`;
      default:
        return activity.description || t('activities.unspecifiedActivity');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return t('activities.lessThanHour');
      } else if (diffInHours < 24) {
        return `${t('activities.since')} ${diffInHours} ${t('activities.hours')}`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${t('activities.since')} ${diffInDays} ${t('activities.days')}`;
      }
    } catch {
      return t('activities.unspecified');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-blue-500';
      case 'contract':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="crm-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t('activities.recentActivities')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start gap-4 p-3 border border-border rounded-lg">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={activity.id || index} className="flex items-start gap-4 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${getActivityIcon(activity.type)}`}></div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">
                    {formatActivityDescription(activity)}
                  </h4>
                  {activity.details && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.details}
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('activities.noRecentActivities')}</p>
              <p className="text-xs mt-1">{t('activities.updatesWillAppear')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;