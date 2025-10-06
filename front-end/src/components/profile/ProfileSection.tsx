import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileSectionProps {
  isVisible: boolean;
  onClose: () => void;
  userRole?: string;
  userName?: string;
}

export function ProfileSection({ isVisible, onClose, userRole = "admin", userName = "أحمد محمد" }: ProfileSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isVisible) return null;

  // Use actual user data if available
  const displayName = user?.name || userName;
  const displayEmail = user?.email || "ahmed.mohamed@company.com";
  const displayRole = user?.role || userRole;
  const displayId = user?.id || "N/A";

  const getRoleDisplayName = () => {
    switch (displayRole) {
      case "hr":
      case "HR":
        return "موظف التوظيف";
      case "sales":
      case "SALES":
        return "موظف المبيعات";
      case "client":
      case "CLIENT":
        return "العميل";
      case "applicant":
      case "APPLICANT":
        return "مقدم الطلب";
      case "admin":
      case "ADMIN":
        return "المدير العام";
      default:
        return "المدير العام";
    }
  };

  const handleEditProfile = () => {
    // Navigate to profile page based on user role
    const role = displayRole?.toLowerCase();
    switch (role) {
      case "admin":
        navigate("/admin/profile");
        break;
      case "hr":
        navigate("/hr/profile");
        break;
      case "client":
        navigate("/client/profile");
        break;
      case "applicant":
        navigate("/applicant/profile");
        break;
      case "sales":
        navigate("/sales/profile");
        break;
      default:
        navigate("/profile");
    }
    onClose();
  };

  const handleSettings = () => {
    // Navigate to settings page based on user role
    const role = displayRole?.toLowerCase();
    switch (role) {
      case "admin":
        navigate("/admin/settings");
        break;
      case "hr":
        navigate("/hr/settings");
        break;
      case "client":
        navigate("/client/settings");
        break;
      case "applicant":
        navigate("/applicant/settings");
        break;
      case "sales":
        navigate("/sales/settings");
        break;
      default:
        navigate("/settings");
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40" 
        onClick={onClose}
      />
      
      {/* Profile Section */}
      <div className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
        <Card className="shadow-lg border-2">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder-avatar.png" alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{displayName}</CardTitle>
            <CardDescription className="text-center">
              {getRoleDisplayName()}
            </CardDescription>
            <div className="flex justify-center mt-2">
              <Badge variant="secondary">
                {getRoleDisplayName()}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{displayEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+966 50 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>انضم في يناير 2024</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>قسم الموارد البشرية</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{displayId}</div>
                <div className="text-sm text-gray-600">معرف المستخدم</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{getRoleDisplayName()}</div>
                <div className="text-sm text-gray-600">الدور</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">نشط</div>
                <div className="text-sm text-gray-600">الحالة</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleEditProfile}
                className="flex-1"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                تعديل الملف
              </Button>
              <Button 
                onClick={handleSettings}
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}