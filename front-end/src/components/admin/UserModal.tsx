import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  position?: string;
  password?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

const UserModal = ({ isOpen, onClose, user, onSuccess }: UserModalProps) => {
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    role: "EMPLOYEE",
    status: "ACTIVE",
    department: "",
    position: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        department: user.department || "none",
        password: "" // Don't show existing password
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "EMPLOYEE",
        status: "ACTIVE",
        department: "none",
        position: "",
        password: ""
      });
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/users/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = { ...formData };
      
      // Convert "none" back to empty string for department
      if (submitData.department === "none") {
        submitData.department = "";
      }
      
      // Remove password if empty during edit
      if (isEditing && !submitData.password) {
        delete submitData.password;
      }

      if (isEditing && user?.id) {
        await api.patch(`/users/${user.id}`, submitData);
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث بيانات المستخدم بنجاح"
        });
      } else {
        await api.post('/users', submitData);
        toast({
          title: "تم الإنشاء بنجاح",
          description: "تم إنشاء المستخدم الجديد بنجاح"
        });
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "تحرير المستخدم" : "إضافة مستخدم جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "تحديث بيانات المستخدم" : "إضافة مستخدم جديد إلى النظام"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="أدخل الاسم الكامل"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditing ? "كلمة المرور الجديدة (اختياري)" : "كلمة المرور"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required={!isEditing}
                placeholder={isEditing ? "اتركه فارغاً للاحتفاظ بكلمة المرور الحالية" : "أدخل كلمة المرور"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-auto p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">الدور</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">مدير النظام</SelectItem>
                <SelectItem value="HR">الموارد البشرية</SelectItem>
                <SelectItem value="MANAGER">مدير</SelectItem>
                <SelectItem value="EMPLOYEE">موظف</SelectItem>
                <SelectItem value="SALES">مبيعات</SelectItem>
                <SelectItem value="CLIENT">عميل</SelectItem>
                <SelectItem value="APPLICANT">متقدم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">نشط</SelectItem>
                <SelectItem value="INACTIVE">غير نشط</SelectItem>
                <SelectItem value="SUSPENDED">معلق</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">القسم</Label>
            <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون قسم</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
                <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                <SelectItem value="المبيعات">المبيعات</SelectItem>
                <SelectItem value="التسويق">التسويق</SelectItem>
                <SelectItem value="المالية">المالية</SelectItem>
                <SelectItem value="العمليات">العمليات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">المنصب</Label>
            <Input
              id="position"
              value={formData.position || ""}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="أدخل المنصب"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? "تحديث" : "إنشاء"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;