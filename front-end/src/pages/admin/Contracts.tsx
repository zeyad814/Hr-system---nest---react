import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell,
} from "@/components/ui/responsive-table";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  DollarSign,
  Calendar,
  Building2,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { contractsApi, Contract, ContractQuery } from "@/services/contractsApi";
import { toast } from "sonner";
import api from "@/lib/api";
import { useCallback as useReactCallback } from "react";

type SimpleClient = { id: string; name: string; email: string };

type CreateContractForm = {
  clientId: string;
  title: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  value: string;
  description: string;
};

const AdminContracts = () => {
  const { t, language } = useLanguage();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const itemsPerPage = 10;

  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateContractForm>({
    clientId: "",
    title: "",
    employeeId: "",
    type: "",
    startDate: "",
    endDate: "",
    value: "",
    description: "",
  });

  // View/Edit state
  const [viewing, setViewing] = useState<Contract | null>(null);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    type: 'RECRUITMENT' | 'CONSULTING' | 'TRAINING' | 'RETAINER';
    startDate: string;
    endDate: string;
    value: string;
    description: string;
    employeeId: string;
  }>({ title: "", status: 'ACTIVE', type: 'RECRUITMENT', startDate: "", endDate: "", value: "0", description: "", employeeId: "" });

  const toInputDate = (d?: string) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const openView = (contract: Contract) => {
    setViewing(contract);
    if (!employees.length) {
      (async () => {
        try {
          const roles = ['HR', 'MANAGER', 'EMPLOYEE', 'SALES'];
          const results = await Promise.all(roles.map(role => api.get(`/users`, { params: { role } })));
          const merged: Array<{ id: string; name: string; role: string }> = [];
          for (const res of results) {
            const users = (res.data?.users || []) as Array<{ id: string; name: string; role: string }>;
            users.forEach(u => merged.push({ id: u.id, name: u.name, role: u.role }));
          }
          const unique = Array.from(new Map(merged.map(u => [u.id, u])).values());
          setEmployees(unique);
        } catch (err) {
          console.error('Failed to load employees', err);
        }
      })();
    }
  };
  const closeView = () => setViewing(null);

  const openEdit = (contract: Contract) => {
    setEditing(contract);
    setEditForm({
      title: contract.title || "",
      status: (contract.status as 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED') || 'ACTIVE',
      type: (contract.type as 'RECRUITMENT' | 'CONSULTING' | 'TRAINING' | 'RETAINER') || 'RECRUITMENT',
      startDate: toInputDate(contract.startDate),
      endDate: toInputDate(contract.endDate),
      value: String(contract.value ?? 0),
      description: contract.description || "",
      employeeId: (contract as unknown as { assignedTo?: string })?.assignedTo || "",
    });
    // Ensure employees and clients lists exist
    if (!employees.length) {
      (async () => {
        try {
          const roles = ['HR', 'MANAGER', 'EMPLOYEE', 'SALES'];
          const results = await Promise.all(roles.map(role => api.get(`/users`, { params: { role } })));
          const merged: Array<{ id: string; name: string; role: string }> = [];
          for (const res of results) {
            const users = (res.data?.users || []) as Array<{ id: string; name: string; role: string }>;
            users.forEach(u => merged.push({ id: u.id, name: u.name, role: u.role }));
          }
          const unique = Array.from(new Map(merged.map(u => [u.id, u])).values());
          setEmployees(unique);
        } catch (err) {
          console.error('Failed to load employees', err);
        }
      })();
    }
    if (!clients.length) {
      (async () => {
        try {
          const res = await api.get('/client/list');
          const data = (res.data || []) as Array<{ id: string; name: string }>;
          setClients(data);
        } catch (err) {
          console.error('Failed to load clients', err);
        }
      })();
    }
  };
  const closeEdit = () => setEditing(null);

  const handleEditSave = async () => {
    if (!editing) return;
    try {
      setEditSaving(true);
      await contractsApi.updateContract(editing.id, {
        title: editForm.title,
        status: editForm.status,
        type: editForm.type,
        startDate: editForm.startDate || undefined,
        endDate: editForm.endDate || undefined,
        value: Number(editForm.value || 0),
        description: editForm.description || undefined,
        assignedTo: editForm.employeeId || undefined,
        clientId: form.clientId || editing.clientId,
      });
      toast.success(language === 'ar' ? 'تم حفظ التعديلات' : 'Changes saved');
      setEditing(null);
      await loadContracts();
    } catch (e) {
      toast.error(language === 'ar' ? 'تعذر حفظ التعديلات' : 'Failed to save changes');
    } finally {
      setEditSaving(false);
    }
  };

  // Page-level local translations to avoid missing/broken global keys
  const T = (k: string) => {
    const en: Record<string, string> = {
      title: 'Contract Management',
      subtitle: 'Track and manage all contracts and revenue',
      addContract: 'Add Contract',
      totalContracts: 'Total Contracts',
      completedContracts: 'Completed Contracts',
      activeContracts: 'Active Contracts',
      totalValue: 'Total Value',
      searchPlaceholder: 'Search contracts...',
      contractsList: 'Contracts List',
      contractNumber: 'Contract Number',
      client: 'Client',
      job: 'Job',
      value: 'Value',
      duration: 'Duration',
      progress: 'Progress',
      contractStatus: 'Contract Status',
      paymentStatus: 'Payment Status',
      loadingContracts: 'Loading contracts...',
      noContracts: 'No contracts found',
      from: 'From',
      to: 'To',
    };
    const ar: Record<string, string> = {
      title: 'إدارة العقود',
      subtitle: 'إدارة العقود والاتفاقيات مع العملاء',
      addContract: 'إضافة عقد',
      totalContracts: 'إجمالي العقود',
      completedContracts: 'العقود المكتملة',
      activeContracts: 'العقود النشطة',
      totalValue: 'القيمة الإجمالية',
      searchPlaceholder: 'البحث في العقود...',
      contractsList: 'قائمة العقود',
      contractNumber: 'رقم العقد',
      client: 'العميل',
      job: 'الوظيفة',
      value: 'القيمة',
      duration: 'المدة',
      progress: 'التقدم',
      contractStatus: 'حالة العقد',
      paymentStatus: 'حالة الدفع',
      loadingContracts: 'جاري تحميل العقود...',
      noContracts: 'لا توجد عقود',
      from: 'من',
      to: 'إلى',
    };
    return (language === 'ar' ? ar : en)[k] || k;
  };

  // Localized labels for the create modal (avoid missing keys in global translations)


  // Load contracts from server
  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const query: ContractQuery = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      const response = await contractsApi.getContracts(query);
      // Backend returns { data, pagination }
      const list = (response as unknown as { data?: Contract[] }).data ?? [];
      const pagination = (response as unknown as { pagination?: { total?: number; totalPages?: number } }).pagination ?? {};
      setContracts(list);
      setTotal(pagination.total ?? list.length);
      setTotalPages(pagination.totalPages ?? 1);
    } catch (error: unknown) {
      console.error('Error loading contracts:', error);
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        toast.error(t('common.loginRequired'));
      } else if (err.response?.status === 403) {
        toast.error(t('common.accessDenied'));
      } else {
        toast.error(t('admin.contracts.loadError'));
      }
      setContracts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, typeFilter, paymentStatusFilter, t]);

  // Load contracts on component mount and when filters change
  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      loadContracts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, loadContracts]);

  // Fetch clients and employees upon opening the Add modal
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const roles = ['HR', 'MANAGER', 'EMPLOYEE', 'SALES'];
        const results = await Promise.all(
          roles.map(role => api.get(`/users`, { params: { role } }))
        );
        const merged: Array<{ id: string; name: string; role: string }> = [];
        for (const res of results) {
          const users = (res.data?.users || []) as Array<{ id: string; name: string; role: string }>;
          users.forEach(u => merged.push({ id: u.id, name: u.name, role: u.role }));
        }
        const unique = Array.from(new Map(merged.map(u => [u.id, u])).values());
        setEmployees(unique);
      } catch (err) {
        console.error('Failed to load employees');
      }
    };
    const loadClients = async () => {
      try {
        const res = await api.get('/client/list');
        const data = (res.data || []) as Array<{ id: string; name: string }>;
        setClients(data);
      } catch (e) {
        console.error('Failed to load clients');
      }
    };
    if (showAddModal) {
      loadClients();
      loadEmployees();
    }
  }, [showAddModal]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1); // Reset to first page when filtering
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'type') {
      setTypeFilter(value);
    } else if (filterType === 'paymentStatus') {
      setPaymentStatusFilter(value);
    }
  };

  const handleCreate = async () => {
    // Simple required validation
    if (!form.clientId || !form.title || !form.employeeId || !form.type || !form.startDate || !form.endDate || !form.value) {
      toast.error(t('errors.pleaseFillRequiredFields'));
      return;
    }
    setCreating(true);
    try {
      const typeMap: Record<string, 'RECRUITMENT'|'CONSULTING'|'TRAINING'|'RETAINER'> = {
        recruitment: 'RECRUITMENT',
        consulting: 'CONSULTING',
        training: 'TRAINING',
        retainer: 'RETAINER',
      };
      const payload = {
        clientId: form.clientId,
        title: form.title,
        description: form.description || undefined,
        type: typeMap[form.type] || 'RECRUITMENT',
        status: 'ACTIVE' as const,
        value: Number(form.value || 0),
        currency: 'SAR',
        startDate: form.startDate,
        endDate: form.endDate,
        assignedTo: form.employeeId,
        progress: 0,
        paymentStatus: 'pending' as const,
      };
      console.log('[CreateContract] Sending payload:', payload);
      const created = await contractsApi.createContract(payload);
      console.log('[CreateContract] Response:', created);
      toast.success(language === 'ar' ? 'تم إضافة العقد' : 'Contract added successfully');
      setShowAddModal(false);
      setForm({ clientId: '', title: '', employeeId: '', type: '', startDate: '', endDate: '', value: '', description: '' });
      // Reset filters and refresh to first page so the new contract is visible
      setSearchTerm('');
      setStatusFilter('');
      setTypeFilter('');
      setPaymentStatusFilter('');
      setCurrentPage(1);
      await loadContracts();
    } catch (e: unknown) {
      interface HttpError { response?: { status?: number; data?: unknown }; message?: string }
      const err = e as HttpError;
      console.error('[CreateContract] Error:', err?.response?.data || err);
      let serverMsg: string | undefined;
      if (err?.response?.data && typeof err.response.data === 'object') {
        const d = err.response.data as { message?: string };
        serverMsg = d.message;
      }
      serverMsg = serverMsg || err?.message;
      toast.error(serverMsg || (language === 'ar' ? 'تعذر إنشاء العقد' : 'Failed to create contract'));
    } finally {
      setCreating(false);
    }
  };

  // Delete contract
  const handleDeleteContract = async (contractId: string) => {
    if (!confirm(t('admin.contracts.deleteConfirm'))) return;
    
    try {
      await contractsApi.deleteContract(contractId);
      toast.success(t('admin.contracts.deleteSuccess'));
      loadContracts(); // Reload contracts
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error(t('admin.contracts.deleteError'));
    }
  };

  // Update contract status
  const handleStatusUpdate = async (contractId: string, newStatus: string) => {
    try {
      await contractsApi.updateContractStatus(contractId, newStatus);
      toast.success(t('admin.contracts.statusUpdateSuccess'));
      loadContracts(); // Reload contracts
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast.error(t('admin.contracts.statusUpdateError'));
    }
  };

  // Helper functions for status and payment colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "EXPIRED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Helper functions for display
  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case "ACTIVE": return t('admin.contracts.statusActive');
      case "COMPLETED": return t('admin.contracts.statusCompleted');
      case "DRAFT": return t('admin.contracts.statusDraft');
      case "CANCELLED": return t('admin.contracts.statusCancelled');
      case "EXPIRED": return t('admin.contracts.statusExpired');
      default: return status;
    }
  };

  const getPaymentStatusDisplayText = (status: string) => {
    switch (status) {
      case "paid": return t('admin.contracts.paymentPaid');
      case "partial": return t('admin.contracts.paymentPartial');
      case "pending": return t('admin.contracts.paymentPending');
      case "overdue": return t('admin.contracts.paymentOverdue');
      default: return status;
    }
  };

  const formatCurrency = (amount: number | null | undefined, currency?: string) => {
    const value = Number(amount ?? 0);
    const curr = currency || 'SAR';
    return `${value.toLocaleString()} ${curr === 'SAR' ? t('common.currency.sar') : curr}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <MainLayout userRole="admin" >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{T('title')}</h1>
            <p className="text-muted-foreground">{T('subtitle')}</p>
          </div>
          <Button className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            {T('addContract')}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{T('totalContracts')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{T('activeContracts')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : (contracts || []).filter(c => c.status === "ACTIVE").length}</p>
              </div>
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{T('completedContracts')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : (contracts || []).filter(c => c.status === "COMPLETED").length}</p>
              </div>
              <Building2 className="h-8 w-8 text-info" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{T('totalValue')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : formatCurrency((contracts || []).reduce((sum, contract) => sum + contract.value, 0), 'SAR')}</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={T('searchPlaceholder')}
                    className="pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select 
                 className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                 value={statusFilter || ''}
                 onChange={(e) => handleFilterChange('status', e.target.value)}
               >
                 <option value="">{t('admin.contracts.allStatuses')}</option>
                 <option value="ACTIVE">{t('admin.contracts.statusActive')}</option>
                 <option value="COMPLETED">{t('admin.contracts.statusCompleted')}</option>
                 <option value="DRAFT">{t('admin.contracts.statusDraft')}</option>
                 <option value="CANCELLED">{t('admin.contracts.statusCancelled')}</option>
                 <option value="EXPIRED">{t('admin.contracts.statusExpired')}</option>
               </select>
               <select 
                 className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                 value={paymentStatusFilter || ''}
                 onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
               >
                 <option value="">{t('admin.contracts.allPaymentStatuses')}</option>
                 <option value="paid">{t('admin.contracts.paymentPaid')}</option>
                 <option value="partial">{t('admin.contracts.paymentPartial')}</option>
                 <option value="pending">{t('admin.contracts.paymentPending')}</option>
                 <option value="overdue">{t('admin.contracts.paymentOverdue')}</option>
               </select>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
{T('contractsList')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>{T('contractNumber')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{T('client')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{T('job')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{T('value')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{T('duration')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{T('progress')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{T('contractStatus')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{T('paymentStatus')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('common.actions')}</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{T('loadingContracts')}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (contracts || []).length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
{T('noContracts')}
                      </td>
                    </tr>
                  ) : (
                    (contracts || []).map((contract) => (
                      <ResponsiveTableRow 
                        key={contract.id}
                        headers={[T('contractNumber'), T('client'), T('job'), T('value'), T('duration'), T('progress'), T('contractStatus'), T('paymentStatus'), t('common.actions')]}
                      >
                        <ResponsiveTableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-xs">{contract.id}</div>
                              <div className="text-xs text-muted-foreground">{contract.title}</div>
                            </div>
                          </div>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-xs truncate">{contract.client?.name || t('common.notSpecified')}</span>
                          </div>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <div className="font-medium text-xs truncate">{contract.jobTitle || t('common.notSpecified')}</div>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <div className="font-medium text-xs">{formatCurrency(contract.value, contract.currency)}</div>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <div className="text-xs space-y-1">
                            <div>{T('from')}: {formatDate(contract.startDate)}</div>
                            <div>{T('to')}: {formatDate(contract.endDate)}</div>
                          </div>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <div className="flex items-center gap-1">
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full" 
                                style={{ width: `${contract.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium whitespace-nowrap">{contract.progress}%</span>
                          </div>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <Badge className={getStatusColor(contract.status)}>
                            {getStatusDisplayText(contract.status)}
                          </Badge>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <Badge className={getPaymentStatusColor(contract.paymentStatus)}>
                            {getPaymentStatusDisplayText(contract.paymentStatus)}
                          </Badge>
                        </ResponsiveTableCell>
                        <ResponsiveTableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => openView(contract)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => openEdit(contract)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteContract(contract.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </ResponsiveTableCell>
                      </ResponsiveTableRow>
                    ))
                  )}
              </ResponsiveTableBody>
            </ResponsiveTable>
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  t('admin.contracts.loading')
                ) : (
                  `${t('contracts.showingResults')} ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, total)} ${t('common.of')} ${total}`
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                   variant="outline" 
                   size="sm" 
                   disabled={currentPage === 1 || loading}
                   onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 >
                   <ChevronLeft className="h-4 w-4" />
                   {t('common.previous')}
                 </Button>
                <span className="text-sm px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button 
                   variant="outline" 
                   size="sm"
                   disabled={currentPage >= totalPages || loading}
                   onClick={() => setCurrentPage(prev => prev + 1)}
                 >
                   {t('common.next')}
                   <ChevronRight className="h-4 w-4" />
                 </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Contract Modal  */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('admin.contracts.modalTitle')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                {t('admin.contracts.client')} <span className="text-red-500">*</span>
              </Label>
              <Select value={form.clientId} onValueChange={(v) => setForm(s => ({ ...s, clientId: v }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('admin.contracts.selectClient')} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee" className="text-right">
                {language === 'ar' ? 'الموظف' : 'Employee'} <span className="text-red-500">*</span>
              </Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm(s => ({ ...s, employeeId: v }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={language === 'ar' ? 'اختر الموظف' : 'Select employee'} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {language === 'ar' ? 'عنوان العقد' : 'Contract Title'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                className="col-span-3"
                value={form.title}
                onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))}
                placeholder={language === 'ar' ? 'اكتب عنوان العقد' : 'Enter contract title'}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                {t('admin.contracts.type')} <span className="text-red-500">*</span>
              </Label>
              <Select value={form.type} onValueChange={(v) => setForm(s => ({ ...s, type: v }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('admin.contracts.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruitment">{language === 'ar' ? 'توظيف' : 'Recruitment'}</SelectItem>
                  <SelectItem value="consulting">{language === 'ar' ? 'استشارات' : 'Consulting'}</SelectItem>
                  <SelectItem value="training">{language === 'ar' ? 'تدريب' : 'Training'}</SelectItem>
                  <SelectItem value="retainer">{language === 'ar' ? 'اتفاقية مستمرة' : 'Retainer'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                {t('admin.contracts.startDate')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
                value={form.startDate}
                onChange={(e) => setForm(s => ({ ...s, startDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                {t('admin.contracts.endDate')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                className="col-span-3"
                value={form.endDate}
                onChange={(e) => setForm(s => ({ ...s, endDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                {t('admin.contracts.value')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                placeholder="0.00"
                className="col-span-3"
                value={form.value}
                onChange={(e) => setForm(s => ({ ...s, value: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('admin.contracts.description')}
              </Label>
              <Textarea
                id="description"
                placeholder={t('admin.contracts.descriptionPlaceholder')}
                className="col-span-3"
                value={form.description}
                onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              {t('admin.contracts.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {t('admin.contracts.create')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Contract Modal */}
      {viewing && (
        <Dialog open={!!viewing} onOpenChange={closeView}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{language === 'ar' ? 'عرض العقد' : 'View Contract'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{language === 'ar' ? 'العميل' : 'Client'}</Label>
                <div className="col-span-3">{viewing.client?.name || '-'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{language === 'ar' ? 'الموظف' : 'Employee'}</Label>
                <div className="col-span-3">{(employees.find(e => e.id === (viewing as unknown as { assignedTo?: string })?.assignedTo)?.name) || (viewing as unknown as { assignedTo?: string })?.assignedTo || '-'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{language === 'ar' ? 'عنوان' : 'Title'}</Label>
                <div className="col-span-3">{viewing.title}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{language === 'ar' ? 'النوع' : 'Type'}</Label>
                <div className="col-span-3">{viewing.type}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{language === 'ar' ? 'الحالة' : 'Status'}</Label>
                <div className="col-span-3">{viewing.status}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{language === 'ar' ? 'القيمة' : 'Value'}</Label>
                <div className="col-span-3">{formatCurrency(viewing.value, viewing.currency)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{language === 'ar' ? 'المدة' : 'Duration'}</Label>
                <div className="col-span-3">{viewing.startDate ? new Date(viewing.startDate).toLocaleDateString() : '-'} — {viewing.endDate ? new Date(viewing.endDate).toLocaleDateString() : '-'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                <div className="col-span-3 whitespace-pre-wrap">{viewing.description || '-'}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={closeView}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Contract Modal */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={closeEdit}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{language === 'ar' ? 'تعديل العقد' : 'Edit Contract'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {/* Client (editable) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-client" className="text-right">{language === 'ar' ? 'العميل' : 'Client'} <span className="text-red-500">*</span></Label>
                <Select value={form.clientId || editing.clientId} onValueChange={(v) => setForm(s => ({ ...s, clientId: v }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select client'} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Employee */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-employee" className="text-right">{language === 'ar' ? 'الموظف' : 'Employee'} <span className="text-red-500">*</span></Label>
                <Select value={editForm.employeeId} onValueChange={(v) => setEditForm(s => ({ ...s, employeeId: v }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={language === 'ar' ? 'اختر الموظف' : 'Select employee'} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Title */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">{language === 'ar' ? 'عنوان' : 'Title'} <span className="text-red-500">*</span></Label>
                <Input id="edit-title" className="col-span-3" value={editForm.title} onChange={(e) => setEditForm(s => ({ ...s, title: e.target.value }))} />
              </div>
              {/* Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">{language === 'ar' ? 'النوع' : 'Type'} <span className="text-red-500">*</span></Label>
                <Select value={editForm.type} onValueChange={(v) => setEditForm(s => ({ ...s, type: v as 'RECRUITMENT' | 'CONSULTING' | 'TRAINING' | 'RETAINER' }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECRUITMENT">RECRUITMENT</SelectItem>
                    <SelectItem value="CONSULTING">CONSULTING</SelectItem>
                    <SelectItem value="TRAINING">TRAINING</SelectItem>
                    <SelectItem value="RETAINER">RETAINER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Dates */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-start" className="text-right">{language === 'ar' ? 'تاريخ البداية' : 'Start Date'} <span className="text-red-500">*</span></Label>
                <Input id="edit-start" type="date" className="col-span-3" value={editForm.startDate} onChange={(e) => setEditForm(s => ({ ...s, startDate: e.target.value }))} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-end" className="text-right">{language === 'ar' ? 'تاريخ النهاية' : 'End Date'} <span className="text-red-500">*</span></Label>
                <Input id="edit-end" type="date" className="col-span-3" value={editForm.endDate} onChange={(e) => setEditForm(s => ({ ...s, endDate: e.target.value }))} />
              </div>
              {/* Value */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-value" className="text-right">{language === 'ar' ? 'القيمة' : 'Value'} <span className="text-red-500">*</span></Label>
                <Input id="edit-value" type="number" className="col-span-3" value={editForm.value} onChange={(e) => setEditForm(s => ({ ...s, value: e.target.value }))} />
              </div>
              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                <Textarea id="edit-description" className="col-span-3" value={editForm.description} onChange={(e) => setEditForm(s => ({ ...s, description: e.target.value }))} />
              </div>
              {/* Status */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">{language === 'ar' ? 'الحالة' : 'Status'} <span className="text-red-500">*</span></Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm(s => ({ ...s, status: v as 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">DRAFT</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeEdit}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleEditSave} disabled={editSaving}>{editSaving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}{language === 'ar' ? 'حفظ' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
};

export default AdminContracts;