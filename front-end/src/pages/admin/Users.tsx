import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  UserCheck,
  Target,
  Building2,
  Mail,
  Phone,
  Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import UserModal from "@/components/admin/UserModal";
import DeleteUserModal from "@/components/admin/DeleteUserModal";
import UserDetailsModal from "@/components/admin/UserDetailsModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  position?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminUsers = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { role: selectedRole }),
        ...(selectedStatus && { status: selectedStatus })
      });
      
      const response = await api.get(`/users?${params}`);
      const data: UsersResponse = response.data;
      
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalUsers(data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: t('admin.users.error'),
        description: t('admin.users.errorFetching'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, selectedRole, selectedStatus]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Modal handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleUserSaved = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
    fetchUsers(); // Refresh the list
  };

  const handleUserDeleted = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh the list
  };

  const handleCloseModals = () => {
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedUser(null);
    setEditingUser(null);
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
        return t('admin.users.systemAdmin');
      case "HR":
        return t('admin.users.hr');
      case "MANAGER":
        return t('admin.users.manager');
      case "EMPLOYEE":
        return t('admin.users.employee');
      case "APPLICANT":
        return t('admin.users.applicant');
      default:
        return role;
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return t('admin.users.active');
      case "SUSPENDED":
        return t('admin.users.suspended');
      case "INACTIVE":
        return t('admin.users.inactive');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const getLastLoginText = (lastLoginAt?: string) => {
    if (!lastLoginAt) return t('admin.users.neverLoggedIn');
    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('admin.users.connectedNow');
    if (diffInHours < 24) return t('admin.users.hoursAgo').replace('{hours}', diffInHours.toString());
    const diffInDays = Math.floor(diffInHours / 24);
    return t('admin.users.daysAgo').replace('{days}', diffInDays.toString());
  };

  return (
    <MainLayout userRole="admin" userName="محمد أحمد">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('admin.users.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t('admin.users.subtitle')}</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={handleAddUser}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('admin.users.addUser')}</span>
            <span className="sm:hidden">إضافة مستخدم</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('admin.users.searchPlaceholder')}
                    className="pr-10 text-sm"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select 
                  className="px-2 sm:px-3 py-2 border rounded-md text-sm flex-1 sm:flex-none"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">{t('admin.users.allRoles')}</option>
                  <option value="ADMIN">{t('admin.users.systemAdmin')}</option>
                  <option value="HR">{t('admin.users.hr')}</option>
                  <option value="MANAGER">{t('admin.users.manager')}</option>
                  <option value="EMPLOYEE">{t('admin.users.employee')}</option>
                  <option value="APPLICANT">{t('admin.users.applicant')}</option>
                </select>
                <select 
                  className="px-2 sm:px-3 py-2 border rounded-md text-sm flex-1 sm:flex-none"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">{t('admin.users.allStatuses')}</option>
                  <option value="ACTIVE">{t('admin.users.active')}</option>
                  <option value="SUSPENDED">{t('admin.users.suspended')}</option>
                  <option value="INACTIVE">{t('admin.users.inactive')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('admin.users.usersList')} ({totalUsers})
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2 lg:p-4 font-semibold text-xs lg:text-sm">{t('admin.users.user')}</th>
                    <th className="text-right p-2 lg:p-4 font-semibold text-xs lg:text-sm">{t('admin.users.contactInfo')}</th>
                    <th className="text-right p-2 lg:p-4 font-semibold text-xs lg:text-sm">{t('admin.users.role')}</th>
                    <th className="text-right p-2 lg:p-4 font-semibold text-xs lg:text-sm hidden md:table-cell">{t('admin.users.department')}</th>
                    <th className="text-right p-2 lg:p-4 font-semibold text-xs lg:text-sm hidden lg:table-cell">{t('admin.users.joinDate')}</th>
                    <th className="text-right p-2 lg:p-4 font-semibold text-xs lg:text-sm hidden lg:table-cell">{t('admin.users.lastLogin')}</th>
                    <th className="text-right p-2 lg:p-4 font-semibold text-xs lg:text-sm">{t('admin.users.status')}</th>
                    <th className="text-right p-2 lg:p-4 font-semibold text-xs lg:text-sm">{t('admin.users.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-4 sm:p-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                          <span className="text-xs sm:text-sm">{t('admin.users.loadingUsers')}</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 sm:p-8 text-center text-muted-foreground text-xs sm:text-sm">
                        {t('common.noData')}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const RoleIcon = getRoleIcon(user.role);
                      const userAvatar = user.name.charAt(0);
                      return (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 lg:p-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                                <AvatarImage src="" alt={user.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {userAvatar}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-xs lg:text-sm">{user.name}</div>
                                <div className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 lg:p-4">
                            <div className="space-y-1 text-xs lg:text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              {user.position && (
                                <div className="text-muted-foreground">
                                  {user.position}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2 lg:p-4">
                            <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                              <RoleIcon className="h-3 w-3 ml-1" />
                              <span className="hidden md:inline">{getRoleTitle(user.role)}</span>
                              <span className="md:hidden">{user.role}</span>
                            </Badge>
                          </td>
                          <td className="p-2 lg:p-4 hidden md:table-cell">
                            <div className="text-xs lg:text-sm">{user.department || t('common.notSpecified')}</div>
                          </td>
                          <td className="p-2 lg:p-4 hidden lg:table-cell">
                            <div className="text-xs lg:text-sm">{formatDate(user.createdAt)}</div>
                          </td>
                          <td className="p-2 lg:p-4 hidden lg:table-cell">
                            <div className="text-xs lg:text-sm">{getLastLoginText(user.lastLoginAt)}</div>
                          </td>
                          <td className="p-2 lg:p-4">
                            <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                              {getStatusTitle(user.status)}
                            </Badge>
                          </td>
                          <td className="p-2 lg:p-4">
                            <div className="flex items-center gap-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                                onClick={() => handleViewUser(user)}
                                title={t('admin.users.viewDetails')}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                                onClick={() => handleEditUser(user)}
                                title={t('admin.users.editUser')}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 w-7 lg:h-8 lg:w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteUser(user)}
                                title={t('admin.users.deleteUser')}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">{t('admin.users.loadingUsers')}</span>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  {t('common.noData')}
                </div>
              ) : (
                users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const userAvatar = user.name.charAt(0);
                  return (
                    <Card key={user.id} className="p-3">
                      {/* User Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={user.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {userAvatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0"
                            onClick={() => handleViewUser(user)}
                            title="عرض التفاصيل"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0"
                            onClick={() => handleEditUser(user)}
                            title="تعديل المستخدم"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteUser(user)}
                            title={t('admin.users.deleteUser')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.position && (
                          <div className="text-xs text-muted-foreground">
                            {user.position}
                          </div>
                        )}
                      </div>

                      {/* Role and Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            {getRoleTitle(user.role)}
                          </span>
                        </div>
                        <Badge 
                          className={`text-xs px-2 py-0.5 ${getStatusColor(user.status)}`}
                        >
                          {getStatusTitle(user.status)}
                        </Badge>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('admin.users.department')}:</span>
                          <span className="truncate mr-2">{user.department || t('common.notSpecified')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('admin.users.joinDate')}:</span>
                          <span className="truncate mr-2">{formatDate(user.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('admin.users.lastLogin')}:</span>
                          <span className="truncate mr-2">{getLastLoginText(user.lastLoginAt)}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                  {t('admin.users.showing')} {((currentPage - 1) * 10) + 1} {t('admin.users.to')} {Math.min(currentPage * 10, totalUsers)} {t('admin.users.of')} {totalUsers} {t('admin.users.users')}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    {t('admin.users.previous')}
                  </Button>
                  <span className="text-sm">
                    {t('admin.users.page')} {currentPage} {t('admin.users.of')} {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {t('admin.users.next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleUserSaved}
        user={editingUser}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleUserDeleted}
        user={selectedUser}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        userId={selectedUser?.id || null}
      />
    </MainLayout>
  );
};

export default AdminUsers;