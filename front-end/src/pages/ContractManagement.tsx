import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Download, 
  Eye, 
  Calendar, 
  DollarSign, 
  Building, 
  User, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Globe
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

interface Contract {
  id: string;
  title: string;
  client: string;
  clientId: string;
  type: 'recruitment' | 'consulting' | 'training' | 'retainer';
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  value: number;
  currency: 'SAR' | 'USD' | 'EUR' | 'AED';
  startDate: string;
  endDate: string;
  signedDate?: string;
  description: string;
  terms: string[];
  paymentTerms: string;
  commission: number;
  commissionType: 'percentage' | 'fixed';
  assignedTo: string;
  documents: string[];
  milestones: Milestone[];
  renewalDate?: string;
  autoRenewal: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  value: number;
  currency: string;
}

const ContractManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [newContractDialog, setNewContractDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [newContract, setNewContract] = useState<Partial<Contract>>({
    title: '',
    client: '',
    type: 'recruitment',
    status: 'draft',
    value: 0,
    currency: 'SAR',
    startDate: '',
    endDate: '',
    description: '',
    terms: [],
    paymentTerms: '',
    commission: 0,
    commissionType: 'percentage',
    assignedTo: '',
    documents: [],
    milestones: [],
    autoRenewal: false
  });

  // Currency exchange rates (mock data)
  const exchangeRates = {
    SAR: 1,
    USD: 0.27,
    EUR: 0.24,
    AED: 0.98
  };

  // Mock data for contracts
  const contracts: Contract[] = [
    {
      id: "1",
      title: "عقد توظيف مطورين - شركة التقنية المتقدمة",
      client: "شركة التقنية المتقدمة",
      clientId: "client-1",
      type: "recruitment",
      status: "active",
      value: 150000,
      currency: "SAR",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      signedDate: "2023-12-15",
      description: "عقد توظيف 10 مطورين برمجيات خلال عام 2024",
      terms: [
        "ضمان استبدال المرشح خلال 3 أشهر",
        "دفع العمولة خلال 30 يوم من التوظيف",
        "تقديم تقارير شهرية عن التقدم"
      ],
      paymentTerms: "30% مقدم، 70% عند التوظيف",
      commission: 15000,
      commissionType: "fixed",
      assignedTo: "أحمد محمد",
      documents: ["contract.pdf", "terms.pdf"],
      milestones: [
        {
          id: "m1",
          title: "توظيف 3 مطورين",
          description: "توظيف أول 3 مطورين",
          dueDate: "2024-03-31",
          status: "completed",
          value: 45000,
          currency: "SAR"
        },
        {
          id: "m2",
          title: "توظيف 5 مطورين إضافيين",
          description: "توظيف 5 مطورين إضافيين",
          dueDate: "2024-06-30",
          status: "in-progress",
          value: 75000,
          currency: "SAR"
        },
        {
          id: "m3",
          title: "إكمال التوظيف",
          description: "توظيف آخر مطورين",
          dueDate: "2024-09-30",
          status: "pending",
          value: 30000,
          currency: "SAR"
        }
      ],
      renewalDate: "2024-10-01",
      autoRenewal: true,
      createdAt: "2023-12-01",
      updatedAt: "2024-01-20"
    },
    {
      id: "2",
      title: "استشارات الموارد البشرية - البنك الوطني",
      client: "البنك الوطني",
      clientId: "client-2",
      type: "consulting",
      status: "active",
      value: 50000,
      currency: "USD",
      startDate: "2024-02-01",
      endDate: "2024-08-01",
      signedDate: "2024-01-25",
      description: "تقديم استشارات في تطوير سياسات الموارد البشرية",
      terms: [
        "تقديم تقارير أسبوعية",
        "حضور اجتماعات شهرية",
        "تدريب الفريق الداخلي"
      ],
      paymentTerms: "دفع شهري",
      commission: 25,
      commissionType: "percentage",
      assignedTo: "فاطمة أحمد",
      documents: ["consulting_agreement.pdf"],
      milestones: [
        {
          id: "m1",
          title: "تحليل الوضع الحالي",
          description: "تحليل شامل للوضع الحالي",
          dueDate: "2024-03-01",
          status: "completed",
          value: 15000,
          currency: "USD"
        },
        {
          id: "m2",
          title: "وضع الاستراتيجية",
          description: "وضع استراتيجية الموارد البشرية",
          dueDate: "2024-05-01",
          status: "in-progress",
          value: 20000,
          currency: "USD"
        },
        {
          id: "m3",
          title: "التنفيذ والتدريب",
          description: "تنفيذ الاستراتيجية وتدريب الفريق",
          dueDate: "2024-07-01",
          status: "pending",
          value: 15000,
          currency: "USD"
        }
      ],
      autoRenewal: false,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-25"
    },
    {
      id: "3",
      title: "برنامج تدريب القيادة - مجموعة الخليج",
      client: "مجموعة الخليج",
      clientId: "client-3",
      type: "training",
      status: "completed",
      value: 75000,
      currency: "AED",
      startDate: "2023-09-01",
      endDate: "2023-12-31",
      signedDate: "2023-08-20",
      description: "برنامج تدريب شامل للقيادات الوسطى والعليا",
      terms: [
        "تدريب 50 موظف",
        "شهادات معتمدة",
        "متابعة لمدة 6 أشهر"
      ],
      paymentTerms: "50% مقدم، 50% عند الإنجاز",
      commission: 20,
      commissionType: "percentage",
      assignedTo: "خالد عبدالله",
      documents: ["training_contract.pdf", "curriculum.pdf"],
      milestones: [
        {
          id: "m1",
          title: "المرحلة الأولى",
          description: "تدريب المجموعة الأولى",
          dueDate: "2023-10-15",
          status: "completed",
          value: 25000,
          currency: "AED"
        },
        {
          id: "m2",
          title: "المرحلة الثانية",
          description: "تدريب المجموعة الثانية",
          dueDate: "2023-11-30",
          status: "completed",
          value: 25000,
          currency: "AED"
        },
        {
          id: "m3",
          title: "التقييم النهائي",
          description: "تقييم شامل وإصدار الشهادات",
          dueDate: "2023-12-31",
          status: "completed",
          value: 25000,
          currency: "AED"
        }
      ],
      autoRenewal: false,
      createdAt: "2023-08-01",
      updatedAt: "2024-01-05"
    },
    {
      id: "4",
      title: "خدمات الاستبقاء - شركة الطاقة",
      client: "شركة الطاقة المتجددة",
      clientId: "client-4",
      type: "retainer",
      status: "pending",
      value: 120000,
      currency: "EUR",
      startDate: "2024-03-01",
      endDate: "2025-02-28",
      description: "خدمات استشارية مستمرة في الموارد البشرية",
      terms: [
        "خدمات شهرية مضمونة",
        "استجابة خلال 24 ساعة",
        "تقارير ربع سنوية"
      ],
      paymentTerms: "دفع شهري مقدم",
      commission: 15,
      commissionType: "percentage",
      assignedTo: "نورا سالم",
      documents: ["retainer_agreement.pdf"],
      milestones: [],
      renewalDate: "2025-01-01",
      autoRenewal: true,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-15"
    }
  ];

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || selectedStatus === "all" || contract.status === selectedStatus;
    const matchesType = !selectedType || selectedType === "all" || contract.type === selectedType;
    const matchesCurrency = !selectedCurrency || selectedCurrency === "all" || contract.currency === selectedCurrency;
    
    return matchesSearch && matchesStatus && matchesType && matchesCurrency;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recruitment': return 'bg-purple-100 text-purple-800';
      case 'consulting': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'retainer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = {
      SAR: 'ر.س',
      USD: '$',
      EUR: '€',
      AED: 'د.إ'
    };
    return `${amount.toLocaleString()} ${symbols[currency as keyof typeof symbols]}`;
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    const usdAmount = amount * exchangeRates[fromCurrency as keyof typeof exchangeRates];
    return usdAmount / exchangeRates[toCurrency as keyof typeof exchangeRates];
  };

  const getTotalValue = (currency: string) => {
    return contracts
      .filter(c => c.status === 'active' || c.status === 'completed')
      .reduce((total, contract) => {
        const convertedValue = convertCurrency(contract.value, contract.currency, currency);
        return total + convertedValue;
      }, 0);
  };

  const handleAddContract = () => {
    if (newContract.title && newContract.client && newContract.value) {
      const contract: Contract = {
        id: Date.now().toString(),
        title: newContract.title,
        client: newContract.client,
        clientId: `client-${Date.now()}`,
        type: newContract.type as Contract['type'],
        status: newContract.status as Contract['status'],
        value: newContract.value,
        currency: newContract.currency as Contract['currency'],
        startDate: newContract.startDate!,
        endDate: newContract.endDate!,
        description: newContract.description!,
        terms: newContract.terms || [],
        paymentTerms: newContract.paymentTerms!,
        commission: newContract.commission!,
        commissionType: newContract.commissionType as Contract['commissionType'],
        assignedTo: newContract.assignedTo!,
        documents: [],
        milestones: [],
        autoRenewal: newContract.autoRenewal!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real app, this would save to backend
      contracts.push(contract);
      
      setNewContract({
        title: '',
        client: '',
        type: 'recruitment',
        status: 'draft',
        value: 0,
        currency: 'SAR',
        startDate: '',
        endDate: '',
        description: '',
        terms: [],
        paymentTerms: '',
        commission: 0,
        commissionType: 'percentage',
        assignedTo: '',
        documents: [],
        milestones: [],
        autoRenewal: false
      });
      setNewContractDialog(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة العقود</h1>
            <p className="text-gray-600 mt-1">إدارة العقود مع دعم العملات المتعددة</p>
          </div>
          <Dialog open={newContractDialog} onOpenChange={setNewContractDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                عقد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة عقد جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل العقد الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">عنوان العقد</Label>
                    <Input
                      id="title"
                      value={newContract.title}
                      onChange={(e) => setNewContract({...newContract, title: e.target.value})}
                      placeholder="عنوان العقد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client">العميل</Label>
                    <Input
                      id="client"
                      value={newContract.client}
                      onChange={(e) => setNewContract({...newContract, client: e.target.value})}
                      placeholder="اسم العميل"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">نوع العقد</Label>
                    <Select 
                      value={newContract.type} 
                      onValueChange={(value) => setNewContract({...newContract, type: value as Contract['type']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recruitment">توظيف</SelectItem>
                        <SelectItem value="consulting">استشارات</SelectItem>
                        <SelectItem value="training">تدريب</SelectItem>
                        <SelectItem value="retainer">خدمات مستمرة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">الحالة</Label>
                    <Select 
                      value={newContract.status} 
                      onValueChange={(value) => setNewContract({...newContract, status: value as Contract['status']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="pending">معلق</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">قيمة العقد</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newContract.value}
                      onChange={(e) => setNewContract({...newContract, value: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">العملة</Label>
                    <Select 
                      value={newContract.currency} 
                      onValueChange={(value) => setNewContract({...newContract, currency: value as Contract['currency']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="EUR">يورو (EUR)</SelectItem>
                        <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">تاريخ البداية</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newContract.startDate}
                      onChange={(e) => setNewContract({...newContract, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">تاريخ النهاية</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newContract.endDate}
                      onChange={(e) => setNewContract({...newContract, endDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={newContract.description}
                    onChange={(e) => setNewContract({...newContract, description: e.target.value})}
                    placeholder="وصف العقد"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commission">العمولة</Label>
                    <Input
                      id="commission"
                      type="number"
                      value={newContract.commission}
                      onChange={(e) => setNewContract({...newContract, commission: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissionType">نوع العمولة</Label>
                    <Select 
                      value={newContract.commissionType} 
                      onValueChange={(value) => setNewContract({...newContract, commissionType: value as Contract['commissionType']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">نسبة مئوية</SelectItem>
                        <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="assignedTo">المسؤول</Label>
                  <Input
                    id="assignedTo"
                    value={newContract.assignedTo}
                    onChange={(e) => setNewContract({...newContract, assignedTo: e.target.value})}
                    placeholder="اسم المسؤول"
                  />
                </div>
                
                <div>
                  <Label htmlFor="paymentTerms">شروط الدفع</Label>
                  <Textarea
                    id="paymentTerms"
                    value={newContract.paymentTerms}
                    onChange={(e) => setNewContract({...newContract, paymentTerms: e.target.value})}
                    placeholder="شروط الدفع"
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoRenewal"
                    checked={newContract.autoRenewal}
                    onCheckedChange={(checked) => setNewContract({...newContract, autoRenewal: checked as boolean})}
                  />
                  <Label htmlFor="autoRenewal">تجديد تلقائي</Label>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddContract} className="flex-1">
                    إضافة العقد
                  </Button>
                  <Button variant="outline" onClick={() => setNewContractDialog(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي العقود</p>
                  <p className="text-2xl font-bold text-blue-600">{contracts.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">العقود النشطة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {contracts.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">القيمة الإجمالية (ر.س)</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(getTotalValue('SAR'), 'SAR')}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">العقود المعلقة</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {contracts.filter(c => c.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Currency Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              ملخص العملات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(exchangeRates).map(currency => (
                <div key={currency} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{currency}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(getTotalValue(currency), currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {contracts.filter(c => c.currency === currency && (c.status === 'active' || c.status === 'completed')).length} عقد
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="البحث في العقود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="recruitment">توظيف</SelectItem>
                  <SelectItem value="consulting">استشارات</SelectItem>
                  <SelectItem value="training">تدريب</SelectItem>
                  <SelectItem value="retainer">خدمات مستمرة</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع العملات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملات</SelectItem>
                  <SelectItem value="SAR">ريال سعودي</SelectItem>
                  <SelectItem value="USD">دولار أمريكي</SelectItem>
                  <SelectItem value="EUR">يورو</SelectItem>
                  <SelectItem value="AED">درهم إماراتي</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                  setSelectedType("all");
                  setSelectedCurrency("all");
                }}
              >
                <Filter className="h-4 w-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContracts.map(contract => (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{contract.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {contract.client}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status === 'active' ? 'نشط' :
                       contract.status === 'completed' ? 'مكتمل' :
                       contract.status === 'pending' ? 'معلق' :
                       contract.status === 'draft' ? 'مسودة' :
                       contract.status === 'cancelled' ? 'ملغي' : 'منتهي'}
                    </Badge>
                    <Badge className={getTypeColor(contract.type)}>
                      {contract.type === 'recruitment' ? 'توظيف' :
                       contract.type === 'consulting' ? 'استشارات' :
                       contract.type === 'training' ? 'تدريب' : 'خدمات مستمرة'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">القيمة:</span>
                      <span className="font-medium mr-2 text-green-600">
                        {formatCurrency(contract.value, contract.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">العمولة:</span>
                      <span className="font-medium mr-2 text-blue-600">
                        {contract.commissionType === 'percentage' 
                          ? `${contract.commission}%` 
                          : formatCurrency(contract.commission, contract.currency)
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">تاريخ البداية:</span>
                      <span className="font-medium mr-2">
                        {new Date(contract.startDate).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">تاريخ النهاية:</span>
                      <span className="font-medium mr-2">
                        {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-600">المسؤول:</span>
                    <span className="font-medium mr-2">{contract.assignedTo}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {contract.description}
                  </div>
                  
                  {contract.milestones.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">المعالم:</span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {contract.milestones.map(milestone => (
                          <Badge key={milestone.id} className={getMilestoneStatusColor(milestone.status)} variant="outline">
                            {milestone.status === 'completed' ? 'مكتمل' :
                             milestone.status === 'in-progress' ? 'قيد التنفيذ' :
                             milestone.status === 'pending' ? 'معلق' : 'متأخر'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedContract(contract)}>
                          <Eye className="h-4 w-4 ml-2" />
                          عرض
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{contract.title}</DialogTitle>
                          <DialogDescription>{contract.client}</DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="details" className="mt-4">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="details">التفاصيل</TabsTrigger>
                            <TabsTrigger value="milestones">المعالم</TabsTrigger>
                            <TabsTrigger value="terms">الشروط</TabsTrigger>
                            <TabsTrigger value="documents">المستندات</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="details" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">معلومات العقد</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">النوع:</span>
                                    <Badge className={getTypeColor(contract.type)}>
                                      {contract.type === 'recruitment' ? 'توظيف' :
                                       contract.type === 'consulting' ? 'استشارات' :
                                       contract.type === 'training' ? 'تدريب' : 'خدمات مستمرة'}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">الحالة:</span>
                                    <Badge className={getStatusColor(contract.status)}>
                                      {contract.status === 'active' ? 'نشط' :
                                       contract.status === 'completed' ? 'مكتمل' :
                                       contract.status === 'pending' ? 'معلق' :
                                       contract.status === 'draft' ? 'مسودة' :
                                       contract.status === 'cancelled' ? 'ملغي' : 'منتهي'}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">القيمة:</span>
                                    <span className="font-semibold text-green-600">
                                      {formatCurrency(contract.value, contract.currency)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">العمولة:</span>
                                    <span className="font-semibold text-blue-600">
                                      {contract.commissionType === 'percentage' 
                                        ? `${contract.commission}%` 
                                        : formatCurrency(contract.commission, contract.currency)
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">المسؤول:</span>
                                    <span>{contract.assignedTo}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">التواريخ</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">تاريخ البداية:</span>
                                    <span>{new Date(contract.startDate).toLocaleDateString('ar-SA')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">تاريخ النهاية:</span>
                                    <span>{new Date(contract.endDate).toLocaleDateString('ar-SA')}</span>
                                  </div>
                                  {contract.signedDate && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">تاريخ التوقيع:</span>
                                      <span>{new Date(contract.signedDate).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                  )}
                                  {contract.renewalDate && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">تاريخ التجديد:</span>
                                      <span>{new Date(contract.renewalDate).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">التجديد التلقائي:</span>
                                    <span>{contract.autoRenewal ? 'نعم' : 'لا'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">الوصف</h4>
                              <p className="text-gray-700 text-sm">{contract.description}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">شروط الدفع</h4>
                              <p className="text-gray-700 text-sm">{contract.paymentTerms}</p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="milestones" className="space-y-4">
                            <div className="space-y-3">
                              {contract.milestones.map(milestone => (
                                <div key={milestone.id} className="p-4 border rounded-lg">
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-semibold">{milestone.title}</h5>
                                    <Badge className={getMilestoneStatusColor(milestone.status)}>
                                      {milestone.status === 'completed' ? 'مكتمل' :
                                       milestone.status === 'in-progress' ? 'قيد التنفيذ' :
                                       milestone.status === 'pending' ? 'معلق' : 'متأخر'}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                      <span className="text-gray-600">تاريخ الاستحقاق:</span>
                                      <span>{new Date(milestone.dueDate).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-600">القيمة:</span>
                                      <span className="font-semibold text-green-600">
                                        {formatCurrency(milestone.value, milestone.currency)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {contract.milestones.length === 0 && (
                                <p className="text-gray-500 text-center py-8">لا توجد معالم محددة لهذا العقد</p>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="terms" className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">شروط العقد</h4>
                              {contract.terms.length > 0 ? (
                                <ul className="space-y-2">
                                  {contract.terms.map((term, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <span className="text-blue-600 mt-1">•</span>
                                      <span>{term}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-500">لم يتم تحديد شروط خاصة لهذا العقد</p>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="documents" className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">المستندات المرفقة</h4>
                              {contract.documents.length > 0 ? (
                                <div className="space-y-2">
                                  {contract.documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{doc}</span>
                                      </div>
                                      <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 ml-2" />
                                        تحميل
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500">لا توجد مستندات مرفقة</p>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد عقود مطابقة</h3>
              <p className="text-gray-500">جرب تعديل معايير البحث أو الفلاتر</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ContractManagement;