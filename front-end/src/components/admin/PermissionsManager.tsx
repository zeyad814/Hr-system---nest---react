import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Briefcase, 
  UserCheck, 
  FileText,
  DollarSign,
  Settings,
  Database,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'clients' | 'jobs' | 'contracts' | 'reports' | 'system';
  icon: React.ReactNode;
  enabled: boolean;
  level: 'read' | 'write' | 'delete' | 'admin';
  critical: boolean;
}

interface PermissionsManagerProps {
  permissions: Permission[];
  onTogglePermission: (id: string, enabled: boolean) => void;
}

const PermissionsManager: React.FC<PermissionsManagerProps> = ({
  permissions,
  onTogglePermission
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'جميع الصلاحيات', icon: <Shield className="h-4 w-4" /> },
    { id: 'users', name: 'إدارة المستخدمين', icon: <Users className="h-4 w-4" /> },
    { id: 'clients', name: 'إدارة العملاء', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'jobs', name: 'إدارة الوظائف', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'contracts', name: 'إدارة العقود', icon: <FileText className="h-4 w-4" /> },
    { id: 'reports', name: 'التقارير', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'system', name: 'إعدادات النظام', icon: <Settings className="h-4 w-4" /> }
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'admin':
        return <Badge variant="destructive">مدير</Badge>;
      case 'delete':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">حذف</Badge>;
      case 'write':
        return <Badge variant="default">كتابة</Badge>;
      default:
        return <Badge variant="secondary">قراءة</Badge>;
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const enabledCount = permissions.filter(p => p.enabled).length;
  const criticalEnabledCount = permissions.filter(p => p.enabled && p.critical).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الصلاحيات المطلقة</h2>
          <p className="text-gray-600 mt-1">تحكم كامل في جميع صلاحيات النظام</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{enabledCount}</span> من {permissions.length} صلاحية مفعلة
          </div>
          {criticalEnabledCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalEnabledCount} صلاحية حرجة
            </Badge>
          )}
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الصلاحيات</p>
                <p className="text-2xl font-bold">{permissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">مفعلة</p>
                <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">حرجة</p>
                <p className="text-2xl font-bold text-red-600">{criticalEnabledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Lock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">معطلة</p>
                <p className="text-2xl font-bold text-gray-600">{permissions.length - enabledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلاتر وبحث */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="البحث في الصلاحيات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 sm:grid-cols-7 w-full">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1 text-xs">
                {category.icon}
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* قائمة الصلاحيات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPermissions.map((permission) => (
          <Card key={permission.id} className={`relative ${permission.critical ? 'border-red-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    permission.enabled 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {permission.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {permission.name}
                      {permission.critical && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getLevelBadge(permission.level)}
                      {permission.enabled ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
                          <Unlock className="h-3 w-3" />
                          مفعل
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          معطل
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={permission.enabled}
                  onCheckedChange={(enabled) => onTogglePermission(permission.id, enabled)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {permission.description}
              </CardDescription>
              {permission.critical && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    تحذير: هذه صلاحية حرجة قد تؤثر على أمان النظام
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPermissions.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد صلاحيات</h3>
          <p className="text-gray-600">لم يتم العثور على صلاحيات تطابق البحث أو الفلتر المحدد</p>
        </div>
      )}
    </div>
  );
};

export default PermissionsManager;