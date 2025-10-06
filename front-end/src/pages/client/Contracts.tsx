import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { clientApiService } from "@/services/clientApi";
import type { ClientContract } from "@/services/clientApi";
import { 
  FileText, 
  Search, 
  Filter, 
  Edit, 
  Eye,
  Download,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  Briefcase
} from "lucide-react";

const ClientContracts = () => {
  const { t, isRTL } = useLanguage();
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [contractStats, setContractStats] = useState({
    active: 0,
    pending: 0,
    totalValue: 0,
    expiringSoon: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();



  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const [contractsResponse, statsResponse] = await Promise.all([
          clientApiService.getClientContracts(),
          clientApiService.getContractStats()
        ]);
        
        if (Array.isArray(contractsResponse)) {
          setContracts(contractsResponse);
        } else {
          setContracts([]);
        }
        
        if (statsResponse) {
          setContractStats(statsResponse);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setContracts([]);
        toast({
          title: t('common.error'),
          description: t('client.contracts.loadingError'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [toast]);

  const handleDownloadContract = async (contractId: string) => {
    try {
      const blob = await clientApiService.downloadContract(contractId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('client.contracts.downloadError'),
        variant: "destructive",
      });
    }
  };

  const handleRenewContract = async (contractId: string) => {
    try {
      await clientApiService.renewContract(contractId, {});
      toast({
        title: t('common.success'),
        description: t('client.contracts.renewSuccess'),
      });
      // Refresh contracts
      const contractsResponse = await clientApiService.getClientContracts();
      if (Array.isArray(contractsResponse)) {
        setContracts(contractsResponse);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('client.contracts.renewError'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <MainLayout userRole="client" userName="مدير الموارد البشرية">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{t('client.contracts.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط":
        return "bg-secondary text-secondary-foreground";
      case "مكتمل":
        return "bg-info text-info-foreground";
      case "قيد التوقيع":
        return "bg-warning text-warning-foreground";
      case "منتهي":
        return "bg-muted text-muted-foreground";
      case "ملغي":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "نشط":
        return <CheckCircle className="h-4 w-4" />;
      case "مكتمل":
        return <CheckCircle className="h-4 w-4" />;
      case "قيد التوقيع":
        return <Clock className="h-4 w-4" />;
      case "منتهي":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout userRole="client" userName="مدير الموارد البشرية">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('client.contracts.title')}</h1>
          <p className="text-muted-foreground">{t('client.contracts.subtitle')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('client.contracts.stats.active')}</p>
                  <p className="text-2xl font-bold">{contractStats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('client.contracts.stats.pending')}</p>
                  <p className="text-2xl font-bold">{contractStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('client.contracts.stats.totalValue')}</p>
                  <p className="text-2xl font-bold">{contractStats.totalValue.toLocaleString()} ريال</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('client.contracts.stats.expiringSoon')}</p>
                  <p className="text-2xl font-bold">{contractStats.expiringSoon}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-accent" />
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
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('client.contracts.searchPlaceholder')}
                    className="pr-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {t('client.contracts.filter')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contracts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('client.contracts.contractsList')} ({contracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="p-3 lg:p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
                    {/* Contract Info */}
                    <div className="md:col-span-2 lg:col-span-4">
                      <div className="flex items-start gap-2 lg:gap-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-base lg:text-lg truncate">{contract.id}</h4>
                          <p className="text-xs lg:text-sm text-muted-foreground truncate">{contract.jobTitle}</p>
                          <div className="flex items-center gap-1 lg:gap-2 mt-1">
                            <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs lg:text-sm text-muted-foreground truncate">{contract.department}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Employee Info */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <div className="space-y-1 lg:space-y-2">
                        <div className="flex items-center gap-1 lg:gap-2">
                          <Users className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm lg:text-base truncate">{contract.candidateName}</span>
                        </div>
                        <p className="text-xs lg:text-sm text-muted-foreground truncate">{contract.candidateEmail}</p>
                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                          <Briefcase className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{contract.contractType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contract Details */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <div className="space-y-1 lg:space-y-2 text-xs lg:text-sm">
                        <div className="flex items-center gap-1 lg:gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{t('client.contracts.from')} {contract.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1 lg:gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{t('client.contracts.to')} {contract.endDate}</span>
                        </div>
                        <div className="flex items-center gap-1 lg:gap-2">
                          <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate">{contract.salary} ريال/شهر</span>
                        </div>
                        <p className="text-muted-foreground truncate">{t('client.contracts.probationPeriod')}: {contract.probationPeriod}</p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="md:col-span-2 lg:col-span-2">
                      <div className="flex flex-col md:items-end gap-2 lg:gap-3">
                        <Badge className={`gap-1 lg:gap-2 text-xs ${getStatusColor(contract.status)}`}>
                          {getStatusIcon(contract.status)}
                          {contract.status}
                        </Badge>
                        
                        <div className="text-left md:text-right text-xs lg:text-sm">
                          <p className="text-muted-foreground">{t('client.contracts.signedDate')}:</p>
                          <p className="font-medium truncate">{contract.signedDate}</p>
                        </div>
                        
                        <div className="text-left md:text-right text-xs lg:text-sm">
                          <p className="text-muted-foreground">المدة:</p>
                          <p className="font-medium truncate">{contract.duration}</p>
                        </div>

                        <div className="flex gap-1 lg:gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                            onClick={() => handleDownloadContract(contract.id)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 lg:h-8 lg:w-8 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 w-7 lg:h-8 lg:w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefits Section */}
                  <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
                      <div className="flex-1">
                        <p className="text-xs lg:text-sm font-medium mb-2">{t('client.contracts.benefits')}:</p>
                        <div className="flex flex-wrap gap-1">
                          {contract.benefits.map((benefit, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <Button 
                          size="sm" 
                          className="h-7 lg:h-8 px-2 lg:px-3 text-xs"
                          onClick={() => handleRenewContract(contract.id)}
                        >
                          {t('client.contracts.renew')}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 lg:h-8 px-2 lg:px-3 text-xs">
                          {t('client.contracts.editTerms')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ClientContracts;