import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell,
} from "@/components/ui/responsive-table";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Building2,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ClientItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: "NEW" | "NEGOTIATION" | "SIGNED" | "NOT_INTERESTED" | string;
  createdAt?: string;
  jobsCount?: number;
  revenue?: string | number;
  address?: string;
  website?: string;
  description?: string;
  contactPerson?: string;
  industry?: string;
}

const AdminClients = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientItem>>({});
  const [clientToDelete, setClientToDelete] = useState<ClientItem | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/clients");
      setClients(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddClient = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'NEW',
      address: '',
      website: '',
      description: '',
      contactPerson: '',
      industry: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClient = (client: ClientItem) => {
    setEditingClient(client);
    setFormData({ ...client });
    setIsEditDialogOpen(true);
  };

  const handleSaveClient = async () => {
    try {
      setLoading(true);
      if (editingClient) {
        // Update existing client
        await api.put(`/clients/${editingClient.id}`, formData);
        toast.success(t('admin.clients.saveSuccess'));
      } else {
        // Create new client
        await api.post('/clients', formData);
        toast.success(t('admin.clients.createSuccess'));
      }
      loadClients();
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      setEditingClient(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(editingClient ? t('admin.clients.updateError') : t('admin.clients.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      setLoading(true);
      await api.delete(`/clients/${clientToDelete.id}`);
      toast.success(t('admin.clients.deleteSuccess'));
      loadClients();
      setClientToDelete(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(t('admin.clients.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-secondary text-secondary-foreground";
      case "NEGOTIATION":
        return "bg-warning text-warning-foreground";
      case "SIGNED":
        return "bg-emerald-100 text-emerald-700";
      case "NOT_INTERESTED":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(query.toLowerCase()) || c.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <MainLayout userRole="admin" userName="محمد أحمد">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">{t('admin.clients.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t('admin.clients.subtitle')}</p>
          </div>
          <Button className="gap-1 sm:gap-2 text-sm sm:text-base w-full sm:w-auto" onClick={handleAddClient} disabled={loading}>
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            {t('admin.clients.addClient')}
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                  <Input
                    placeholder={t('admin.clients.searchPlaceholder')}
                    className="pr-10 text-sm sm:text-base"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-1 sm:gap-2 text-sm sm:text-base w-full sm:w-auto">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('admin.clients.filter')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="break-words">{t('admin.clients.clientsList')} ({filtered.length})</span>
              {loading && <span className="text-xs text-muted-foreground">{t('admin.clients.loading')}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead className="text-xs sm:text-sm">{t('admin.clients.company')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('admin.clients.contactInfo')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-xs sm:text-sm hidden lg:table-cell">{t('admin.clients.createdDate')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-xs sm:text-sm">{t('admin.clients.status')}</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-xs sm:text-sm">{t('admin.clients.actions')}</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                {filtered.map((client) => (
                  <ResponsiveTableRow 
                    key={client.id} 
                    headers={[t('admin.clients.company'), t('admin.clients.contactInfo'), t('admin.clients.createdDate'), t('admin.clients.status'), t('admin.clients.actions')]}
                  >
                    <ResponsiveTableCell className="p-2 sm:p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs sm:text-sm truncate">{client.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">ID: {client.id.slice(0, 8)}...</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">ID: {client.id}</div>
                          {/* Mobile contact info */}
                          <div className="sm:hidden mt-1 space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-2 w-2 text-muted-foreground" />
                              <span className="truncate">{client.email || t('common.notAvailable')}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-2 w-2 text-muted-foreground" />
                              <span className="truncate">{client.phone || t('common.notAvailable')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell className="hidden sm:table-cell p-2 sm:p-4">
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{client.email || t('common.notAvailable')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{client.phone || t('common.notAvailable')}</span>
                        </div>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell className="hidden lg:table-cell p-2 sm:p-4">
                      <div className="flex items-center gap-1 text-xs sm:text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : t('common.notAvailable')}</span>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell className="p-2 sm:p-4">
                      <Badge className={`${getStatusColor(client.status)} text-xs px-1 sm:px-2 py-0.5`}>
                        {client.status}
                      </Badge>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell className="p-2 sm:p-4">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Link to={`/admin/clients/${client.id}`}>
                          <Button size="sm" variant="outline" className="h-6 w-6 sm:h-7 sm:w-7 p-0">
                            <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                          onClick={() => handleEditClient(client)}
                          disabled={loading}
                        >
                          <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => setClientToDelete(client)}
                          disabled={loading}
                        >
                          <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                    </ResponsiveTableCell>
                  </ResponsiveTableRow>
                  ))}
              </ResponsiveTableBody>
            </ResponsiveTable>
          </CardContent>
        </Card>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('admin.clients.addClient')}</DialogTitle>
            <DialogDescription>
              {t('admin.clients.addClientDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('admin.clients.name')} *
              </Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.namePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t('admin.clients.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.emailPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                {t('admin.clients.phone')}
              </Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.phonePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPerson" className="text-right">
                {t('admin.clients.contactPerson')}
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.contactPersonPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="industry" className="text-right">
                {t('admin.clients.industry')}
              </Label>
              <Input
                id="industry"
                value={formData.industry || ''}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.industryPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                {t('admin.clients.website')}
              </Label>
              <Input
                id="website"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.websitePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                {t('admin.clients.address')}
              </Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.addressPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('admin.clients.description')}
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.descriptionPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t('admin.clients.status')}
              </Label>
              <Select value={formData.status || 'NEW'} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('admin.clients.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">{t('admin.clients.statusNew')}</SelectItem>
                  <SelectItem value="NEGOTIATION">{t('admin.clients.statusNegotiation')}</SelectItem>
                  <SelectItem value="SIGNED">{t('admin.clients.statusSigned')}</SelectItem>
                  <SelectItem value="NOT_INTERESTED">{t('admin.clients.statusNotInterested')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveClient} disabled={loading || !formData.name}>
              {loading ? t('common.saving') : t('admin.clients.addClient')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('admin.clients.editClient')}</DialogTitle>
            <DialogDescription>
              {t('admin.clients.editClientDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                {t('admin.clients.name')} *
              </Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.namePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                {t('admin.clients.email')}
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.emailPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                {t('admin.clients.phone')}
              </Label>
              <Input
                id="edit-phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.phonePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contactPerson" className="text-right">
                {t('admin.clients.contactPerson')}
              </Label>
              <Input
                id="edit-contactPerson"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.contactPersonPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-industry" className="text-right">
                {t('admin.clients.industry')}
              </Label>
              <Input
                id="edit-industry"
                value={formData.industry || ''}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.industryPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-website" className="text-right">
                {t('admin.clients.website')}
              </Label>
              <Input
                id="edit-website"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.websitePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                {t('admin.clients.address')}
              </Label>
              <Textarea
                id="edit-address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.addressPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                {t('admin.clients.description')}
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder={t('admin.clients.descriptionPlaceholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                {t('admin.clients.status')}
              </Label>
              <Select value={formData.status || 'NEW'} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('admin.clients.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">{t('admin.clients.statusNew')}</SelectItem>
                  <SelectItem value="NEGOTIATION">{t('admin.clients.statusNegotiation')}</SelectItem>
                  <SelectItem value="SIGNED">{t('admin.clients.statusSigned')}</SelectItem>
                  <SelectItem value="NOT_INTERESTED">{t('admin.clients.statusNotInterested')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveClient} disabled={loading || !formData.name}>
              {loading ? t('common.saving') : t('admin.clients.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.clients.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.clients.deleteWarning').replace('{name}', clientToDelete?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {loading ? t('common.deleting') : t('admin.clients.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default AdminClients;