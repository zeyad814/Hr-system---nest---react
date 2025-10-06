import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, UserPlus, Briefcase, FileCheck, DollarSign, Users, Building2 } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"

interface Activity {
  id: string;
  type: 'user' | 'client' | 'job' | 'contract' | 'application';
  activity: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

const getTimeAgo = (date: string) => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'الآن';
  } else if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} دقيقة`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `منذ ${hours} ساعة`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `منذ ${days} يوم`;
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user':
      return Users;
    case 'client':
      return Building2;
    case 'job':
      return Briefcase;
    case 'contract':
      return FileCheck;
    case 'application':
      return UserPlus;
    default:
      return Clock;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'user':
      return 'bg-blue-500';
    case 'client':
      return 'bg-green-500';
    case 'job':
      return 'bg-purple-500';
    case 'contract':
      return 'bg-primary';
    case 'application':
      return 'bg-orange-500';
    default:
      return 'bg-accent';
  }
};

const getActivityAvatar = (activity: Activity) => {
  if (activity.user?.name) {
    return activity.user.name.charAt(0).toUpperCase();
  }
  return activity.activity.charAt(0).toUpperCase();
};

export function RecentActivities() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fallback data
        setActivities([
        
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [t]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('admin.dashboard.recentActivities')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('admin.dashboard.recentActivities')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            // التأكد من وجود البيانات المطلوبة
            if (!activity || !activity.activity) {
              return null;
            }
            
            const Icon = getActivityIcon(activity.type);
            const color = getActivityColor(activity.type);
            const avatar = getActivityAvatar(activity);
            const timeAgo = getTimeAgo(activity.timestamp);
            
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className={`h-10 w-10 ${color}`}>
                  <AvatarFallback className="text-white font-semibold">
                    {avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">{activity.activity}</h4>
                  </div>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {t('admin.dashboard.newActivity')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}