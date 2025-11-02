import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Eye, Package, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface SkillPackage {
  id: string;
  name: string;
  description?: string;
  skills: string;
  requirements: string;
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function HRSkillPackages() {
  const { t } = useLanguage();
  const [packages, setPackages] = useState<SkillPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SkillPackage | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    skills: "",
    requirements: "",
    isDefault: false,
  });

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/skill-packages`);
      setPackages(response.data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: t('common.error'),
        description: t('admin.skillPackages.fetchError'),
        variant: "destructive"
      });
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleAdd = () => {
    setSelectedPackage(null);
    setFormData({
      name: "",
      description: "",
      skills: "",
      requirements: "",
      isDefault: false,
    });
    setIsAddOpen(true);
  };

  const handleEdit = (package_: SkillPackage) => {
    setSelectedPackage(package_);
    setFormData({
      name: package_.name,
      description: package_.description || "",
      skills: package_.skills,
      requirements: package_.requirements,
      isDefault: package_.isDefault,
    });
    setIsEditOpen(true);
  };

  const handleView = (package_: SkillPackage) => {
    setSelectedPackage(package_);
    setIsViewOpen(true);
  };

  const handleDelete = (package_: SkillPackage) => {
    setSelectedPackage(package_);
    setIsDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (selectedPackage) {
        await api.patch(`/skill-packages/${selectedPackage.id}`, formData);
        toast({
          title: t('admin.skillPackages.updateSuccess'),
          description: t('admin.skillPackages.updateSuccessDesc'),
        });
      } else {
        await api.post('/skill-packages', formData);
        toast({
          title: t('admin.skillPackages.createSuccess'),
          description: t('admin.skillPackages.createSuccessDesc'),
        });
      }
      setIsAddOpen(false);
      setIsEditOpen(false);
      setSelectedPackage(null);
      fetchPackages();
    } catch (error: any) {
      console.error('Error saving package:', error);
      const errorMessage = error.response?.data?.message || error.message || t('admin.skillPackages.saveError');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPackage) return;

    try {
      setLoading(true);
      await api.delete(`/skill-packages/${selectedPackage.id}`);
      toast({
        title: t('admin.skillPackages.deleteSuccess'),
        description: t('admin.skillPackages.deleteSuccessDesc'),
      });
      setIsDeleteOpen(false);
      setSelectedPackage(null);
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: t('common.error'),
        description: t('admin.skillPackages.deleteError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout userRole="hr" userName="HR">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('admin.skillPackages.title')}</h1>
            <p className="text-muted-foreground">{t('admin.skillPackages.subtitle')}</p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.skillPackages.addPackage')}
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.skillPackages.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center p-8">{t('common.loading')}</div>
          ) : filteredPackages.length === 0 ? (
            <div className="col-span-full text-center p-8 text-muted-foreground">
              {t('admin.skillPackages.noPackages')}
            </div>
          ) : (
            filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{pkg.name}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {pkg.isDefault && <Badge variant="outline">{t('admin.skillPackages.default')}</Badge>}
                      </div>
                    </div>
                    <Package className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    {t('admin.skillPackages.usedTimes', { count: pkg.usageCount })}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(pkg)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(pkg)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Dialog */}
        {(isAddOpen || isEditOpen) && (
          <Dialog open={isAddOpen || isEditOpen} onOpenChange={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditOpen ? t('admin.skillPackages.editPackage') : t('admin.skillPackages.addPackage')}
                </DialogTitle>
                <DialogDescription>
                  {isEditOpen ? t('admin.skillPackages.editPackageDesc') : t('admin.skillPackages.addPackageDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  <Label>{t('admin.skillPackages.name')} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('admin.skillPackages.namePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.skillPackages.description')}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('admin.skillPackages.descriptionPlaceholder')}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.skillPackages.skills')} *</Label>
                  <Textarea
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder={t('admin.skillPackages.skillsPlaceholder')}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.skillPackages.requirements')} *</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder={t('admin.skillPackages.requirementsPlaceholder')}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); setSelectedPackage(null); }}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSave} disabled={loading || !formData.name || !formData.skills || !formData.requirements}>
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* View Dialog */}
        {isViewOpen && selectedPackage && (
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedPackage.name}</DialogTitle>
                <DialogDescription>{selectedPackage.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedPackage.isDefault && <Badge variant="outline">{t('admin.skillPackages.default')}</Badge>}
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.skillPackages.skills')}</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{selectedPackage.skills}</pre>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.skillPackages.requirements')}</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{selectedPackage.requirements}</pre>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {t('admin.skillPackages.usedTimes', { count: selectedPackage.usageCount })}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  {t('common.close')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {isDeleteOpen && selectedPackage && (
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('admin.skillPackages.deletePackage')}</DialogTitle>
                <DialogDescription>
                  {t('admin.skillPackages.deleteConfirmation', { name: selectedPackage.name })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
                  {t('common.delete')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
