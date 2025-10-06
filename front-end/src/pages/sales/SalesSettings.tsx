import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Globe, Palette, Shield, TrendingUp } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

const SalesSettings = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    leadUpdates: true,
    targetReminders: true,
    dealAlerts: true,
    
    // Privacy Settings
    profileVisibility: "team",
    dataSharing: false,
    
    // Display Settings
    language: "ar",
    theme: "light",
    timezone: "Asia/Riyadh",
    currency: "SAR",
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: "30",
    
    // Sales Settings
    defaultCommission: "5",
    autoFollowUp: true
  });

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Settings saved:", settings);
  };

  return (
    <MainLayout userRole="sales" userName="موظف المبيعات">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">الإعدادات</h1>
            <p className="text-sm sm:text-base text-gray-600">إدارة تفضيلاتك وإعدادات الحساب</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  <CardTitle className="text-base sm:text-lg">إعدادات الإشعارات</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  تحكم في الإشعارات التي تريد تلقيها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="email-notifications" className="text-sm sm:text-base">إشعارات البريد الإلكتروني</Label>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">تلقي الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                    className="self-start sm:self-center"
                  />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="push-notifications" className="text-sm sm:text-base">الإشعارات الفورية</Label>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">تلقي الإشعارات الفورية في المتصفح</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                    className="self-start sm:self-center"
                  />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="lead-updates" className="text-sm sm:text-base">تحديثات العملاء المحتملين</Label>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">إشعارات عند تحديث حالة العملاء</p>
                  </div>
                  <Switch
                    id="lead-updates"
                    checked={settings.leadUpdates}
                    onCheckedChange={(checked) => setSettings({...settings, leadUpdates: checked})}
                    className="self-start sm:self-center"
                  />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="target-reminders" className="text-sm sm:text-base">تذكيرات الأهداف</Label>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">تذكيرات بالأهداف الشهرية والسنوية</p>
                  </div>
                  <Switch
                    id="target-reminders"
                    checked={settings.targetReminders}
                    onCheckedChange={(checked) => setSettings({...settings, targetReminders: checked})}
                    className="self-start sm:self-center"
                  />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="deal-alerts" className="text-sm sm:text-base">تنبيهات الصفقات</Label>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">تنبيهات عند إتمام أو فقدان صفقة</p>
                  </div>
                  <Switch
                    id="deal-alerts"
                    checked={settings.dealAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, dealAlerts: checked})}
                    className="self-start sm:self-center"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sales Settings */}
            <Card>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  <CardTitle className="text-base sm:text-lg">إعدادات المبيعات</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  تخصيص إعدادات المبيعات والعمولات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-commission" className="text-sm sm:text-base">العمولة الافتراضية (%)</Label>
                    <Input
                      id="default-commission"
                      type="number"
                      value={settings.defaultCommission}
                      onChange={(e) => setSettings({...settings, defaultCommission: e.target.value})}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm sm:text-base">العملة</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => setSettings({...settings, currency: value})}
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="EUR">يورو (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="auto-follow-up" className="text-sm sm:text-base">المتابعة التلقائية</Label>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">إرسال رسائل متابعة تلقائية للعملاء</p>
                  </div>
                  <Switch
                    id="auto-follow-up"
                    checked={settings.autoFollowUp}
                    onCheckedChange={(checked) => setSettings({...settings, autoFollowUp: checked})}
                    className="self-start sm:self-center"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <CardTitle className="text-base sm:text-lg">إعدادات الخصوصية</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  تحكم في خصوصية بياناتك ومعلوماتك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility" className="text-sm sm:text-base">رؤية الملف الشخصي</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) => setSettings({...settings, profileVisibility: value})}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">عام</SelectItem>
                      <SelectItem value="team">الفريق فقط</SelectItem>
                      <SelectItem value="private">خاص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="data-sharing" className="text-sm sm:text-base">مشاركة البيانات</Label>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">السماح بمشاركة البيانات لتحسين الخدمة</p>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) => setSettings({...settings, dataSharing: checked})}
                    className="self-start sm:self-center"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                  <CardTitle className="text-base sm:text-lg">إعدادات العرض</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  تخصيص مظهر وعرض التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm sm:text-base">اللغة</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings({...settings, language: value})}
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-sm sm:text-base">المظهر</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => setSettings({...settings, theme: value})}
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">فاتح</SelectItem>
                        <SelectItem value="dark">داكن</SelectItem>
                        <SelectItem value="system">النظام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm sm:text-base">المنطقة الزمنية</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => setSettings({...settings, timezone: value})}
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                        <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                        <SelectItem value="Asia/Kuwait">الكويت (GMT+3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <CardTitle className="text-base sm:text-lg">إعدادات الأمان</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  تعزيز أمان حسابك وبياناتك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="two-factor" className="text-sm sm:text-base">المصادقة الثنائية</Label>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">إضافة طبقة حماية إضافية لحسابك</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                    className="self-start sm:self-center"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="session-timeout" className="text-sm sm:text-base">انتهاء الجلسة (بالدقائق)</Label>
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) => setSettings({...settings, sessionTimeout: value})}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 دقيقة</SelectItem>
                      <SelectItem value="30">30 دقيقة</SelectItem>
                      <SelectItem value="60">60 دقيقة</SelectItem>
                      <SelectItem value="120">120 دقيقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} className="px-6 sm:px-8 text-sm sm:text-base">
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SalesSettings;