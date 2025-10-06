import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Shield, Eye, User, Briefcase, Settings as SettingsIcon, Loader2, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { toast } from 'sonner';
import settingsApi, { type ApplicantSettings } from '@/lib/settingsApi';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

const ApplicantSettings = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<ApplicantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getApplicantSettings();
      setSettings(response.settings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error(t('applicant.settings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof ApplicantSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSalaryRangeChange = (type: 'min' | 'max', value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      salaryRange: { ...settings.salaryRange, [type]: value }
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await settingsApi.updateApplicantSettings(settings);
      toast.success(t('applicant.settings.saveSuccess'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('applicant.settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    
    if (passwords.new.length < 6) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }

    try {
      await settingsApi.changePassword(passwords.current, passwords.new);
      toast.success(t('applicant.settings.passwordChangeSuccess'));
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(t('applicant.settings.passwordChangeError'));
    }
  };

  const handleResetSettings = async () => {
    try {
      const response = await settingsApi.resetSettings();
      setSettings(response.settings as ApplicantSettings);
      toast.success(t('applicant.settings.resetSuccess'));
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error(t('applicant.settings.resetError'));
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error(t('auth.passwordRequired'));
      return;
    }

    try {
      await settingsApi.deleteAccount(deletePassword);
      toast.success(t('applicant.settings.deleteAccountSuccess'));
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t('applicant.settings.deleteAccountError'));
    }
  };

  if (loading) {
    return (
      <MainLayout userRole="applicant" userName={t('common.applicant')}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="mr-2">{t('applicant.settings.loading')}</span>
        </div>
      </MainLayout>
    );
  }

  if (!settings) {
    return (
      <MainLayout userRole="applicant" userName={t('common.applicant')}>
        <div className="text-center py-8">
          <p>{t('applicant.settings.loadError')}</p>
          <Button onClick={loadSettings} className="mt-4">{t('common.retry')}</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="applicant" userName={t('common.applicant')}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('applicant.settings.title')}</h1>
          <p className="text-gray-600">{t('applicant.settings.description')}</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t('applicant.settings.tabs.notifications')}
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t('applicant.settings.tabs.privacy')}
            </TabsTrigger>
            <TabsTrigger value="job-search" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {t('applicant.settings.tabs.jobSearch')}
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('applicant.settings.tabs.account')}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              {t('applicant.settings.tabs.security')}
            </TabsTrigger>
          </TabsList>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t('applicant.settings.notifications.title')}</CardTitle>
                <CardDescription>{t('applicant.settings.notifications.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.notifications.jobAlerts.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.notifications.jobAlerts.description')}</p>
                    </div>
                    <Switch
                      checked={settings.jobAlerts}
                      onCheckedChange={(checked) => updateSetting('jobAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.notifications.applicationUpdates.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.notifications.applicationUpdates.description')}</p>
                    </div>
                    <Switch
                      checked={settings.applicationUpdates}
                      onCheckedChange={(checked) => updateSetting('applicationUpdates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.notifications.interviewReminders.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.notifications.interviewReminders.description')}</p>
                    </div>
                    <Switch
                      checked={settings.interviewReminders}
                      onCheckedChange={(checked) => updateSetting('interviewReminders', checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">{t('applicant.settings.notifications.communicationMethods')}</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.notifications.email.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.notifications.email.description')}</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.notifications.sms.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.notifications.sms.description')}</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.notifications.push.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.notifications.push.description')}</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>{t('applicant.settings.privacy.title')}</CardTitle>
                <CardDescription>{t('applicant.settings.privacy.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('applicant.settings.privacy.profileVisibility.label')}</Label>
                    <Select
                      value={settings.profileVisibility}
                      onValueChange={(value) => updateSetting('profileVisibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">{t('applicant.settings.privacy.profileVisibility.public')}</SelectItem>
                        <SelectItem value="limited">{t('applicant.settings.privacy.profileVisibility.limited')}</SelectItem>
                        <SelectItem value="private">{t('applicant.settings.privacy.profileVisibility.private')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.privacy.showContactInfo.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.privacy.showContactInfo.description')}</p>
                    </div>
                    <Switch
                      checked={settings.showContactInfo}
                      onCheckedChange={(checked) => updateSetting('showContactInfo', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.privacy.allowRecruiterContact.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.privacy.allowRecruiterContact.description')}</p>
                    </div>
                    <Switch
                      checked={settings.allowRecruiterContact}
                      onCheckedChange={(checked) => updateSetting('allowRecruiterContact', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.privacy.showSalaryExpectations.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.privacy.showSalaryExpectations.description')}</p>
                    </div>
                    <Switch
                      checked={settings.showSalaryExpectations}
                      onCheckedChange={(checked) => updateSetting('showSalaryExpectations', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Search Settings */}
          <TabsContent value="job-search">
            <Card>
              <CardHeader>
                <CardTitle>{t('applicant.settings.jobSearch.title')}</CardTitle>
                <CardDescription>{t('applicant.settings.jobSearch.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('applicant.settings.jobSearch.status.label')}</Label>
                    <Select
                      value={settings.jobSearchStatus}
                      onValueChange={(value) => updateSetting('jobSearchStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="actively_looking">{t('applicant.settings.jobSearch.status.activelyLooking')}</SelectItem>
                        <SelectItem value="open_to_offers">{t('applicant.settings.jobSearch.status.openToOffers')}</SelectItem>
                        <SelectItem value="not_looking">{t('applicant.settings.jobSearch.status.notLooking')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('applicant.settings.jobSearch.preferredJobTypes.label')}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['full-time', 'part-time', 'contract', 'freelance'].map((type) => {
                        const labels = {
                          'full-time': t('applicant.settings.jobSearch.preferredJobTypes.fullTime'),
                          'part-time': t('applicant.settings.jobSearch.preferredJobTypes.partTime'),
                          'contract': t('applicant.settings.jobSearch.preferredJobTypes.contract'),
                          'freelance': t('applicant.settings.jobSearch.preferredJobTypes.freelance')
                        };
                        return (
                          <div key={type} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={type}
                              checked={settings.preferredJobTypes.includes(type)}
                              onChange={(e) => {
                                const newTypes = e.target.checked
                                  ? [...settings.preferredJobTypes, type]
                                  : settings.preferredJobTypes.filter(t => t !== type);
                                updateSetting('preferredJobTypes', newTypes);
                              }}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={type} className="text-sm">
                              {labels[type as keyof typeof labels]}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('applicant.settings.jobSearch.preferredLocations.label')}</Label>
                    <Input
                      value={settings.preferredLocations.join(', ')}
                      onChange={(e) => {
                        const locations = e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc);
                        updateSetting('preferredLocations', locations);
                      }}
                      placeholder={t('applicant.settings.jobSearch.preferredLocations.placeholder')}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>{t('applicant.settings.jobSearch.salaryRange.label')}</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minSalary">{t('applicant.settings.jobSearch.salaryRange.min')}</Label>
                        <Input
                          id="minSalary"
                          type="number"
                          value={settings.salaryRange.min}
                          onChange={(e) => handleSalaryRangeChange('min', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxSalary">{t('applicant.settings.jobSearch.salaryRange.max')}</Label>
                        <Input
                          id="maxSalary"
                          type="number"
                          value={settings.salaryRange.max}
                          onChange={(e) => handleSalaryRangeChange('max', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.jobSearch.remoteWork.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.jobSearch.remoteWork.description')}</p>
                    </div>
                    <Switch
                      checked={settings.remoteWork}
                      onCheckedChange={(checked) => updateSetting('remoteWork', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>{t('applicant.settings.account.title')}</CardTitle>
                <CardDescription>{t('applicant.settings.account.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>{t('applicant.settings.account.language.label')}</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => updateSetting('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">{t('applicant.settings.account.language.arabic')}</SelectItem>
                        <SelectItem value="en">{t('applicant.settings.account.language.english')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('applicant.settings.account.timezone.label')}</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => updateSetting('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Riyadh">{t('applicant.settings.account.timezone.riyadh')}</SelectItem>
                        <SelectItem value="Asia/Dubai">{t('applicant.settings.account.timezone.dubai')}</SelectItem>
                        <SelectItem value="Asia/Kuwait">{t('applicant.settings.account.timezone.kuwait')}</SelectItem>
                        <SelectItem value="UTC">{t('applicant.settings.account.timezone.utc')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('applicant.settings.account.theme.label')}</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => updateSetting('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{t('applicant.settings.account.theme.light')}</SelectItem>
                        <SelectItem value="dark">{t('applicant.settings.account.theme.dark')}</SelectItem>
                        <SelectItem value="system">{t('applicant.settings.account.theme.system')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>{t('applicant.settings.security.title')}</CardTitle>
                <CardDescription>{t('applicant.settings.security.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.security.twoFactor.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.security.twoFactor.description')}</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('applicant.settings.security.loginNotifications.label')}</Label>
                      <p className="text-sm text-gray-500">{t('applicant.settings.security.loginNotifications.description')}</p>
                    </div>
                    <Switch
                      checked={settings.loginNotifications}
                      onCheckedChange={(checked) => updateSetting('loginNotifications', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">{t('applicant.settings.security.sessionTimeout.label')}</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">{t('applicant.settings.security.changePassword.title')}</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">{t('applicant.settings.security.changePassword.currentPassword')}</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwords.current}
                        onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                        placeholder={t('applicant.settings.security.changePassword.currentPasswordPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">{t('applicant.settings.security.changePassword.newPassword')}</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                        placeholder={t('applicant.settings.security.changePassword.newPasswordPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">{t('applicant.settings.security.changePassword.confirmPassword')}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                        placeholder={t('applicant.settings.security.changePassword.confirmPasswordPlaceholder')}
                      />
                    </div>
                    <Button 
                      onClick={handleChangePassword}
                      className="w-full"
                      disabled={!passwords.current || !passwords.new || !passwords.confirm}
                    >
{t('applicant.settings.security.changePassword.button')}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">{t('applicant.settings.security.dangerZone.title')}</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleResetSettings}
                    >
{t('applicant.settings.security.dangerZone.resetSettings')}
                    </Button>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 ml-2" />
{t('applicant.settings.security.dangerZone.deleteAccount')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('applicant.settings.security.deleteDialog.title')}</DialogTitle>
                          <DialogDescription>
                            {t('applicant.settings.security.deleteDialog.description')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="delete-password">{t('applicant.settings.security.deleteDialog.passwordLabel')}</Label>
                            <Input
                              id="delete-password"
                              type="password"
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              placeholder={t('applicant.settings.security.deleteDialog.passwordPlaceholder')}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            {t('applicant.settings.security.deleteDialog.cancel')}
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            disabled={!deletePassword}
                          >
                            {t('applicant.settings.security.deleteDialog.confirm')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button onClick={handleSave} size="lg" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
{t('applicant.settings.saveButton')}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ApplicantSettings;