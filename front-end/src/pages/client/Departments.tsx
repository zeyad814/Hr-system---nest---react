import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDepartments } from "@/contexts/DepartmentsContext";
import { 
  Building2, 
  Plus,
  Edit,
  Trash2,
  Users,
  FileText,
  Settings,
  Save,
  X
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string;
  requirements: string;
  jobCount: number;
  createdAt: string;
  updatedAt: string;
}

const ClientDepartments = () => {
  const { t, isRTL } = useLanguage();
  const { departments, loading, addDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requirements: ""
  });


  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم القسم",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingDepartment) {
        // Update existing department
        await updateDepartment(editingDepartment.id, {
          name: formData.name,
          description: formData.description,
          requirements: formData.requirements
        });
        
        setIsEditDialogOpen(false);
      } else {
        // Add new department
        await addDepartment({
          name: formData.name,
          description: formData.description,
          requirements: formData.requirements
        });
        
        setIsAddDialogOpen(false);
      }
      
      // Reset form
      setFormData({ name: "", description: "", requirements: "" });
      setEditingDepartment(null);
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      requirements: department.requirements
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (departmentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) {
      return;
    }

    try {
      await deleteDepartment(departmentId);
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", requirements: "" });
    setEditingDepartment(null);
  };

  return (
    <MainLayout userRole="client" userName={t('client.dashboard.defaultUserName')}>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold text-foreground">إدارة الأقسام</h1>
          </div>
          <p className="text-muted-foreground text-lg">إدارة أقسام الشركة والمتطلبات الخاصة بكل قسم</p>
        </div>

        {/* Add Department Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">الأقسام ({departments.length})</h2>
            <p className="text-muted-foreground">إدارة أقسام الشركة والمتطلبات</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة قسم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  إضافة قسم جديد
                </DialogTitle>
                <DialogDescription>
                  أضف قسم جديد مع الوصف والمتطلبات
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم القسم <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="أدخل اسم القسم"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">وصف القسم</Label>
                  <Textarea
                    id="description"
                    placeholder="أدخل وصف مفصل للقسم"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="requirements">متطلبات القسم</Label>
                  <Textarea
                    id="requirements"
                    placeholder="أدخل المتطلبات والمؤهلات المطلوبة للقسم"
                    rows={4}
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="flex-1 gap-2">
                    <Save className="h-4 w-4" />
                    حفظ
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }} className="flex-1">
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <Card key={department.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-200"
                      onClick={() => handleEdit(department)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50 hover:border-red-200"
                      onClick={() => handleDelete(department.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Job Count */}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">الوظائف:</span>
                  <Badge variant="secondary">{department.jobCount}</Badge>
                </div>
                
                {/* Description */}
                {department.description && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">الوصف:</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {department.description}
                    </p>
                  </div>
                )}
                
                {/* Requirements */}
                {department.requirements && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">المتطلبات:</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {department.requirements}
                    </p>
                  </div>
                )}
                
                {/* Updated Date */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  آخر تحديث: {new Date(department.updatedAt).toLocaleDateString('ar-SA')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Department Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                تعديل القسم
              </DialogTitle>
              <DialogDescription>
                تعديل معلومات القسم والوصف والمتطلبات
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">اسم القسم <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-name"
                  placeholder="أدخل اسم القسم"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">وصف القسم</Label>
                <Textarea
                  id="edit-description"
                  placeholder="أدخل وصف مفصل للقسم"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-requirements">متطلبات القسم</Label>
                <Textarea
                  id="edit-requirements"
                  placeholder="أدخل المتطلبات والمؤهلات المطلوبة للقسم"
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSubmit} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ClientDepartments;
