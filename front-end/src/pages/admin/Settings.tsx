import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Settings, 
  Save, 
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Phone,
  Key,
  Users,
  Palette,
  Video,
  CheckCircle,
  XCircle
} from "lucide-react";

interface AgoraSettings {
  appId: string;
  appCertificate: string;
  tokenExpiration: number;
  maxParticipants: number;
  recordingEnabled: boolean;
  screenSharingEnabled: boolean;
}

interface SystemSettings {
  companyName: string;
  timezone: string;
  description: string;
  phone: string;
  email: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  browserNotifications: boolean;
  dailyReports: boolean;
  twoFactorAuth: boolean;
  passwordExpiration: boolean;
  minPasswordLength: number;
  maxLoginAttempts: number;
}

const AdminSettings = () => {
  const { t } = useLanguage();
  const [agoraSettings, setAgoraSettings] = useState<AgoraSettings>({
    appId: '',
    appCertificate: '',
    tokenExpiration: 3600,
    maxParticipants: 10,
    recordingEnabled: true,
    screenSharingEnabled: true
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: t('admin.settings.defaultCompanyName'),
    timezone: 'Asia/Riyadh',
    description: t('admin.settings.defaultDescription'),
    phone: '+966 11 234 5678',
    email: 'info@hrcrm.com',
    emailNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
    dailyReports: true,
    twoFactorAuth: false,
    passwordExpiration: true,
    minPasswordLength: 8,
    maxLoginAttempts: 3
  });

  const [agoraConnectionStatus, setAgoraConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      
      if (data.agora) {
        setAgoraSettings({
          appId: data.agora.appId || '',
          appCertificate: data.agora.appCertificate || '',
          tokenExpiration: data.agora.tokenExpiration || 3600,
          maxParticipants: data.agora.maxParticipants || 10,
          recordingEnabled: data.agora.recordingEnabled || false,
          screenSharingEnabled: data.agora.screenSharingEnabled || true
        });
      }
      
      if (data.system) {
        setSystemSettings({
          companyName: data.system.companyName || t('admin.settings.defaultCompanyName'),
          timezone: data.system.timezone || 'Asia/Riyadh',
          description: data.system.description || t('admin.settings.defaultDescription'),
          phone: data.system.phone || '+966 11 234 5678',
          email: data.system.email || 'info@hrcrm.com',
          emailNotifications: data.system.emailNotifications !== undefined ? data.system.emailNotifications : true,
          smsNotifications: data.system.smsNotifications !== undefined ? data.system.smsNotifications : false,
          browserNotifications: data.system.browserNotifications !== undefined ? data.system.browserNotifications : true,
          dailyReports: data.system.dailyReports !== undefined ? data.system.dailyReports : true,
          twoFactorAuth: data.system.twoFactorAuth !== undefined ? data.system.twoFactorAuth : false,
          passwordExpiration: data.system.passwordExpiration !== undefined ? data.system.passwordExpiration : true,
          minPasswordLength: data.system.minPasswordLength || 8,
          maxLoginAttempts: data.system.maxLoginAttempts || 3
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error(t('admin.settings.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const testAgoraConnection = async () => {
    if (!agoraSettings.appId || !agoraSettings.appCertificate) {
      toast.error(t('admin.settings.agoraCredentialsRequired'));
      return;
    }

    setAgoraConnectionStatus('testing');
    try {
      const response = await fetch('/api/admin/agora/test-connection', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: agoraSettings.appId,
          appCertificate: agoraSettings.appCertificate
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAgoraConnectionStatus('connected');
        toast.success(t('admin.settings.agoraConnected'));
      } else {
        const errorData = await response.json();
        setAgoraConnectionStatus('disconnected');
        toast.error(errorData.message || t('admin.settings.agoraConnectionFailed'));
      }
    } catch (error) {
      console.error('Agora connection test failed:', error);
      setAgoraConnectionStatus('disconnected');
      toast.error(t('admin.settings.connectionTestError'));
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: systemSettings,
          agora: agoraSettings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }

      const data = await response.json();
      toast.success(t('admin.settings.settingsSaved'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(t('admin.settings.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout userRole="admin" userName="محمد أحمد">
      <div className="space-y-6">
        {/* Page Header */}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
           
         
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.settings.systemStatus')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('admin.settings.serverStatus')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm text-secondary">{t('admin.settings.connected')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('admin.settings.database')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm text-secondary">{t('admin.settings.connected')}</span>
                  </div>
                </div>

              

              </CardContent>
            </Card>

            {/* Version Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.settings.systemInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('admin.settings.systemVersion')}:</span>
                  <span className="font-medium">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('admin.settings.lastUpdate')}:</span>
                  <span className="font-medium">{t('admin.settings.lastUpdateDate')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('admin.settings.activeUsers')}:</span>
                  <span className="font-medium">24</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminSettings;