import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, TestTube, Save, Plus, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AgoraSettings {
  id: string;
  appId: string;
  appCertificate: string;
  isEnabled: boolean;
  recordingEnabled: boolean;
  recordingBucket?: string;
  recordingRegion?: string;
  maxChannelUsers: number;
  tokenExpiry: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface AgoraSettingsForm {
  appId: string;
  appCertificate: string;
  isEnabled: boolean;
  recordingEnabled: boolean;
  recordingBucket: string;
  recordingRegion: string;
  maxChannelUsers: number;
  tokenExpiry: number;
  description: string;
}

const AgoraSettings: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<AgoraSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<AgoraSettings | null>(null);
  const [formData, setFormData] = useState<AgoraSettingsForm>({
    appId: '',
    appCertificate: '',
    isEnabled: true,
    recordingEnabled: false,
    recordingBucket: '',
    recordingRegion: '',
    maxChannelUsers: 10,
    tokenExpiry: 3600,
    description: '',
  });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/agora-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Agora settings');
      }

      const data = await response.json();
      setSettings(data.data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(t('admin.agoraSettings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      const url = editingSettings 
        ? `${API_BASE}/agora-settings/${editingSettings.id}`
        : `${API_BASE}/agora-settings`;
      
      const method = editingSettings ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }

      const result = await response.json();
      toast.success(editingSettings ? t('admin.agoraSettings.updateSuccess') : t('admin.agoraSettings.createSuccess'));
      
      setIsDialogOpen(false);
      setEditingSettings(null);
      resetForm();
      fetchSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || t('admin.agoraSettings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (settingsId: string) => {
    setTesting(settingsId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/agora-settings/${settingsId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(t('admin.agoraSettings.testSuccess'));
      } else {
        toast.error(`${t('admin.agoraSettings.testError')}: ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error(t('admin.agoraSettings.testConnectionError'));
    } finally {
      setTesting(null);
    }
  };

  const deleteSettings = async (settingsId: string) => {
    if (!confirm(t('admin.agoraSettings.deleteConfirm'))) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/agora-settings/${settingsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete settings');
      }

      toast.success(t('admin.agoraSettings.deleteSuccess'));
      fetchSettings();
    } catch (error) {
      console.error('Error deleting settings:', error);
      toast.error(t('admin.agoraSettings.deleteError'));
    }
  };

  const openEditDialog = (settings: AgoraSettings) => {
    setEditingSettings(settings);
    setFormData({
      appId: settings.appId,
      appCertificate: settings.appCertificate,
      isEnabled: settings.isEnabled,
      recordingEnabled: settings.recordingEnabled,
      recordingBucket: settings.recordingBucket || '',
      recordingRegion: settings.recordingRegion || '',
      maxChannelUsers: settings.maxChannelUsers,
      tokenExpiry: settings.tokenExpiry,
      description: settings.description || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      appId: '',
      appCertificate: '',
      isEnabled: true,
      recordingEnabled: false,
      recordingBucket: '',
      recordingRegion: '',
      maxChannelUsers: 10,
      tokenExpiry: 3600,
      description: '',
    });
  };

  const openCreateDialog = () => {
    setEditingSettings(null);
    resetForm();
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('admin.agoraSettings.title')}</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {t('admin.agoraSettings.subtitle')}
            </p>
          </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('admin.agoraSettings.addSettings')}</span>
              <span className="sm:hidden">إضافة</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSettings ? t('admin.agoraSettings.editSettings') : t('admin.agoraSettings.addNewSettings')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.agoraSettings.dialogDescription')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appId" className="text-sm font-medium">App ID *</Label>
                  <Input
                    id="appId"
                    value={formData.appId}
                    onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                    placeholder={t('admin.agoraSettings.appIdPlaceholder')}
                    required
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appCertificate" className="text-sm font-medium">App Certificate *</Label>
                  <Input
                    id="appCertificate"
                    type="password"
                    value={formData.appCertificate}
                    onChange={(e) => setFormData({ ...formData, appCertificate: e.target.value })}
                    placeholder={t('admin.agoraSettings.appCertificatePlaceholder')}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxChannelUsers" className="text-sm font-medium">{t('admin.agoraSettings.maxUsers')}</Label>
                  <Input
                    id="maxChannelUsers"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxChannelUsers}
                    onChange={(e) => setFormData({ ...formData, maxChannelUsers: parseInt(e.target.value) })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenExpiry" className="text-sm font-medium">{t('admin.agoraSettings.tokenExpiry')}</Label>
                  <Input
                    id="tokenExpiry"
                    type="number"
                    min="300"
                    max="86400"
                    value={formData.tokenExpiry}
                    onChange={(e) => setFormData({ ...formData, tokenExpiry: parseInt(e.target.value) })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recordingBucket" className="text-sm font-medium">{t('admin.agoraSettings.recordingBucket')}</Label>
                  <Input
                    id="recordingBucket"
                    value={formData.recordingBucket}
                    onChange={(e) => setFormData({ ...formData, recordingBucket: e.target.value })}
                    placeholder={t('admin.agoraSettings.bucketPlaceholder')}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recordingRegion" className="text-sm font-medium">{t('admin.agoraSettings.recordingRegion')}</Label>
                  <Input
                    id="recordingRegion"
                    value={formData.recordingRegion}
                    onChange={(e) => setFormData({ ...formData, recordingRegion: e.target.value })}
                    placeholder={t('admin.agoraSettings.regionPlaceholder')}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    id="isEnabled"
                    checked={formData.isEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                  />
                  <Label htmlFor="isEnabled" className="text-sm font-medium">{t('admin.agoraSettings.enableAgora')}</Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    id="recordingEnabled"
                    checked={formData.recordingEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, recordingEnabled: checked })}
                  />
                  <Label htmlFor="recordingEnabled" className="text-sm font-medium">{t('admin.agoraSettings.enableRecording')}</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">{t('admin.agoraSettings.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('admin.agoraSettings.descriptionPlaceholder')}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving} className="w-full sm:w-auto order-1 sm:order-2">
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {editingSettings ? t('common.update') : t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.agoraSettings.savedSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('admin.agoraSettings.noSettings')}</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.agoraSettings.addSettings')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">App ID</TableHead>
                    <TableHead className="min-w-[80px] hidden sm:table-cell">{t('admin.agoraSettings.status')}</TableHead>
                    <TableHead className="min-w-[80px] hidden md:table-cell">{t('admin.agoraSettings.recording')}</TableHead>
                    <TableHead className="min-w-[60px] hidden lg:table-cell">{t('admin.agoraSettings.users')}</TableHead>
                    <TableHead className="min-w-[80px] hidden lg:table-cell">{t('admin.agoraSettings.tokenExpiry')}</TableHead>
                    <TableHead className="min-w-[100px] hidden xl:table-cell">{t('admin.agoraSettings.createdAt')}</TableHead>
                    <TableHead className="min-w-[200px]">{t('admin.agoraSettings.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-mono text-xs sm:text-sm">
                        <div className="flex flex-col">
                          <span>{setting.appId.substring(0, 8)}...</span>
                          <div className="sm:hidden mt-1 space-y-1">
                            <Badge variant={setting.isEnabled ? 'default' : 'secondary'} className="text-xs">
                              {setting.isEnabled ? t('common.enabled') : t('common.disabled')}
                            </Badge>
                            <div className="md:hidden">
                              <Badge variant={setting.recordingEnabled ? 'default' : 'outline'} className="text-xs ml-1">
                                {setting.recordingEnabled ? 'تسجيل' : 'بدون تسجيل'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={setting.isEnabled ? 'default' : 'secondary'} className="text-xs">
                          {setting.isEnabled ? t('common.enabled') : t('common.disabled')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={setting.recordingEnabled ? 'default' : 'outline'} className="text-xs">
                          {setting.recordingEnabled ? t('common.enabled') : t('common.disabled')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{setting.maxChannelUsers}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{setting.tokenExpiry}s</TableCell>
                      <TableCell className="hidden xl:table-cell text-sm">
                        {new Date(setting.createdAt).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                          <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testConnection(setting.id)}
                              disabled={testing === setting.id}
                              className="w-full sm:w-auto text-xs"
                            >
                              {testing === setting.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <TestTube className="h-3 w-3" />
                              )}
                              <span className="hidden sm:inline ml-1">{t('admin.agoraSettings.testConnection')}</span>
                              <span className="sm:hidden ml-1">اختبار</span>
                            </Button>
                          <div className="flex gap-1 w-full sm:w-auto">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(setting)}
                                className="flex-1 sm:flex-none text-xs"
                              >
                                <Edit className="h-3 w-3" />
                                <span className="hidden sm:inline ml-1">{t('common.edit')}</span>
                                <span className="sm:hidden ml-1">تعديل</span>
                              </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteSettings(setting.id)}
                                className="flex-1 sm:flex-none text-xs"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="hidden sm:inline ml-1">{t('common.delete')}</span>
                                <span className="sm:hidden ml-1">حذف</span>
                              </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
};

export default AgoraSettings;