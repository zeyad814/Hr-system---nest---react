import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Zap, 
  MessageSquare, 
  Phone, 
  Database, 
  Globe,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

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

interface IntegrationsManagerProps {
  integrations: Integration[];
  onToggleIntegration: (id: string, enabled: boolean) => void;
  onUpdateApiKey: (id: string, apiKey: string) => void;
}

const IntegrationsManager: React.FC<IntegrationsManagerProps> = ({
  integrations,
  onToggleIntegration,
  onUpdateApiKey
}) => {
  const [editingApiKey, setEditingApiKey] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">متصل</Badge>;
      case 'error':
        return <Badge variant="destructive">خطأ</Badge>;
      default:
        return <Badge variant="secondary">غير متصل</Badge>;
    }
  };

  const handleSaveApiKey = (integrationId: string) => {
    onUpdateApiKey(integrationId, tempApiKey);
    setEditingApiKey(null);
    setTempApiKey('');
  };

  const handleEditApiKey = (integrationId: string, currentKey?: string) => {
    setEditingApiKey(integrationId);
    setTempApiKey(currentKey || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة التكاملات الخارجية</h2>
          <p className="text-gray-600 mt-1">تفعيل وإدارة التكاملات مع الأنظمة الخارجية</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          إعدادات عامة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {integration.icon}
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(integration.status)}
                      {getStatusBadge(integration.status)}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={integration.enabled}
                  onCheckedChange={(enabled) => onToggleIntegration(integration.id, enabled)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {integration.description}
              </CardDescription>
              
              {integration.enabled && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`api-key-${integration.id}`} className="text-sm font-medium">
                      مفتاح API
                    </Label>
                    {editingApiKey === integration.id ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={`api-key-${integration.id}`}
                          type="password"
                          value={tempApiKey}
                          onChange={(e) => setTempApiKey(e.target.value)}
                          placeholder="أدخل مفتاح API"
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveApiKey(integration.id)}
                        >
                          حفظ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingApiKey(null)}
                        >
                          إلغاء
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={integration.apiKey ? '••••••••••••' : ''}
                          readOnly
                          placeholder="لم يتم تعيين مفتاح API"
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditApiKey(integration.id, integration.apiKey)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {integration.webhookUrl && (
                    <div>
                      <Label className="text-sm font-medium">رابط Webhook</Label>
                      <Input
                        value={integration.webhookUrl}
                        readOnly
                        className="mt-1 text-xs"
                      />
                    </div>
                  )}
                  
                  {integration.lastSync && (
                    <div className="text-xs text-gray-500">
                      آخر مزامنة: {new Date(integration.lastSync).toLocaleString('ar-SA')}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsManager;