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
import { 
  MapPin, 
  Plus,
  Edit,
  Trash2,
  Users,
  FileText,
  Settings,
  Save,
  X,
  Building
} from "lucide-react";

interface Location {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  jobCount: number;
  createdAt: string;
  updatedAt: string;
}

const ClientLocations = () => {
  const { t, isRTL } = useLanguage();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: ""
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      // Load from localStorage
      const stored = localStorage.getItem('client_locations');
      if (stored) {
        const parsedLocations = JSON.parse(stored);
        setLocations(parsedLocations);
      } else {
        // Initialize with default locations
        const defaultLocations: Location[] = [
          {
            id: "1",
            name: "دبي - الإمارات",
            description: "مكتب دبي الرئيسي في برج خليفة",
            address: "برج خليفة، دبي مول، دبي",
            city: "دبي",
            country: "الإمارات العربية المتحدة",
            jobCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "الرياض - السعودية",
            description: "مكتب الرياض في مركز الملك عبدالله المالي",
            address: "مركز الملك عبدالله المالي، الرياض",
            city: "الرياض",
            country: "المملكة العربية السعودية",
            jobCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "3",
            name: "القاهرة - مصر",
            description: "مكتب القاهرة في مدينة نصر",
            address: "مدينة نصر، القاهرة",
            city: "القاهرة",
            country: "مصر",
            jobCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setLocations(defaultLocations);
        localStorage.setItem('client_locations', JSON.stringify(defaultLocations));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المواقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الموقع",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingLocation) {
        // Update existing location
        const updatedLocation = {
          ...editingLocation,
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          updatedAt: new Date().toISOString()
        };
        
        const updatedLocations = locations.map(loc => 
          loc.id === editingLocation.id ? updatedLocation : loc
        );
        setLocations(updatedLocations);
        localStorage.setItem('client_locations', JSON.stringify(updatedLocations));
        
        toast({
          title: "تم التحديث",
          description: "تم تحديث الموقع بنجاح",
        });
        
        setIsEditDialogOpen(false);
      } else {
        // Add new location
        const newLocation: Location = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          jobCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const updatedLocations = [...locations, newLocation];
        setLocations(updatedLocations);
        localStorage.setItem('client_locations', JSON.stringify(updatedLocations));
        
        toast({
          title: "تم الإضافة",
          description: "تم إضافة الموقع بنجاح",
        });
        
        setIsAddDialogOpen(false);
      }
      
      // Reset form
      setFormData({ name: "", description: "", address: "", city: "", country: "" });
      setEditingLocation(null);
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الموقع",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description,
      address: location.address,
      city: location.city,
      country: location.country
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (locationId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموقع؟")) {
      return;
    }

    try {
      const updatedLocations = locations.filter(loc => loc.id !== locationId);
      setLocations(updatedLocations);
      localStorage.setItem('client_locations', JSON.stringify(updatedLocations));
      
      toast({
        title: "تم الحذف",
        description: "تم حذف الموقع بنجاح",
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الموقع",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", address: "", city: "", country: "" });
    setEditingLocation(null);
  };

  return (
    <MainLayout userRole="client" userName={t('client.dashboard.defaultUserName')}>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Page Header */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold text-foreground">إدارة المواقع</h1>
          </div>
          <p className="text-muted-foreground text-lg">إدارة مواقع العمل والشركات التابعة</p>
        </div>

        {/* Add Location Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">المواقع ({locations.length})</h2>
            <p className="text-muted-foreground">إدارة مواقع العمل والشركات</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة موقع جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  إضافة موقع جديد
                </DialogTitle>
                <DialogDescription>
                  أضف موقع عمل جديد مع التفاصيل الكاملة
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم الموقع <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    placeholder="أدخل اسم الموقع"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">وصف الموقع</Label>
                  <Textarea
                    id="description"
                    placeholder="أدخل وصف مفصل للموقع"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      placeholder="أدخل اسم المدينة"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country">الدولة</Label>
                    <Input
                      id="country"
                      placeholder="أدخل اسم الدولة"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">العنوان التفصيلي</Label>
                  <Textarea
                    id="address"
                    placeholder="أدخل العنوان التفصيلي للموقع"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
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

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-200"
                      onClick={() => handleEdit(location)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50 hover:border-red-200"
                      onClick={() => handleDelete(location.id)}
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
                  <Badge variant="secondary">{location.jobCount}</Badge>
                </div>
                
                {/* City & Country */}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {location.city}, {location.country}
                  </span>
                </div>
                
                {/* Description */}
                {location.description && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">الوصف:</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {location.description}
                    </p>
                  </div>
                )}
                
                {/* Address */}
                {location.address && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">العنوان:</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {location.address}
                    </p>
                  </div>
                )}
                
                {/* Updated Date */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  آخر تحديث: {new Date(location.updatedAt).toLocaleDateString('ar-SA')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Location Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                تعديل الموقع
              </DialogTitle>
              <DialogDescription>
                تعديل معلومات الموقع والتفاصيل
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">اسم الموقع <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-name"
                  placeholder="أدخل اسم الموقع"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">وصف الموقع</Label>
                <Textarea
                  id="edit-description"
                  placeholder="أدخل وصف مفصل للموقع"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-city">المدينة</Label>
                  <Input
                    id="edit-city"
                    placeholder="أدخل اسم المدينة"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-country">الدولة</Label>
                  <Input
                    id="edit-country"
                    placeholder="أدخل اسم الدولة"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-address">العنوان التفصيلي</Label>
                <Textarea
                  id="edit-address"
                  placeholder="أدخل العنوان التفصيلي للموقع"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
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

export default ClientLocations;
