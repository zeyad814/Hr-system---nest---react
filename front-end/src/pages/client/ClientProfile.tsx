import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  FileText, 
  DollarSign, 
  StickyNote, 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { clientApiService, Client, Contract, Revenue, Note, Reminder } from "@/services/clientApi";

const ClientProfile = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Client | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddContract, setShowAddContract] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const { toast } = useToast();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    description: '',
    logo: '',
    establishedYear: undefined as number | undefined,
    employees: '',
    revenue: ''
  });

  const [contractForm, setContractForm] = useState({
    title: '',
    description: '',
    type: 'RECRUITMENT' as 'RECRUITMENT' | 'CONSULTING' | 'TRAINING' | 'RETAINER',
    status: 'DRAFT' as 'DRAFT' | 'PENDING' | 'SIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED',
    value: 0,
    currency: 'USD',
    startDate: '',
    endDate: '',
    commission: 0,
    commissionType: '',
    assignedTo: '',
    jobTitle: '',
    progress: 0,
    paymentStatus: ''
  });

  const [revenueForm, setRevenueForm] = useState({
    amount: 0,
    periodMonth: undefined as number | undefined,
    periodYear: undefined as number | undefined
  });

  const [noteForm, setNoteForm] = useState({
    content: ''
  });

  const [reminderForm, setReminderForm] = useState({
    title: '',
    remindAt: '',
    done: false
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, contractsData, revenuesData, notesData, remindersData] = await Promise.all([
        clientApiService.getProfile(),
        clientApiService.getContracts(),
        clientApiService.getRevenues(),
        clientApiService.getNotes(),
        clientApiService.getReminders()
      ]);
      
      setProfile(profileData);
      // Ensure all form fields have proper default values to prevent controlled/uncontrolled input warnings
      setProfileForm({
        name: profileData?.name || '',
        companyName: profileData?.companyName || '',
        companySize: profileData?.companySize || '',
        industry: profileData?.industry || '',
        website: profileData?.website || '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
        address: profileData?.address || '',
        location: profileData?.location || '',
        description: profileData?.description || '',
        logo: profileData?.logo || '',
        establishedYear: profileData?.establishedYear || undefined,
        employees: profileData?.employees || '',
        revenue: profileData?.revenue || ''
      });
      setContracts(contractsData);
      setRevenues(revenuesData);
      setNotes(notesData);
      setReminders(remindersData);
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast({
        title: t('common.error'),
        description: t('client.profile.loadError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await clientApiService.updateProfile(profileForm);
      // Reload all profile data to ensure consistency
      await loadProfileData();
      setEditingProfile(false);
      toast({
        title: t('common.success'),
        description: t('client.profile.updateSuccess'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('common.error'),
        description: t('client.profile.updateError'),
        variant: "destructive",
      });
    }
  };

  const handleAddContract = async () => {
    try {
      if (!profile?.id) {
        toast({
          title: t('common.error'),
          description: t('client.profile.clientIdNotFound'),
          variant: "destructive",
        });
        return;
      }
      const newContract = await clientApiService.addContract(profile.id, contractForm);
      setContracts([...contracts, newContract]);
      setContractForm({
        title: '',
        description: '',
        type: 'RECRUITMENT' as 'RECRUITMENT' | 'CONSULTING' | 'TRAINING' | 'RETAINER',
        status: 'DRAFT' as 'DRAFT' | 'PENDING' | 'SIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED',
        value: 0,
        currency: 'USD',
        startDate: '',
        endDate: '',
        commission: 0,
        commissionType: '',
        assignedTo: '',
        jobTitle: '',
        progress: 0,
        paymentStatus: ''
      });
      setShowAddContract(false);
      toast({
        title: t('common.success'),
        description: t('client.contracts.addSuccess'),
      });
    } catch (error) {
      console.error('Error adding contract:', error);
      toast({
        title: t('common.error'),
        description: t('client.contracts.addError'),
        variant: "destructive",
      });
    }
  };

  const handleAddRevenue = async () => {
    try {
      if (!profile?.id) {
        toast({
          title: t('common.error'),
          description: t('client.profile.clientIdNotFound'),
          variant: "destructive",
        });
        return;
      }
      const newRevenue = await clientApiService.addRevenue(profile.id, revenueForm);
      setRevenues([...revenues, newRevenue]);
      setRevenueForm({
        amount: 0,
        periodMonth: undefined,
        periodYear: undefined
      });
      setShowAddRevenue(false);
      toast({
        title: t('common.success'),
        description: t('client.revenue.addSuccess'),
      });
    } catch (error) {
      console.error('Error adding revenue:', error);
      toast({
        title: t('common.error'),
        description: t('client.revenue.addError'),
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async () => {
    try {
      if (!profile?.id) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على معرف العميل",
          variant: "destructive",
        });
        return;
      }
      const newNote = await clientApiService.addNote(profile.id, noteForm.content);
      setNotes([...notes, newNote]);
      setNoteForm({ content: '' });
      setShowAddNote(false);
      toast({
        title: t('common.success'),
        description: t('client.notes.addSuccess'),
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: t('common.error'),
        description: t('client.notes.addError'),
        variant: "destructive",
      });
    }
  };

  const handleAddReminder = async () => {
    try {
      if (!profile?.id) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على معرف العميل",
          variant: "destructive",
        });
        return;
      }
      const newReminder = await clientApiService.addReminder(profile.id, {
        title: reminderForm.title,
        remindAt: reminderForm.remindAt
      });
      setReminders([...reminders, newReminder]);
      setReminderForm({ title: '', remindAt: '', done: false });
      setShowAddReminder(false);
      toast({
        title: t('common.success'),
        description: t('client.reminders.addSuccess'),
      });
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: t('common.error'),
        description: t('client.reminders.addError'),
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "نشط":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
      case "مكتمل":
        return "bg-blue-100 text-blue-800";
      case "EXPIRED":
      case "CANCELLED":
      case "منتهي":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SIGNED":
        return "bg-purple-100 text-purple-800";
      case "عالي":
        return "bg-destructive text-destructive-foreground";
      case "متوسط":
        return "bg-warning text-warning-foreground";
      case "منخفض":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return t('client.contracts.status.draft');
      case "PENDING":
        return t('client.contracts.status.pending');
      case "SIGNED":
        return t('client.contracts.status.signed');
      case "ACTIVE":
        return t('client.contracts.status.active');
      case "COMPLETED":
        return t('client.contracts.status.completed');
      case "CANCELLED":
        return t('client.contracts.status.cancelled');
      case "EXPIRED":
        return t('client.contracts.status.expired');
      default:
        return status;
    }
  };

  return (
    <MainLayout userRole="client" userName={profile?.name || t('client.profile.defaultUserName')}>
      <div className="space-y-6" dir="rtl">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('client.profile.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('client.profile.subtitle')}
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('client.profile.tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('client.profile.tabs.contracts')}
            </TabsTrigger>
            <TabsTrigger value="revenues" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('client.profile.tabs.revenues')}
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              {t('client.profile.tabs.notes')}
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t('client.profile.tabs.reminders')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="crm-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t('client.profile.personalInfo')}
                  </CardTitle>
                  <Button
                    variant={editingProfile ? "outline" : "default"}
                    onClick={() => {
                      if (editingProfile) {
                        setProfileForm({
                          name: profile?.name || '',
                          companyName: profile?.companyName || '',
                          companySize: profile?.companySize || '',
                          industry: profile?.industry || '',
                          website: profile?.website || '',
                          email: profile?.email || '',
                          phone: profile?.phone || '',
                          address: profile?.address || '',
                          location: profile?.location || '',
                          description: profile?.description || '',
                          logo: profile?.logo || '',
                          establishedYear: profile?.establishedYear,
                          employees: profile?.employees || '',
                          revenue: profile?.revenue || ''
                        });
                      }
                      setEditingProfile(!editingProfile);
                    }}
                    className="gap-2"
                  >
                    {editingProfile ? (
                      <>
                        <X className="h-4 w-4" />
                        {t('common.cancel')}
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        {t('common.edit')}
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('client.profile.fields.name')}</Label>
                      {editingProfile ? (
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.name || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('client.profile.fields.email')}</Label>
                      {editingProfile ? (
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.email || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('client.profile.fields.phone')}</Label>
                      {editingProfile ? (
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.phone || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">{t('client.profile.fields.companyName')}</Label>
                      {editingProfile ? (
                        <Input
                          id="companyName"
                          value={profileForm.companyName}
                          onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.companyName || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">{t('client.profile.fields.industry')}</Label>
                      {editingProfile ? (
                        <Input
                          id="industry"
                          value={profileForm.industry}
                          onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.industry || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">{t('client.profile.fields.website')}</Label>
                      {editingProfile ? (
                        <Input
                          id="website"
                          value={profileForm.website}
                          onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.website || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companySize">{t('client.profile.fields.companySize')}</Label>
                      {editingProfile ? (
                        <Input
                          id="companySize"
                          value={profileForm.companySize}
                          onChange={(e) => setProfileForm({ ...profileForm, companySize: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.companySize || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">{t('client.profile.fields.address')}</Label>
                      {editingProfile ? (
                        <Input
                          id="address"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.address || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">{t('client.profile.fields.location')}</Label>
                      {editingProfile ? (
                        <Input
                          id="location"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.location || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="establishedYear">{t('client.profile.fields.establishedYear')}</Label>
                      {editingProfile ? (
                        <Input
                          id="establishedYear"
                          type="number"
                          value={profileForm.establishedYear || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setProfileForm({ 
                              ...profileForm, 
                              establishedYear: value ? parseInt(value) : undefined 
                            });
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.establishedYear || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employees">{t('client.profile.fields.employees')}</Label>
                      {editingProfile ? (
                        <Input
                          id="employees"
                          value={profileForm.employees}
                          onChange={(e) => setProfileForm({ ...profileForm, employees: e.target.value })}
                          placeholder={t('client.profile.placeholders.employees')}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.employees || t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="revenue">{t('client.profile.fields.revenue')}</Label>
                      {editingProfile ? (
                        <Input
                          id="revenue"
                          value={profileForm.revenue}
                          onChange={(e) => setProfileForm({ ...profileForm, revenue: e.target.value })}
                          placeholder={t('client.profile.placeholders.revenue')}
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.revenue ? `$${profile.revenue.toLocaleString()}` : t('common.notSpecified')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">{t('client.profile.fields.description')}</Label>
                      {editingProfile ? (
                        <Textarea
                          id="description"
                          value={profileForm.description}
                          onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                          rows={3}
                        />
                      ) : (
                        <div className="p-2 border rounded min-h-[80px]">
                          <span>{profile?.description || t('client.profile.noDescription')}</span>
                        </div>
                      )}
                    </div>

                    {editingProfile && (
                      <div className="md:col-span-2 flex justify-end gap-2">
                        <Button onClick={handleUpdateProfile} className="gap-2">
                          <Save className="h-4 w-4" />
                          {t('common.saveChanges')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <Card className="crm-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t('client.contracts.title')}
                  </CardTitle>
                  <Dialog open={showAddContract} onOpenChange={setShowAddContract}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('client.contracts.addContract')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('client.contracts.addNewContract')}</DialogTitle>
                        <DialogDescription>
                          {t('client.contracts.enterContractDetails')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="contract-title">{t('client.contracts.fields.title')}</Label>
                          <Input
                            id="contract-title"
                            value={contractForm.title}
                            onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                            placeholder={t('client.contracts.placeholders.title')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contract-description">{t('client.contracts.fields.description')}</Label>
                          <Textarea
                            id="contract-description"
                            value={contractForm.description}
                            onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                            placeholder={t('client.contracts.placeholders.description')}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contract-type">{t('client.contracts.fields.type')}</Label>
                          <Select value={contractForm.type} onValueChange={(value) => setContractForm({ ...contractForm, type: value as any })}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('client.contracts.placeholders.type')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RECRUITMENT">{t('client.contracts.types.recruitment')}</SelectItem>
                              <SelectItem value="CONSULTING">{t('client.contracts.types.consulting')}</SelectItem>
                              <SelectItem value="TRAINING">{t('client.contracts.types.training')}</SelectItem>
                              <SelectItem value="RETAINER">{t('client.contracts.types.retainer')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contract-value">{t('client.contracts.fields.value')}</Label>
                            <Input
                              id="contract-value"
                              type="number"
                              value={contractForm.value}
                              onChange={(e) => setContractForm({ ...contractForm, value: parseFloat(e.target.value) || 0 })}
                              placeholder={t('client.contracts.placeholders.value')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contract-currency">{t('client.contracts.fields.currency')}</Label>
                            <Select value={contractForm.currency} onValueChange={(value) => setContractForm({ ...contractForm, currency: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('client.contracts.placeholders.currency')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SAR">{t('client.contracts.currencies.sar')}</SelectItem>
                                <SelectItem value="USD">{t('client.contracts.currencies.usd')}</SelectItem>
                                <SelectItem value="EUR">{t('client.contracts.currencies.eur')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contract-start">{t('client.contracts.fields.startDate')}</Label>
                            <Input
                              id="contract-start"
                              type="date"
                              value={contractForm.startDate}
                              onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contract-end">{t('client.contracts.fields.endDate')}</Label>
                            <Input
                              id="contract-end"
                              type="date"
                              value={contractForm.endDate}
                              onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contract-commission">{t('client.contracts.fields.commission')}</Label>
                            <Input
                              id="contract-commission"
                              type="number"
                              step="0.01"
                              value={contractForm.commission}
                              onChange={(e) => setContractForm({ ...contractForm, commission: parseFloat(e.target.value) || 0 })}
                              placeholder={t('client.contracts.placeholders.commission')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contract-commission-type">{t('client.contracts.fields.commissionType')}</Label>
                            <Select value={contractForm.commissionType} onValueChange={(value) => setContractForm({ ...contractForm, commissionType: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('client.contracts.placeholders.commissionType')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="نسبة مئوية">{t('client.contracts.commissionTypes.percentage')}</SelectItem>
                                <SelectItem value="مبلغ ثابت">{t('client.contracts.commissionTypes.fixed')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contract-assigned-to">{t('client.contracts.fields.assignedTo')}</Label>
                            <Input
                              id="contract-assigned-to"
                              value={contractForm.assignedTo}
                              onChange={(e) => setContractForm({ ...contractForm, assignedTo: e.target.value })}
                              placeholder={t('client.contracts.placeholders.assignedTo')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contract-job-title">{t('client.contracts.fields.jobTitle')}</Label>
                            <Input
                              id="contract-job-title"
                              value={contractForm.jobTitle}
                              onChange={(e) => setContractForm({ ...contractForm, jobTitle: e.target.value })}
                              placeholder={t('client.contracts.placeholders.jobTitle')}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contract-progress">{t('client.contracts.fields.progress')}</Label>
                            <Input
                              id="contract-progress"
                              type="number"
                              min="0"
                              max="100"
                              value={contractForm.progress}
                              onChange={(e) => setContractForm({ ...contractForm, progress: parseInt(e.target.value) || 0 })}
                              placeholder="0-100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contract-status">{t('client.contracts.fields.status')}</Label>
                            <Select value={contractForm.status} onValueChange={(value) => setContractForm({ ...contractForm, status: value as 'DRAFT' | 'PENDING' | 'SIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' })}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('client.contracts.placeholders.status')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DRAFT">{t('client.contracts.statuses.draft')}</SelectItem>
                                <SelectItem value="PENDING">{t('client.contracts.statuses.pending')}</SelectItem>
                                <SelectItem value="SIGNED">{t('client.contracts.statuses.signed')}</SelectItem>
                                <SelectItem value="ACTIVE">{t('client.contracts.statuses.active')}</SelectItem>
                                <SelectItem value="COMPLETED">{t('client.contracts.statuses.completed')}</SelectItem>
                                <SelectItem value="CANCELLED">{t('client.contracts.statuses.cancelled')}</SelectItem>
                                <SelectItem value="EXPIRED">{t('client.contracts.statuses.expired')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contract-payment-status">{t('client.contracts.fields.paymentStatus')}</Label>
                            <Select value={contractForm.paymentStatus} onValueChange={(value) => setContractForm({ ...contractForm, paymentStatus: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('client.contracts.placeholders.paymentStatus')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="مدفوع">{t('client.contracts.paymentStatuses.paid')}</SelectItem>
                                <SelectItem value="غير مدفوع">{t('client.contracts.paymentStatuses.unpaid')}</SelectItem>
                                <SelectItem value="مدفوع جزئياً">{t('client.contracts.paymentStatuses.partiallyPaid')}</SelectItem>
                                <SelectItem value="متأخر">{t('client.contracts.paymentStatuses.overdue')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddContract(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={handleAddContract}>
                            {t('client.contracts.addContract')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`contract-skeleton-${index}`} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))
                  ) : contracts.length > 0 ? (
                    contracts.map((contract) => (
                      <div key={contract.id} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{contract.title}</h4>
                            {contract.type && (
                              <span className="text-xs text-muted-foreground">{contract.type}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(contract.status)}>
                              {getStatusText(contract.status)}
                            </Badge>
                            {contract.paymentStatus && (
                              <Badge variant="outline">
                                {contract.paymentStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{contract.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                          <div>
                            <span className="font-medium">
                              {contract.value?.toLocaleString()} {contract.currency || 'SAR'}
                            </span>
                            {contract.commission && (
                              <div className="text-xs text-muted-foreground">
                                {t('client.contracts.commission')}: {contract.commission} {contract.commissionType === 'نسبة مئوية' ? '%' : contract.currency || 'SAR'}
                              </div>
                            )}
                          </div>
                          <div className="text-left">
                            {contract.progress !== undefined && (
                              <div className="text-xs text-muted-foreground mb-1">
                                {t('client.contracts.progress')}: {contract.progress}%
                              </div>
                            )}
                            <span className="text-muted-foreground text-xs">
                              {new Date(contract.startDate).toLocaleDateString('ar-SA')} - {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        </div>
                        {(contract.assignedTo || contract.jobTitle) && (
                          <div className="text-xs text-muted-foreground border-t pt-2">
                            {t('client.contracts.assignedTo')}: {contract.assignedTo} {contract.jobTitle && `(${contract.jobTitle})`}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t('client.contracts.noContracts')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenues Tab */}
          <TabsContent value="revenues">
            <Card className="crm-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    {t('client.revenues.title')}
                  </CardTitle>
                  <Dialog open={showAddRevenue} onOpenChange={setShowAddRevenue}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('client.revenues.addRevenue')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('client.revenues.addNewRevenue')}</DialogTitle>
                        <DialogDescription>
                          {t('client.revenues.enterRevenueDetails')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">

                        <div className="space-y-2">
                          <Label htmlFor="revenue-amount">{t('client.revenues.fields.amount')}</Label>
                          <Input
                            id="revenue-amount"
                            type="number"
                            step="0.01"
                            value={revenueForm.amount}
                            onChange={(e) => setRevenueForm({ ...revenueForm, amount: parseFloat(e.target.value) || 0 })}
                            placeholder={t('client.revenues.placeholders.amount')}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="revenue-month">{t('client.revenues.fields.month')}</Label>
                            <Select value={revenueForm.periodMonth?.toString() || ''} onValueChange={(value) => setRevenueForm({ ...revenueForm, periodMonth: parseInt(value) })}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('client.revenues.placeholders.month')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">{t('common.months.january')}</SelectItem>
                                <SelectItem value="2">{t('common.months.february')}</SelectItem>
                                <SelectItem value="3">{t('common.months.march')}</SelectItem>
                                <SelectItem value="4">{t('common.months.april')}</SelectItem>
                                <SelectItem value="5">{t('common.months.may')}</SelectItem>
                                <SelectItem value="6">{t('common.months.june')}</SelectItem>
                                <SelectItem value="7">{t('common.months.july')}</SelectItem>
                                <SelectItem value="8">{t('common.months.august')}</SelectItem>
                                <SelectItem value="9">{t('common.months.september')}</SelectItem>
                                <SelectItem value="10">{t('common.months.october')}</SelectItem>
                                <SelectItem value="11">{t('common.months.november')}</SelectItem>
                                <SelectItem value="12">{t('common.months.december')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="revenue-year">{t('client.revenues.fields.year')}</Label>
                            <Input
                              id="revenue-year"
                              type="number"
                              value={revenueForm.periodYear || ''}
                              onChange={(e) => setRevenueForm({ ...revenueForm, periodYear: parseInt(e.target.value) || new Date().getFullYear() })}
                              placeholder={t('client.revenues.placeholders.year')}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddRevenue(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={handleAddRevenue}>
                            {t('client.revenues.addRevenue')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`revenue-skeleton-${index}`} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))
                  ) : revenues.length > 0 ? (
                    revenues.map((revenue) => (
                      <div key={revenue.id} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{t('client.revenues.revenue')}</h4>
                          <span className="font-bold text-green-600">
                            {revenue.amount?.toLocaleString()} ريال
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {revenue.periodMonth}/{revenue.periodYear}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t('client.revenues.noRevenues')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card className="crm-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5 text-primary" />
                    {t('client.notes.title')}
                  </CardTitle>
                  <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('client.notes.addNote')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('client.notes.addNewNote')}</DialogTitle>
                        <DialogDescription>
                          {t('client.notes.addNoteDescription')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="note-content">{t('client.notes.fields.content')}</Label>
                          <Textarea
                            id="note-content"
                            value={noteForm.content}
                            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                            placeholder={t('client.notes.placeholders.content')}
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddNote(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={handleAddNote}>
                            {t('client.notes.addNote')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`note-skeleton-${index}`} className="p-4 border border-border rounded-lg">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))
                  ) : notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note.id} className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t('client.notes.noNotes')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <Card className="crm-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    {t('client.reminders.title')}
                  </CardTitle>
                  <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('client.reminders.addReminder')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('client.reminders.addNewReminder')}</DialogTitle>
                        <DialogDescription>
                          {t('client.reminders.addReminderDescription')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reminder-title">{t('client.reminders.fields.title')}</Label>
                          <Input
                            id="reminder-title"
                            value={reminderForm.title}
                            onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                            placeholder={t('client.reminders.placeholders.title')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reminder-date">{t('client.reminders.fields.dateTime')}</Label>
                          <Input
                            id="reminder-date"
                            type="datetime-local"
                            value={reminderForm.remindAt}
                            onChange={(e) => setReminderForm({ ...reminderForm, remindAt: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="reminder-done"
                            checked={reminderForm.done}
                            onChange={(e) => setReminderForm({ ...reminderForm, done: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="reminder-done">{t('client.reminders.fields.completed')}</Label>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddReminder(false)}>
                            {t('common.cancel')}
                          </Button>
                          <Button onClick={handleAddReminder}>
                            {t('client.reminders.addReminder')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`reminder-skeleton-${index}`} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))
                  ) : reminders.length > 0 ? (
                    reminders.map((reminder) => (
                      <div key={reminder.id} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{reminder.title}</h4>
                          <Badge className={reminder.done ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {reminder.done ? t('client.reminders.statuses.completed') : t('client.reminders.statuses.pending')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(reminder.remindAt).toLocaleString('ar-SA')}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t('client.reminders.noReminders')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ClientProfile;