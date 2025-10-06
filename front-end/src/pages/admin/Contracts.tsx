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
import { useState, useEffect } from "react";
import { contractsApi, Contract, ContractQuery } from "@/services/contractsApi";
import { toast } from "sonner";

const AdminContracts = () => {
  const { t } = useLanguage();
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

  // Load contracts from server
  const loadContracts = async () => {
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
      setContracts(response.contracts);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Error loading contracts:', error);
      if (error.response?.status === 401) {
        toast.error(t('common.loginRequired'));
      } else if (error.response?.status === 403) {
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
  };

  // Load contracts on component mount and when filters change
  useEffect(() => {
    loadContracts();
  }, [currentPage, searchTerm, statusFilter, typeFilter, paymentStatusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      loadContracts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency === 'SAR' ? t('common.currency.sar') : currency}`;
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
            <h1 className="text-3xl font-bold text-foreground">{t('admin.contracts.title')}</h1>
            <p className="text-muted-foreground">{t('admin.contracts.subtitle')}</p>
          </div>
          <Button className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            {t('admin.contracts.addContract')}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('admin.contracts.totalContracts')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('admin.contracts.activeContracts')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : (contracts || []).filter(c => c.status === "ACTIVE").length}</p>
              </div>
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('admin.contracts.completedContracts')}</p>
                <p className="text-2xl font-bold">{loading ? '...' : (contracts || []).filter(c => c.status === "COMPLETED").length}</p>
              </div>
              <Building2 className="h-8 w-8 text-info" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('admin.contracts.totalValue')}</p>
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
                    placeholder={t('admin.contracts.searchPlaceholder')}
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
{t('admin.contracts.contractsList')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>{t('admin.contracts.contractNumber')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('admin.contracts.client')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('admin.contracts.job')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('admin.contracts.value')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('admin.contracts.duration')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('admin.contracts.progress')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('admin.contracts.contractStatus')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('admin.contracts.paymentStatus')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('common.actions')}</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t('admin.contracts.loadingContracts')}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (contracts || []).length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
{t('admin.contracts.noContracts')}
                      </td>
                    </tr>
                  ) : (
                    (contracts || []).map((contract) => (
                      <ResponsiveTableRow 
                        key={contract.id}
                        headers={[t('admin.contracts.contractNumber'), t('admin.contracts.client'), t('admin.contracts.job'), t('admin.contracts.value'), t('admin.contracts.duration'), t('admin.contracts.progress'), t('admin.contracts.contractStatus'), t('admin.contracts.paymentStatus'), t('common.actions')]}
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
                            <div>{t('admin.contracts.from')}: {formatDate(contract.startDate)}</div>
                            <div>{t('admin.contracts.to')}: {formatDate(contract.endDate)}</div>
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
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0">
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

      {/* Add Contract Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('admin.contracts.addContract')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee" className="text-right">
                {t('admin.contracts.employee')}
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('admin.contracts.selectEmployee')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee1">Employee 1</SelectItem>
                  <SelectItem value="employee2">Employee 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                {t('admin.contracts.type')}
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('admin.contracts.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">{t('admin.contracts.permanent')}</SelectItem>
                  <SelectItem value="temporary">{t('admin.contracts.temporary')}</SelectItem>
                  <SelectItem value="contract">{t('admin.contracts.contract')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                {t('admin.contracts.startDate')}
              </Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                {t('admin.contracts.endDate')}
              </Label>
              <Input
                id="endDate"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salary" className="text-right">
                {t('admin.contracts.salary')}
              </Label>
              <Input
                id="salary"
                type="number"
                placeholder="0.00"
                className="col-span-3"
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
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => {
              // Here you would handle the form submission
              toast.success(t('admin.contracts.contractAdded'));
              setShowAddModal(false);
            }}>
              {t('admin.contracts.addContract')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminContracts;