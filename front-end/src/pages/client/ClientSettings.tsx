import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Globe, Palette, Shield, Building } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

const ClientSettings = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    candidateUpdates: true,
    jobPostingAlerts: true,
    contractUpdates: true,
    
    // Privacy Settings
    profileVisibility: "private",
    dataSharing: false,
    companyInfoPublic: false,
    
    // Display Settings
    language: "ar",
    theme: "light",
    timezone: "Asia/Riyadh",
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: "60",
    
    // Company Settings
    autoApproveContracts: false,
    requireApprovalForJobs: true
  });

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Settings saved:", settings);
  };

  return (
    <MainLayout userRole="client" userName="العميل">
      <div className="space-y-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الإعدادات</h1>
            <p className="text-gray-600">إدارة تفضيلاتك وإعدادات الحساب</p>
          </div>

          <div className="space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <CardTitle>إعدادات الإشعارات</CardTitle>
                </div>
                <CardDescription>
                  تحكم في الإشعارات التي تريد تلقيها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-gray-500">تلقي الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">الإشعارات الفورية</Label>
                    <p className="text-sm text-gray-500">تلقي الإشعارات الفورية في المتصفح</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="candidate-updates">تحديثات المرشحين</Label>
                    <p className="text-sm text-gray-500">إشعارات عند تقديم مرشحين جدد</p>
                  </div>
                  <Switch
                    id="candidate-updates"
                    checked={settings.candidateUpdates}
                    onCheckedChange={(checked) => setSettings({...settings, candidateUpdates: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="job-posting-alerts">تنبيهات نشر الوظائف</Label>
                    <p className="text-sm text-gray-500">تأكيدات عند نشر أو تحديث الوظائف</p>
                  </div>
                  <Switch
                    id="job-posting-alerts"
                    checked={settings.jobPostingAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, jobPostingAlerts: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="contract-updates">تحديثات العقود</Label>
                    <p className="text-sm text-gray-500">إشعارات عند تحديث حالة العقود</p>
                  </div>
                  <Switch
                    id="contract-updates"
                    checked={settings.contractUpdates}
                    onCheckedChange={(checked) => setSettings({...settings, contractUpdates: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Company Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  <CardTitle>إعدادات الشركة</CardTitle>
                </div>
                <CardDescription>
                  تخصيص إعدادات الشركة والعمليات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-approve-contracts">الموافقة التلقائية على العقود</Label>
                    <p className="text-sm text-gray-500">الموافقة تلقائياً على العقود المطابقة للشروط</p>
                  </div>
                  <Switch
                    id="auto-approve-contracts"
                    checked={settings.autoApproveContracts}
                    onCheckedChange={(checked) => setSettings({...settings, autoApproveContracts: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-approval-jobs">تتطلب الموافقة على الوظائف</Label>
                    <p className="text-sm text-gray-500">مراجعة الوظائف قبل النشر</p>
                  </div>
                  <Switch
                    id="require-approval-jobs"
                    checked={settings.requireApprovalForJobs}
                    onCheckedChange={(checked) => setSettings({...settings, requireApprovalForJobs: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <CardTitle>إعدادات الخصوصية</CardTitle>
                </div>
                <CardDescription>
                  تحكم في خصوصية بياناتك ومعلومات الشركة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">رؤية الملف الشخصي</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) => setSettings({...settings, profileVisibility: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">عام</SelectItem>
                      <SelectItem value="partners">الشركاء فقط</SelectItem>
                      <SelectItem value="private">خاص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="company-info-public">معلومات الشركة عامة</Label>
                    <p className="text-sm text-gray-500">إظهار معلومات الشركة للعامة</p>
                  </div>
                  <Switch
                    id="company-info-public"
                    checked={settings.companyInfoPublic}
                    onCheckedChange={(checked) => setSettings({...settings, companyInfoPublic: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-sharing">مشاركة البيانات</Label>
                    <p className="text-sm text-gray-500">السماح بمشاركة البيانات لتحسين الخدمة</p>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) => setSettings({...settings, dataSharing: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  <CardTitle>إعدادات العرض</CardTitle>
                </div>
                <CardDescription>
                  تخصيص مظهر وعرض التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">اللغة</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings({...settings, language: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">المظهر</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => setSettings({...settings, theme: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">فاتح</SelectItem>
                        <SelectItem value="dark">داكن</SelectItem>
                        <SelectItem value="system">النظام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({...settings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Asia/Kuwait">الكويت (GMT+3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  <CardTitle>إعدادات الأمان</CardTitle>
                </div>
                <CardDescription>
                  تعزيز أمان حسابك وبيانات الشركة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">المصادقة الثنائية</Label>
                    <p className="text-sm text-gray-500">إضافة طبقة حماية إضافية لحسابك</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">انتهاء الجلسة (بالدقائق)</Label>
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) => setSettings({...settings, sessionTimeout: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 دقيقة</SelectItem>
                      <SelectItem value="60">60 دقيقة</SelectItem>
                      <SelectItem value="120">120 دقيقة</SelectItem>
                      <SelectItem value="240">240 دقيقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} className="px-8">
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientSettings;