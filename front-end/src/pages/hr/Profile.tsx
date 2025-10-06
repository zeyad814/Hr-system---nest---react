import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Users, Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { hrApiService, type HRProfile } from "@/services/hrApi";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const HRProfilePage = () => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<HRProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    department: "",
    position: "",
    experience: "",
    education: "",
    notes: "",
    skills: [] as string[],
    certifications: [] as string[],
    emergencyContact: "",
    emergencyPhone: "",
    dateOfBirth: "",
    hireDate: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await hrApiService.getHRProfile();
      if (profileData) {
        setProfile(profileData);
        setFormData({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          department: profileData.department || "",
          position: profileData.position || "",
          experience: profileData.experience || "",
          education: profileData.education || "",
          notes: profileData.notes || "",
          skills: profileData.skills || [],
          certifications: profileData.certifications || [],
          emergencyContact: profileData.emergencyContact || "",
          emergencyPhone: profileData.emergencyPhone || "",
          dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : "",
          hireDate: profileData.hireDate ? profileData.hireDate.split('T')[0] : ""
        });
      } else {
        setIsCreating(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setIsCreating(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const profileData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth || undefined,
        hireDate: formData.hireDate || undefined
      };

      if (isCreating) {
        const newProfile = await hrApiService.createHRProfile(profileData);
        setProfile(newProfile);
        setIsCreating(false);
        toast.success(t('hr.profile.createSuccess'));
      } else {
        const updatedProfile = await hrApiService.updateHRProfile(profileData);
        setProfile(updatedProfile);
        toast.success(t('hr.profile.updateSuccess'));
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t('hr.profile.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isCreating) {
      // Reset form for creation
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        department: "",
        position: "",
        experience: "",
        education: "",
        notes: "",
        skills: [],
        certifications: [],
        emergencyContact: "",
        emergencyPhone: "",
        dateOfBirth: "",
        hireDate: ""
      });
    } else if (profile) {
      // Reset form to profile data
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        address: profile.address || "",
        department: profile.department || "",
        position: profile.position || "",
        experience: profile.experience || "",
        education: profile.education || "",
        notes: profile.notes || "",
        skills: profile.skills || [],
        certifications: profile.certifications || [],
        emergencyContact: profile.emergencyContact || "",
        emergencyPhone: profile.emergencyPhone || "",
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : "",
        hireDate: profile.hireDate ? profile.hireDate.split('T')[0] : ""
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <MainLayout userRole="hr" userName={t('hr.profile.hrEmployee')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('hr.profile.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="hr" userName={t('hr.profile.hrEmployee')}>
      <div className="space-y-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">{t('hr.profile.title')}</h1>
            <p className="text-muted-foreground">
                {isCreating ? t('hr.profile.createDescription') : t('hr.profile.manageDescription')}
              </p>
          </div>

          {isCreating ? (
            // Profile Creation Form
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle>{t('hr.profile.createProfile')}</CardTitle>
                    <CardDescription>{t('hr.profile.createProfileDescription')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('hr.profile.firstName')}</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        placeholder={t('hr.profile.firstNamePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('hr.profile.lastName')}</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        placeholder={t('hr.profile.lastNamePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('hr.profile.phone')}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder={t('hr.profile.phonePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">{t('hr.profile.address')}</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder={t('hr.profile.addressPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">{t('hr.profile.department')}</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        placeholder={t('hr.profile.departmentPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">{t('hr.profile.position')}</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        placeholder={t('hr.profile.positionPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">{t('hr.profile.dateOfBirth')}</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hireDate">{t('hr.profile.hireDate')}</Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">{t('hr.profile.experience')}</Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      placeholder={t('hr.profile.experiencePlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">{t('hr.profile.education')}</Label>
                    <Textarea
                      id="education"
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      placeholder={t('hr.profile.educationPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? t('hr.profile.saving') : t('hr.profile.createProfileButton')}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Existing Profile Display/Edit
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl">
                          {profile?.user?.name ? profile.user.name.split(' ').map(n => n[0]).join('') : 'HR'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-xl">
                      {profile?.firstName && profile?.lastName 
                        ? `${profile.firstName} ${profile.lastName}`
                        : profile?.user?.name || t('hr.profile.hrEmployee')
                      }
                    </CardTitle>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <Badge variant="secondary">{t('hr.profile.humanResources')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{profile?.user?.email || t('hr.profile.notSpecified')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{profile?.phone || t('hr.profile.notSpecified')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{profile?.address || t('hr.profile.notSpecified')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {t('hr.profile.joinedOn')} {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ar-SA') : t('hr.profile.notSpecified')}
                        </span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">{t('hr.profile.department')}: </span>
                        <span className="text-gray-600">{profile?.department || t('hr.profile.notSpecified')}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">{t('hr.profile.position')}: </span>
                        <span className="text-gray-600">{profile?.position || t('hr.profile.notSpecified')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{t('hr.profile.personalInfo')}</CardTitle>
                        <CardDescription>{t('hr.profile.updatePersonalInfo')}</CardDescription>
                      </div>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? t('common.cancel') : t('common.edit')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {isEditing ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">{t('hr.profile.firstName')}</Label>
                              <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                placeholder={t('hr.profile.firstNamePlaceholder')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">{t('hr.profile.lastName')}</Label>
                              <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                placeholder={t('hr.profile.lastNamePlaceholder')}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone">{t('hr.profile.phone')}</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder={t('hr.profile.phonePlaceholder')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address">{t('hr.profile.address')}</Label>
                              <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder={t('hr.profile.addressPlaceholder')}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="department">{t('hr.profile.department')}</Label>
                              <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                placeholder={t('hr.profile.departmentPlaceholder')}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="position">{t('hr.profile.position')}</Label>
                              <Input
                                id="position"
                                value={formData.position}
                                onChange={(e) => setFormData({...formData, position: e.target.value})}
                                placeholder={t('hr.profile.positionPlaceholder')}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="dateOfBirth">{t('hr.profile.dateOfBirth')}</Label>
                              <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="hireDate">{t('hr.profile.hireDate')}</Label>
                              <Input
                                id="hireDate"
                                type="date"
                                value={formData.hireDate}
                                onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="experience">{t('hr.profile.experience')}</Label>
                            <Textarea
                              id="experience"
                              value={formData.experience}
                              onChange={(e) => setFormData({...formData, experience: e.target.value})}
                              placeholder={t('hr.profile.experiencePlaceholder')}
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="education">{t('hr.profile.education')}</Label>
                            <Textarea
                              id="education"
                              value={formData.education}
                              onChange={(e) => setFormData({...formData, education: e.target.value})}
                              placeholder={t('hr.profile.educationPlaceholder')}
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="notes">{t('hr.profile.notes')}</Label>
                            <Textarea
                              id="notes"
                              value={formData.notes}
                              onChange={(e) => setFormData({...formData, notes: e.target.value})}
                              placeholder={t('hr.profile.notesPlaceholder')}
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button onClick={handleSave} disabled={loading}>
                              {loading ? t('hr.profile.saving') : t('hr.profile.saveChanges')}
                            </Button>
                            <Button variant="outline" onClick={handleCancel}>
                              {t('common.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">{t('hr.profile.fullName')}</Label>
                                <p className="text-gray-900 mt-1">
                                  {profile?.firstName && profile?.lastName 
                                    ? `${profile.firstName} ${profile.lastName}`
                                    : t('hr.profile.notSpecified')
                                  }
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">{t('hr.profile.phone')}</Label>
                                <p className="text-foreground mt-1">{profile?.phone || t('hr.profile.notSpecified')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">{t('hr.profile.address')}</Label>
                                <p className="text-foreground mt-1">{profile?.address || t('hr.profile.notSpecified')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">{t('hr.profile.dateOfBirth')}</Label>
                                <p className="text-gray-900 mt-1">
                                  {profile?.dateOfBirth 
                                    ? new Date(profile.dateOfBirth).toLocaleDateString('ar-SA')
                                    : t('hr.profile.notSpecified')
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">{t('hr.profile.department')}</Label>
                                <p className="text-foreground mt-1">{profile?.department || t('hr.profile.notSpecified')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">{t('hr.profile.position')}</Label>
                                <p className="text-foreground mt-1">{profile?.position || t('hr.profile.notSpecified')}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">{t('hr.profile.hireDate')}</Label>
                                <p className="text-gray-900 mt-1">
                                  {profile?.hireDate 
                                    ? new Date(profile.hireDate).toLocaleDateString('ar-SA')
                                    : t('hr.profile.notSpecified')
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {(profile?.experience || profile?.education) && (
                            <>
                              <Separator />
                              <div className="space-y-4">
                                {profile?.experience && (
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">{t('hr.profile.experience')}</Label>
                                    <p className="text-foreground mt-1 whitespace-pre-wrap">{profile.experience}</p>
                                  </div>
                                )}
                                {profile?.education && (
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">{t('hr.profile.education')}</Label>
                                    <p className="text-foreground mt-1 whitespace-pre-wrap">{profile.education}</p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {profile?.notes && (
                            <>
                              <Separator />
                              <div>
                                <Label className="text-sm font-medium text-gray-700">{t('hr.profile.notes')}</Label>
                                <p className="text-foreground mt-1 whitespace-pre-wrap">{profile.notes}</p>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HRProfilePage;