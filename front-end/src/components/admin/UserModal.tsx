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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    role: "APPLICANT",
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
    if (isOpen) {
      if (user) {
        setFormData({
          ...user,
          department: user.department || "none",
          password: "" // Don't show existing password
        });
      } else {
        // Reset form for new user
        setFormData({
          name: "",
          email: "",
          role: "APPLICANT",
          status: "ACTIVE",
          department: "none",
          position: "",
          password: ""
        });
      }
      fetchDepartments();
    }
  }, [isOpen, user]);

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
          title: t('admin.users.updateSuccess'),
          description: t('admin.users.updateSuccessDesc')
        });
      } else {
        await api.post('/users', submitData);
        toast({
          title: t('admin.users.createSuccess'),
          description: t('admin.users.createSuccessDesc')
        });
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Error saving user:', error);
      type ErrorWithResponse = { response?: { data?: { message?: string } } };
      const err = error as ErrorWithResponse;
      const message = err?.response?.data?.message;
      toast({
        title: t('common.error'),
        description: message || t('admin.users.saveError'),
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
            {isEditing ? t('admin.users.editUser') : t('admin.users.addNewUser')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('admin.users.editUserDesc') : t('admin.users.addNewUserDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('admin.users.fullName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder={t('admin.users.fullNamePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t('admin.users.email')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder={t('admin.users.emailPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditing ? t('admin.users.newPasswordOptional') : t('admin.users.password')} {!isEditing && (<span className="text-red-500">*</span>)}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required={!isEditing}
                placeholder={isEditing ? t('admin.users.passwordKeepPlaceholder') : t('admin.users.passwordPlaceholder')}
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
            <Label htmlFor="role">
              {t('admin.users.role')} <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.users.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">{t('admin.users.systemAdmin')}</SelectItem>
                <SelectItem value="HR">{t('admin.users.hr')}</SelectItem>
                <SelectItem value="MANAGER">{t('admin.users.manager')}</SelectItem>
                <SelectItem value="EMPLOYEE">{t('admin.users.employee')}</SelectItem>
                <SelectItem value="SALES">{t('admin.users.sales')}</SelectItem>
                <SelectItem value="CLIENT">{t('admin.users.client')}</SelectItem>
                <SelectItem value="APPLICANT">{t('admin.users.applicant')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              {t('admin.users.status')} <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.users.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">{t('admin.users.active')}</SelectItem>
                <SelectItem value="INACTIVE">{t('admin.users.inactive')}</SelectItem>
                <SelectItem value="SUSPENDED">{t('admin.users.suspended')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{t('admin.users.department')}</Label>
            <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.users.selectDepartment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('admin.users.noDepartment')}</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
                <SelectItem value="تقنية المعلومات">{t('admin.users.it')}</SelectItem>
                <SelectItem value="الموارد البشرية">{t('admin.users.hr')}</SelectItem>
                <SelectItem value="المبيعات">{t('admin.users.sales')}</SelectItem>
                <SelectItem value="التسويق">{t('admin.users.marketing')}</SelectItem>
                <SelectItem value="المالية">{t('admin.users.finance')}</SelectItem>
                <SelectItem value="العمليات">{t('admin.users.operations')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">{t('admin.users.position')}</Label>
            <Input
              id="position"
              value={formData.position || ""}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder={t('admin.users.positionPlaceholder')}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? t('admin.users.update') : t('admin.users.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;