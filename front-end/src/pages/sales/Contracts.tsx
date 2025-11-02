import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contractsApi, type Contract, type CreateContractData } from "@/services/contractsApi";
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
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Download,
  X
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getContractTypeLabel } from "@/utils/labels";
import { useSalesCurrency } from "@/contexts/SalesCurrencyContext";

const SalesContracts = () => {
  console.log("=== SalesContracts Component Loaded ===");

  const { t, language } = useLanguage();
  const { currency: selectedCurrency, getCurrencyIcon, getCurrencyName } = useSalesCurrency();
  // State for showing/hiding the create form
  const [showCreateForm, setShowCreateForm] = useState(false);

  // State for contracts and loading
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);

  console.log("SalesContracts rendered, selectedCurrency:", selectedCurrency);
  console.log("showCreateForm:", showCreateForm);

  // Form data state
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    type: "RECRUITMENT" as "RECRUITMENT" | "CONSULTING" | "PROJECT_BASED" | "RETAINER",
    status: "DRAFT" as "DRAFT" | "ACTIVE",
    value: "",
    currency: selectedCurrency,
    startDate: "",
    endDate: "",
    signedAt: "",
    commission: "",
    commissionType: "PERCENTAGE",
    jobTitle: "",
    paymentStatus: "pending" as "pending" | "partial" | "paid" | "overdue"
  });

  // Load contracts from API
  useEffect(() => {
    loadContracts();
    loadStats();
    loadClients();
  }, [selectedCurrency]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await contractsApi.getContracts({
        currency: selectedCurrency,
        page: 1,
        limit: 100
      });
      setContracts(response.contracts || []);
      setError(null);
    } catch (err: any) {
      console.error("Error loading contracts:", err);
      setError(err.message || "فشل تحميل العقود");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await contractsApi.getContractStats(selectedCurrency);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const loadClients = async () => {
    try {
      // Load clients for dropdown
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      console.log("Clients loaded:", data);
      setClients(data.clients || data || []);
    } catch (err) {
      console.error("Error loading clients:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "موقع":
        return "bg-secondary text-secondary-foreground";
      case "مكتمل":
        return "bg-info text-info-foreground";
      case "قيد المراجعة":
        return "bg-warning text-warning-foreground";
      case "ملغي":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "موقع":
        return <CheckCircle className="h-4 w-4" />;
      case "مكتمل":
        return <CheckCircle className="h-4 w-4" />;
      case "قيد المراجعة":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };


  // Update form data currency when selectedCurrency changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, currency: selectedCurrency }));
  }, [selectedCurrency]);
  
  // Helper function to get currency icon from context
  const getCurrencyIconHelper = (curr?: string) => {
    return getCurrencyIcon(curr as any);
  };
  
  // Helper function to get currency name from context
  const getCurrencyNameHelper = (curr?: string) => {
    return getCurrencyName(curr as any, language);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      console.log("=== بدء عملية إنشاء العقد ===");
      console.log("Form Data:", formData);

      // Validate required fields
      if (!formData.clientId || !formData.title) {
        alert(t('errors.pleaseFillRequiredFields'));
        console.error("Validation failed: missing clientId or title");
        return;
      }

      // Validate dates
      if (!formData.startDate || !formData.endDate) {
        alert(t('errors.pleaseEnterStartEndDates'));
        console.error("Validation failed: missing dates");
        return;
      }

      // Prepare data for API
      const contractData: CreateContractData = {
        clientId: formData.clientId,
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        status: formData.status,
        value: parseFloat(formData.value) || 0,
        currency: formData.currency,
        startDate: formData.startDate,
        endDate: formData.endDate,
        jobTitle: formData.jobTitle || undefined,
        commission: formData.commission ? parseFloat(formData.commission) : undefined,
        commissionType: formData.commissionType || undefined,
        paymentStatus: formData.paymentStatus,
      };

      console.log("Contract Data to send:", contractData);
      console.log("API Base URL:", import.meta.env.VITE_API_BASE || 'http://localhost:3000/api');

      // Call API to create contract
      console.log("Calling API...");
      const result = await contractsApi.createContract(contractData);
      console.log("API Response:", result);

      // Reset form and close
      setFormData({
        clientId: "",
        title: "",
        description: "",
        type: "RECRUITMENT",
        status: "DRAFT",
        value: "",
        currency: selectedCurrency,
        startDate: "",
        endDate: "",
        signedAt: "",
        commission: "",
        commissionType: "PERCENTAGE",
        jobTitle: "",
        paymentStatus: "pending"
      });
      setShowCreateForm(false);

      // Reload contracts
      console.log("Reloading contracts...");
      await loadContracts();
      await loadStats();

      alert(t('errors.contractCreatedSuccessfully'));
      console.log("=== تم إنشاء العقد بنجاح ===");
    } catch (err: any) {
      console.error("=== خطأ في إنشاء العقد ===");
      console.error("Error:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      console.error("Error status:", err.response?.status);

      const errorMessage = err.response?.data?.message || err.message || t('errors.failedToSave');
      alert(t('errors.error') + ": " + errorMessage);
    }
  };

  return (
    <MainLayout userRole="sales" userName="عمر حسن">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('salesContracts.title')}</h1>
            <p className="text-muted-foreground">{t('salesContracts.subtitle')} - إدارة العقود</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
            <Button className="gap-2 h-auto py-3 px-6" onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? (
                <>
                  <X className="h-4 w-4" />
                  {t('salesContracts.cancel')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {t('salesContracts.addContract')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Create Contract Form */}
        {showCreateForm && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="h-6 w-6 text-primary" />
                {t('salesContracts.addContract')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client - Required */}
                <div className="space-y-2">
                  <Label htmlFor="clientId" className="text-sm font-medium">
                    اختر العميل <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.clientId} onValueChange={(value) => handleInputChange("clientId", value)}>
                    <SelectTrigger id="clientId">
                      <SelectValue placeholder="اختر عميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 ? (
                        <SelectItem value="no-clients" disabled>لا يوجد عملاء</SelectItem>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.email ? `(${client.email})` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title - Required */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    {t('salesContracts.fields.title')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder={t('salesContracts.placeholders.title')}
                    className="w-full"
                    required
                  />
                </div>

                {/* Job Title - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-sm font-medium">
                    {t('salesContracts.fields.jobTitle')}
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    placeholder={t('salesContracts.placeholders.jobTitle')}
                    className="w-full"
                  />
                </div>

                {/* Contract Type - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    {t('salesContracts.fields.type')}
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder={t('salesContracts.selectors.type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECRUITMENT">{t('salesContracts.types.recruitment')}</SelectItem>
                      <SelectItem value="CONSULTING">{t('salesContracts.types.consulting')}</SelectItem>
                      <SelectItem value="TRAINING">{t('salesContracts.types.training')}</SelectItem>
                      <SelectItem value="RETAINER">{t('salesContracts.types.retainer')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contract Status - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    {t('salesContracts.fields.status')}
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder={t('salesContracts.selectors.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">{t('salesContracts.statuses.draft')}</SelectItem>
                      <SelectItem value="PENDING">{t('salesContracts.statuses.pending')}</SelectItem>
                      <SelectItem value="ACTIVE">{t('salesContracts.statuses.active')}</SelectItem>
                      <SelectItem value="COMPLETED">{t('salesContracts.statuses.completed')}</SelectItem>
                      <SelectItem value="CANCELLED">{t('salesContracts.statuses.cancelled')}</SelectItem>
                      <SelectItem value="EXPIRED">{t('salesContracts.statuses.expired')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contract Value - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-sm font-medium">
                    {t('salesContracts.fields.value')}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleInputChange("value", e.target.value)}
                    placeholder={t('salesContracts.placeholders.value')}
                    className="w-full"
                  />
                </div>

                {/* Currency - Display Only */}
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    {t('salesContracts.fields.currency')}
                  </Label>
                  <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-md border">
                    <span className="text-2xl">{getCurrencyIconHelper(selectedCurrency)}</span>
                    <div>
                      <p className="font-medium">{getCurrencyNameHelper(selectedCurrency)}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar' ? 'العملة المحددة من الداشبورد' : 'Currency selected from dashboard'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Commission - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="commission" className="text-sm font-medium">
                    {t('salesContracts.fields.commission')}
                  </Label>
                  <Input
                    id="commission"
                    type="number"
                    value={formData.commission}
                    onChange={(e) => handleInputChange("commission", e.target.value)}
                    placeholder={t('salesContracts.placeholders.commission')}
                    className="w-full"
                  />
                </div>

                {/* Commission Type - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="commissionType" className="text-sm font-medium">
                    {t('salesContracts.fields.commissionType')}
                  </Label>
                  <Select value={formData.commissionType} onValueChange={(value) => handleInputChange("commissionType", value)}>
                    <SelectTrigger id="commissionType">
                      <SelectValue placeholder={t('salesContracts.selectors.commissionType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">{t('salesContracts.commissionTypes.percentage')}</SelectItem>
                      <SelectItem value="FIXED">{t('salesContracts.commissionTypes.fixed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    {t('salesContracts.fields.startDate')}
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* End Date - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    {t('salesContracts.fields.endDate')}
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Signed Date - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="signedAt" className="text-sm font-medium">
                    {t('salesContracts.fields.signedAt')}
                  </Label>
                  <Input
                    id="signedAt"
                    type="date"
                    value={formData.signedAt}
                    onChange={(e) => handleInputChange("signedAt", e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Payment Status - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus" className="text-sm font-medium">
                    {t('salesContracts.fields.paymentStatus')}
                  </Label>
                  <Select value={formData.paymentStatus} onValueChange={(value) => handleInputChange("paymentStatus", value)}>
                    <SelectTrigger id="paymentStatus">
                      <SelectValue placeholder={t('salesContracts.selectors.paymentStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">{t('salesContracts.paymentStatuses.pending')}</SelectItem>
                      <SelectItem value="PAID">{t('salesContracts.paymentStatuses.paid')}</SelectItem>
                      <SelectItem value="PARTIAL">{t('salesContracts.paymentStatuses.partial')}</SelectItem>
                      <SelectItem value="OVERDUE">{t('salesContracts.paymentStatuses.overdue')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description - Full Width - Optional */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    {t('salesContracts.fields.description')}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder={t('salesContracts.placeholders.description')}
                    className="w-full min-h-[120px]"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Button clicked!");
                    handleSubmit();
                  }}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  {t('salesContracts.createContract')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  {t('salesContracts.cancel')}
                </Button>
              </div>

              {/* Required Fields Note */}
              <p className="text-sm text-muted-foreground mt-4 text-center">
                <span className="text-red-500">*</span> {t('salesContracts.requiredFields')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">عقود نشطة</p>
                  <p className="text-2xl font-bold">{stats?.activeContracts || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">قيد المراجعة</p>
                  <p className="text-2xl font-bold">{stats?.pendingContracts || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي قيمة العقود</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{stats?.totalValue ? stats.totalValue.toLocaleString() : "0"}</p>
                    <span className="text-xl font-bold">{selectedCurrency}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{getCurrencyNameHelper(selectedCurrency)}</p>
                </div>
                <div className="text-3xl text-red-500 font-bold">{getCurrencyIconHelper(selectedCurrency)}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">إجمالي العمولات</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{stats?.totalCommission ? stats.totalCommission.toLocaleString() : "0"}</p>
                    <span className="text-xl font-bold">{selectedCurrency}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{getCurrencyNameHelper(selectedCurrency)}</p>
                </div>
                <div className="text-3xl text-red-500 font-bold">{getCurrencyIconHelper(selectedCurrency)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('salesContracts.searchPlaceholder')}
                    className="pr-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {t('salesContracts.filter')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('salesContracts.contractsList')} ({contracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <span className="mr-3 text-muted-foreground">جاري تحميل العقود...</span>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
                <p className="text-destructive font-medium">{error}</p>
                <Button onClick={loadContracts} variant="outline" className="mt-3">
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {!loading && !error && contracts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">لا توجد عقود بعد</p>
                <Button onClick={() => setShowCreateForm(true)} className="mt-3">
                  إنشاء عقد جديد
                </Button>
              </div>
            )}

            {!loading && !error && contracts.length > 0 && (
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>{t('salesContracts.table.contractNumber')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('salesContracts.table.client')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('salesContracts.table.candidate')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('salesContracts.table.job')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('salesContracts.table.contractValue')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('salesContracts.table.commission')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('salesContracts.table.startDate')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('salesContracts.table.status')}</ResponsiveTableHead>
                  <ResponsiveTableHead>{t('salesContracts.table.actions')}</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                {contracts.map((contract) => (
                  <ResponsiveTableRow
                    key={contract.id}
                    headers={[t('salesContracts.table.contractNumber'), t('salesContracts.table.client'), t('salesContracts.table.candidate'), t('salesContracts.table.job'), t('salesContracts.table.contractValue'), t('salesContracts.table.commission'), t('salesContracts.table.startDate'), t('salesContracts.table.status'), t('salesContracts.table.actions')]}
                  >
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-xs">{contract.id.substring(0, 8)}</div>
                          <div className="text-xs text-muted-foreground">{getContractTypeLabel(contract.type, language)}</div>
                        </div>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-xs truncate">{contract.client?.name || contract.clientId.substring(0, 8)}</span>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-xs truncate">{contract.title}</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-xs truncate">{contract.jobTitle || "-"}</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-xs">{contract.value ? contract.value.toLocaleString() : "0"} {contract.currency}</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="font-medium text-secondary text-xs">{contract.commission ? contract.commission.toLocaleString() : "0"} {contract.currency}</div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{contract.startDate ? new Date(contract.startDate).toLocaleDateString('ar-SA') : "-"}</span>
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <Badge className={`gap-2 ${getStatusColor(contract.status)}`}>
                        {getStatusIcon(contract.status)}
                        {contract.status}
                      </Badge>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownloadPDF(contract)}
                          title="تحميل PDF"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </ResponsiveTableCell>
                  </ResponsiveTableRow>
                ))}
              </ResponsiveTableBody>
            </ResponsiveTable>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SalesContracts;