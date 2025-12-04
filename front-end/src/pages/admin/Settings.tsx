import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
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
  XCircle,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
  BarChart3
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
  companyLogo?: string;
  companyName?: string;
  showTotalUsers: boolean;
  showTotalClients: boolean;
  showTotalJobs: boolean;
  showTotalContracts: boolean;
  showTotalApplicants: boolean;
  showMonthlyRevenue: boolean;
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
    companyLogo: undefined,
    companyName: undefined,
    showTotalUsers: true,
    showTotalClients: true,
    showTotalJobs: true,
    showTotalContracts: true,
    showTotalApplicants: true,
    showMonthlyRevenue: true,
  });

  const [agoraConnectionStatus, setAgoraConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/settings');
      
      if (response.data.system) {
        const system = response.data.system;
        setSystemSettings({
          companyLogo: system.companyLogo,
          companyName: system.companyName,
          showTotalUsers: system.showTotalUsers !== undefined ? system.showTotalUsers : true,
          showTotalClients: system.showTotalClients !== undefined ? system.showTotalClients : true,
          showTotalJobs: system.showTotalJobs !== undefined ? system.showTotalJobs : true,
          showTotalContracts: system.showTotalContracts !== undefined ? system.showTotalContracts : true,
          showTotalApplicants: system.showTotalApplicants !== undefined ? system.showTotalApplicants : true,
          showMonthlyRevenue: system.showMonthlyRevenue !== undefined ? system.showMonthlyRevenue : true,
        });
        
        if (system.companyLogo) {
          setLogoPreview(system.companyLogo);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('فشل تحميل الإعدادات');
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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        setLogoPreview(base64String);
        
        try {
          await api.post('/admin/settings/logo', { logo: base64String });
          setSystemSettings(prev => ({ ...prev, companyLogo: base64String }));
          toast.success('تم رفع الشعار بنجاح');
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast.error('فشل رفع الشعار');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing logo:', error);
      toast.error('فشل معالجة الصورة');
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await api.put('/admin/settings', systemSettings);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout userRole="admin" userName="محمد أحمد">
      <div className="space-y-6" dir="rtl">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الإعدادات</h1>
            <p className="text-muted-foreground mt-1">إدارة إعدادات النظام والشعار</p>
          </div>
          <Button onClick={saveSettings} disabled={isLoading}>
            <Save className="ml-2 h-4 w-4" />
            حفظ الإعدادات
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  شعار الشركة
                </CardTitle>
                <CardDescription>
                  قم برفع شعار الشركة الذي سيظهر في جميع صفحات النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <div className="relative">
                        <img 
                          src={logoPreview} 
                          alt="Company Logo" 
                          className="h-24 w-24 object-contain border rounded-lg p-2 bg-white"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="ml-2 h-4 w-4" />
                      {logoPreview ? 'تغيير الشعار' : 'رفع شعار'}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      الصيغ المدعومة: PNG, JPG, SVG. الحد الأقصى: 2 ميجابايت
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Statistics Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  إعدادات عرض الأرقام في لوحة التحكم
                </CardTitle>
                <CardDescription>
                  اختر الأرقام التي تريد إظهارها في لوحة التحكم الرئيسية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="showUsers">إظهار إجمالي المستخدمين</Label>
                    </div>
                    <Switch
                      id="showUsers"
                      checked={systemSettings.showTotalUsers}
                      onCheckedChange={(checked) =>
                        setSystemSettings(prev => ({ ...prev, showTotalUsers: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="showClients">إظهار إجمالي العملاء</Label>
                    </div>
                    <Switch
                      id="showClients"
                      checked={systemSettings.showTotalClients}
                      onCheckedChange={(checked) =>
                        setSystemSettings(prev => ({ ...prev, showTotalClients: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="showJobs">إظهار إجمالي الوظائف</Label>
                    </div>
                    <Switch
                      id="showJobs"
                      checked={systemSettings.showTotalJobs}
                      onCheckedChange={(checked) =>
                        setSystemSettings(prev => ({ ...prev, showTotalJobs: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="showContracts">إظهار إجمالي العقود</Label>
                    </div>
                    <Switch
                      id="showContracts"
                      checked={systemSettings.showTotalContracts}
                      onCheckedChange={(checked) =>
                        setSystemSettings(prev => ({ ...prev, showTotalContracts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="showApplicants">إظهار إجمالي المتقدمين</Label>
                    </div>
                    <Switch
                      id="showApplicants"
                      checked={systemSettings.showTotalApplicants}
                      onCheckedChange={(checked) =>
                        setSystemSettings(prev => ({ ...prev, showTotalApplicants: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="showRevenue">إظهار الإيرادات الشهرية</Label>
                    </div>
                    <Switch
                      id="showRevenue"
                      checked={systemSettings.showMonthlyRevenue}
                      onCheckedChange={(checked) =>
                        setSystemSettings(prev => ({ ...prev, showMonthlyRevenue: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.settings.systemStatus')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('admin.settings.serverStatus')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-secondary">{t('admin.settings.connected')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('admin.settings.database')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-secondary">{t('admin.settings.connected')}</span>
                  </div>
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