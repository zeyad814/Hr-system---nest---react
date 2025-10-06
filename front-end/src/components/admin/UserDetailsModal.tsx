import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Clock, 
  Shield,
  UserCheck,
  Target,
  Users,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

const UserDetailsModal = ({ isOpen, onClose, userId }: UserDetailsModalProps) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب تفاصيل المستخدم",
        variant: "destructive"
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return Shield;
      case "HR":
        return UserCheck;
      case "MANAGER":
        return Target;
      case "EMPLOYEE":
        return Building2;
      default:
        return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-primary text-primary-foreground";
      case "HR":
        return "bg-secondary text-secondary-foreground";
      case "MANAGER":
        return "bg-accent text-accent-foreground";
      case "EMPLOYEE":
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SUSPENDED":
        return "bg-yellow-100 text-yellow-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "مدير النظام";
      case "HR":
        return "موظف الموارد البشرية";
      case "MANAGER":
        return "مدير";
      case "EMPLOYEE":
        return "موظف";
      case "SALES":
        return "مبيعات";
      case "CLIENT":
        return "عميل";
      case "APPLICANT":
        return "متقدم للوظيفة";
      default:
        return role;
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "نشط";
      case "SUSPENDED":
        return "معلق";
      case "INACTIVE":
        return "غير نشط";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastLoginText = (lastLoginAt?: string) => {
    if (!lastLoginAt) return "لم يسجل دخول";
    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "متصل الآن";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  if (!user && !loading) return null;

  const RoleIcon = user ? getRoleIcon(user.role) : User;
  const userAvatar = user?.name.charAt(0) || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>تفاصيل المستخدم</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">جاري التحميل...</span>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Avatar and Basic Info */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {userAvatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getRoleColor(user.role)}>
                    <RoleIcon className="h-3 w-3 ml-1" />
                    {getRoleTitle(user.role)}
                  </Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {getStatusTitle(user.status)}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                معلومات الاتصال
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Work Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                معلومات العمل
              </h4>
              <div className="space-y-2">
                {user.department && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.department}</span>
                  </div>
                )}
                {user.position && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.position}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                معلومات الحساب
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">تاريخ الانضمام: </span>
                    <span className="text-sm">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">آخر دخول: </span>
                    <span className="text-sm">{getLastLoginText(user.lastLoginAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">آخر تحديث: </span>
                    <span className="text-sm">{formatDate(user.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;