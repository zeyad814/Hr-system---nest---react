import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, TrendingUp } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { salesApiService } from "@/services/salesApi";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const SalesProfile = () => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [profile, setProfile] = useState({
    id: "",
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    location: "",
    bio: "",
    joinDate: "",
    avatar: "",
    department: "",
    position: "",
    target: "",
    achieved: "",
    role: "",
    status: "",
    dateOfBirth: "",
    emergencyContact: "",
    emergencyPhone: "",
    hireDate: "",
    salary: 0,
    commissionRate: 0,
    skills: [],
    experience: "",
    education: "",
    certifications: [],
    notes: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error(t('salesProfile.errors.loginRequired'));
        return;
      }
      
      const data = await salesApiService.getProfile();
      setProfile({
        id: data.id || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        location: data.location || data.address || "",
        bio: data.bio || data.notes || "",
        joinDate: data.joinDate || data.hireDate ? new Date(data.joinDate || data.hireDate).toISOString().split('T')[0] : "",
        avatar: data.avatar || "",
        department: data.department || "",
        position: data.position || "",
        target: data.target || "",
        achieved: data.achieved || "",
        role: data.role || "",
        status: data.status || "",
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
        emergencyContact: data.emergencyContact || "",
        emergencyPhone: data.emergencyPhone || "",
        hireDate: data.hireDate ? new Date(data.hireDate).toISOString().split('T')[0] : "",
        salary: data.salary || 0,
        commissionRate: data.commissionRate || 0,
        skills: data.skills || [],
        experience: data.experience || "",
        education: data.education || "",
        certifications: data.certifications || [],
        notes: data.notes || ""
      });
      setProfileExists(true);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        setProfileExists(false);
        setIsCreating(true);
        toast.info(t('salesProfile.errors.profileNotFound'));
      } else {
        toast.error(t('salesProfile.errors.loadFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error(t('salesProfile.errors.loginRequired'));
        return;
      }
      
      // Prepare data for backend
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth || undefined,
        emergencyContact: profile.emergencyContact,
        emergencyPhone: profile.emergencyPhone,
        department: profile.department,
        position: profile.position,
        hireDate: profile.hireDate || undefined,
        salary: profile.salary || undefined,
        commissionRate: profile.commissionRate || undefined,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        certifications: profile.certifications,
        notes: profile.notes
      };
      
      if (isCreating || !profileExists) {
        await salesApiService.createProfile(profileData);
        setIsCreating(false);
        setProfileExists(true);
        toast.success(t('salesProfile.success.profileCreated'));
      } else {
        await salesApiService.updateProfile(profileData);
        toast.success(t('salesProfile.success.profileSaved'));
      }
      
      // Reload profile data to reflect changes
      await fetchProfile();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t('salesProfile.errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout userRole="sales" userName="موظف المبيعات">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('salesProfile.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="sales" userName="موظف المبيعات">
      <div className="space-y-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('salesProfile.title')}</h1>
            <p className="text-gray-600">{t('salesProfile.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            {profileExists && (
              <div className="lg:col-span-1">
                <Card>
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="flex justify-center mb-4">
                    <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="text-lg sm:text-2xl">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{profile.name}</CardTitle>
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <Badge variant="secondary" className="text-xs">{t('salesProfile.badge.sales')}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{t('salesProfile.joinedOn')} {new Date(profile.joinDate).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                  <Separator className="my-3 sm:my-4" />
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">{t('salesProfile.fields.department')}: </span>
                      <span className="text-gray-600">{profile.department}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">{t('salesProfile.fields.position')}: </span>
                      <span className="text-gray-600">{profile.position}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">{t('salesProfile.fields.monthlyTarget')}: </span>
                      <span className="text-gray-600">{profile.target}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">{t('salesProfile.fields.achieved')}: </span>
                      <span className="text-green-600">{profile.achieved}</span>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </div>
            )}

            {/* Profile Details */}
            <div className={profileExists ? "lg:col-span-2" : "lg:col-span-3"}>
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                    <CardTitle className="text-lg sm:text-xl">{isCreating ? t('salesProfile.createTitle') : t('salesProfile.personalInfo')}</CardTitle>
                    <CardDescription className="text-sm">{isCreating ? t('salesProfile.createDescription') : t('salesProfile.updateDescription')}</CardDescription>
                  </div>
                    <div className="flex gap-2 flex-wrap">
                      {(isEditing || isCreating) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isCreating) {
                              setIsCreating(false);
                              setProfileExists(false);
                            } else {
                              setIsEditing(false);
                            }
                          }}
                          disabled={saving}
                          className="text-xs sm:text-sm"
                        >
                          {t('salesProfile.buttons.cancel')}
                        </Button>
                      )}
                      <Button
                        variant={isEditing || isCreating ? "default" : "outline"}
                        size="sm"
                        onClick={() => (isEditing || isCreating) ? handleSave() : setIsEditing(true)}
                        disabled={saving}
                        className="text-xs sm:text-sm"
                      >
                        {saving ? t('salesProfile.buttons.saving') : (isEditing || isCreating) ? (isCreating ? t('salesProfile.buttons.createProfile') : t('salesProfile.buttons.save')) : t('salesProfile.buttons.edit')}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('salesProfile.fields.firstName')}</Label>
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value, name: `${e.target.value} ${profile.lastName}`.trim()})}
                          disabled={!(isEditing || isCreating)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('salesProfile.fields.lastName')}</Label>
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value, name: `${profile.firstName} ${e.target.value}`.trim()})}
                          disabled={!(isEditing || isCreating)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm">{t('salesProfile.fields.phone')}</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          disabled={!(isEditing || isCreating)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm">{t('salesProfile.fields.address')}</Label>
                        <Input
                          id="address"
                          value={profile.address}
                          onChange={(e) => setProfile({...profile, address: e.target.value, location: e.target.value})}
                          disabled={!(isEditing || isCreating)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm">{t('salesProfile.fields.department')}</Label>
                        <Input
                          id="department"
                          value={profile.department}
                          onChange={(e) => setProfile({...profile, department: e.target.value})}
                          disabled={!(isEditing || isCreating)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position" className="text-sm">{t('salesProfile.fields.position')}</Label>
                        <Input
                          id="position"
                          value={profile.position}
                          onChange={(e) => setProfile({...profile, position: e.target.value})}
                          disabled={!(isEditing || isCreating)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm">{t('salesProfile.fields.dateOfBirth')}</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                          disabled={!(isEditing || isCreating)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hireDate" className="text-sm">{t('salesProfile.fields.hireDate')}</Label>
                        <Input
                          id="hireDate"
                          type="date"
                          value={profile.hireDate}
                          onChange={(e) => setProfile({...profile, hireDate: e.target.value})}
                          disabled={!(isEditing || isCreating)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact" className="text-sm">{t('salesProfile.fields.emergencyContact')}</Label>
                        <Input
                          id="emergencyContact"
                          value={profile.emergencyContact}
                          onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})}
                          disabled={!(isEditing || isCreating)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone" className="text-sm">{t('salesProfile.fields.emergencyPhone')}</Label>
                        <Input
                          id="emergencyPhone"
                          value={profile.emergencyPhone}
                          onChange={(e) => setProfile({...profile, emergencyPhone: e.target.value})}
                          disabled={!(isEditing || isCreating)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-sm">{t('salesProfile.fields.experience')}</Label>
                      <Textarea
                        id="experience"
                        value={profile.experience}
                        onChange={(e) => setProfile({...profile, experience: e.target.value})}
                        disabled={!(isEditing || isCreating)}
                        rows={3}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education" className="text-sm">{t('salesProfile.fields.education')}</Label>
                      <Textarea
                        id="education"
                        value={profile.education}
                        onChange={(e) => setProfile({...profile, education: e.target.value})}
                        disabled={!(isEditing || isCreating)}
                        rows={3}
                        className="text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary">{t('salesProfile.fields.salary')}</Label>
                        <Input
                          id="salary"
                          type="number"
                          value={profile.salary}
                          onChange={(e) => setProfile({...profile, salary: parseFloat(e.target.value) || 0})}
                          disabled={!(isEditing || isCreating)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="commissionRate">{t('salesProfile.fields.commissionRate')}</Label>
                        <Input
                          id="commissionRate"
                          type="number"
                          step="0.01"
                          value={profile.commissionRate}
                          onChange={(e) => setProfile({...profile, commissionRate: parseFloat(e.target.value) || 0})}
                          disabled={!(isEditing || isCreating)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">{t('salesProfile.fields.skills')}</Label>
                      <Input
                        id="skills"
                        value={Array.isArray(profile.skills) ? profile.skills.join(', ') : ''}
                        onChange={(e) => setProfile({...profile, skills: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)})}
                        disabled={!(isEditing || isCreating)}
                        placeholder={t('salesProfile.placeholders.skills')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications">{t('salesProfile.fields.certifications')}</Label>
                      <Input
                        id="certifications"
                        value={Array.isArray(profile.certifications) ? profile.certifications.join(', ') : ''}
                        onChange={(e) => setProfile({...profile, certifications: e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert)})}
                        disabled={!(isEditing || isCreating)}
                        placeholder={t('salesProfile.placeholders.certifications')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">{t('salesProfile.fields.notes')}</Label>
                      <Textarea
                        id="notes"
                        value={profile.notes}
                        onChange={(e) => setProfile({...profile, notes: e.target.value, bio: e.target.value})}
                        disabled={!(isEditing || isCreating)}
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SalesProfile;