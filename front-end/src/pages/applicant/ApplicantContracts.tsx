import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSalesCurrency } from '@/contexts/SalesCurrencyContext';
import contractsApi, { Contract } from '@/services/contractsApi';
import { useAuth } from '@/contexts/AuthContext';
import { applicantApiService, Interview } from '@/services/applicantApi';
import { salesOffersApiService, SalesOffer } from '@/services/salesOffersApi';
import { Calendar, Clock, Phone, Video, MapPin, User, CheckCircle, XCircle, Eye, Building2, Briefcase, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ApplicantContracts() {
  const { t } = useLanguage();
  const { currency, getCurrencyIcon } = useSalesCurrency();
  const { user } = useAuth();
  // applicantId في Contract هو userId من User
  const applicantId = user?.id;

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [salesOffers, setSalesOffers] = useState<SalesOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  // Interview response states
  const [isInterviewRejectDialogOpen, setIsInterviewRejectDialogOpen] = useState(false);
  const [rejectInterview, setRejectInterview] = useState<Interview | null>(null);
  const [interviewRejectDate, setInterviewRejectDate] = useState("");
  const [interviewRejectTime, setInterviewRejectTime] = useState("");
  const [interviewRejectNotes, setInterviewRejectNotes] = useState("");
  // Contract details dialog
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedContractDetails, setSelectedContractDetails] = useState<Contract | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  // Sales offer response states
  const [isOfferRejectDialogOpen, setIsOfferRejectDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<SalesOffer | null>(null);
  const [offerRejectNotes, setOfferRejectNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!applicantId) return;
      try {
        setLoading(true);
        const resp = await contractsApi.getContracts({ applicantId, page: 1, limit: 50 });
        // البنية الصحيحة: { data: Contract[], pagination: {...} }
        const contractsList = resp.data || resp.contracts || [];
        setContracts(Array.isArray(contractsList) ? contractsList : []);
      } catch (error) {
        console.error('Error loading contracts:', error);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    fetchInterviews();
    fetchSalesOffers();
  }, [applicantId]);

  const fetchInterviews = async () => {
    try {
      setInterviewsLoading(true);
      const data = await applicantApiService.getMyInterviews();
      console.log('Interviews fetched:', data);
      // تأكد من أن البيانات عبارة عن array
      if (Array.isArray(data)) {
        setInterviews(data);
      } else if (data && Array.isArray(data.data)) {
        setInterviews(data.data);
      } else {
        setInterviews([]);
      }
    } catch (error) {
      console.error('Error loading interviews:', error);
      setInterviews([]);
    } finally {
      setInterviewsLoading(false);
    }
  };

  const fetchSalesOffers = async () => {
    try {
      setOffersLoading(true);
      const data = await salesOffersApiService.getApplicantOffers();
      setSalesOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading sales offers:', error);
      setSalesOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'PHONE': return <Phone className="h-4 w-4" />;
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'IN_PERSON': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getInterviewStatusBadge = (interview: Interview) => {
    if (interview.applicantResponse === 'ACCEPTED') {
      return <Badge className="bg-green-100 text-green-800">✓ تم القبول</Badge>;
    }
    if (interview.applicantResponse === 'REJECTED' && interview.hrResponse === 'PENDING') {
      return <Badge className="bg-yellow-100 text-yellow-800">⏳ في انتظار مراجعة HR</Badge>;
    }
    if (interview.applicantResponse === 'REJECTED' && interview.hrResponse === 'APPROVED') {
      return <Badge className="bg-blue-100 text-blue-800">✓ تم إعادة الجدولة</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">مجدولة</Badge>;
  };

  // تصنيف العقود حسب الحالة
  const offerContracts = useMemo(() => contracts.filter(c => c.status === 'PENDING' || c.status === 'DRAFT'), [contracts]);
  const acceptedContracts = useMemo(() => contracts.filter(c => c.status === 'ACTIVE'), [contracts]);
  const rejectedContracts = useMemo(() => contracts.filter(c => c.status === 'CANCELLED'), [contracts]);
  const allContracts = useMemo(() => contracts, [contracts]);

  const accept = async (c: Contract) => {
    try {
      await contractsApi.applicantRespond(c.id, 'ACCEPT');
      setContracts(prev => prev.map(x => x.id === c.id ? { ...x, status: 'ACTIVE' } : x));
    } catch (error: any) {
      console.error('Error accepting contract:', error);
      alert(error?.response?.data?.message || 'فشل قبول العقد');
    }
  };

  const openReject = (c: Contract) => {
    setActiveContract(c);
    setRejectNotes('');
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!activeContract) return;
    try {
      await contractsApi.applicantRespond(activeContract.id, 'REJECT', rejectNotes);
      setContracts(prev => prev.map(x => x.id === activeContract.id ? { ...x, status: 'CANCELLED' } : x));
      setRejectDialogOpen(false);
      setActiveContract(null);
      setRejectNotes('');
    } catch (error: any) {
      console.error('Error rejecting contract:', error);
      alert(error?.response?.data?.message || 'فشل رفض العقد');
    }
  };

  const renderContractCard = (c: Contract, showActions: boolean = false) => (
    <Card key={c.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-medium">{c.jobTitle || c.title}</div>
          <Badge className={
            c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            c.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }>
            {c.status === 'PENDING' ? 'في انتظار الرد' : 
             c.status === 'DRAFT' ? 'مسودة' : 
             c.status === 'ACTIVE' ? 'مقبول' : 
             c.status === 'CANCELLED' ? 'مرفوض' : 
             c.status}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">العميل: {c.client?.name || '-'}</div>
        {c.description && (
          <div className="text-xs text-muted-foreground line-clamp-2">{c.description}</div>
        )}
        <div className="flex items-center gap-1 text-sm">
          <span className="text-red-500 font-bold">{getCurrencyIcon(c.currency as any)}</span>
          <span className="font-medium">{(c.value || 0).toLocaleString()} {c.currency}</span>
        </div>
        <div className="pt-2 flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => openDetails(c)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 ml-2" />
            تفاصيل
          </Button>
          {showActions && (c.status === 'PENDING' || c.status === 'DRAFT') && (
            <>
              <Button size="sm" onClick={() => accept(c)}>قبول</Button>
              <Button size="sm" variant="outline" onClick={() => openReject(c)}>رفض مع ملاحظة</Button>
            </>
          )}
        </div>
        {c.status === 'ACTIVE' && (
          <div className="pt-2 text-xs text-green-600">✓ تم قبول هذا العرض</div>
        )}
        {c.status === 'CANCELLED' && (
          <div className="pt-2 text-xs text-red-600">✗ تم رفض هذا العرض</div>
        )}
      </CardContent>
    </Card>
  );

  const openDetails = async (contract: Contract) => {
    try {
      setLoadingDetails(true);
      setIsDetailsDialogOpen(true);
      // جلب تفاصيل العقد الكاملة من API
      const details = await contractsApi.getContract(contract.id);
      setSelectedContractDetails(details as any);
    } catch (error: any) {
      console.error('Error loading contract details:', error);
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || 'فشل في جلب التفاصيل',
        variant: 'destructive',
      });
      setIsDetailsDialogOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // معالجة قبول عرض Sales
  const handleAcceptOffer = async (offer: SalesOffer) => {
    try {
      await salesOffersApiService.applicantRespond(offer.id, 'ACCEPTED');
      toast({ title: t('common.success'), description: 'تم قبول العرض' });
      fetchSalesOffers();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.response?.data?.message || 'فشل قبول العرض', variant: 'destructive' });
    }
  };

  // معالجة رفض عرض Sales
  const handleRejectOffer = (offer: SalesOffer) => {
    setSelectedOffer(offer);
    setOfferRejectNotes('');
    setIsOfferRejectDialogOpen(true);
  };

  const confirmRejectOffer = async () => {
    if (!selectedOffer) return;
    try {
      await salesOffersApiService.applicantRespond(selectedOffer.id, 'REJECTED', offerRejectNotes || undefined);
      toast({ title: t('common.success'), description: 'تم رفض العرض' });
      setIsOfferRejectDialogOpen(false);
      setSelectedOffer(null);
      setOfferRejectNotes('');
      fetchSalesOffers();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.response?.data?.message || 'فشل رفض العرض', variant: 'destructive' });
    }
  };

  // الحصول على Badge لحالة عرض Sales
  const getSalesOfferStatusBadge = (offer: SalesOffer) => {
    if (offer.status === 'ACCEPTED' || offer.applicantResponse === 'ACCEPTED') {
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> مقبول</Badge>;
    }
    if (offer.status === 'REJECTED' || offer.applicantResponse === 'REJECTED') {
      return <Badge className="bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="h-3 w-3" /> مرفوض</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><Clock className="h-3 w-3" /> في انتظار الرد</Badge>;
  };

  // تصنيف عروض Sales
  const pendingOffers = useMemo(() => salesOffers.filter(o => o.status === 'PENDING' && !o.applicantResponse), [salesOffers]);
  const acceptedOffers = useMemo(() => salesOffers.filter(o => o.status === 'ACCEPTED' || o.applicantResponse === 'ACCEPTED'), [salesOffers]);
  const rejectedOffers = useMemo(() => salesOffers.filter(o => o.status === 'REJECTED' || o.applicantResponse === 'REJECTED'), [salesOffers]);

  return (
    <MainLayout userRole="applicant">
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl sm:text-3xl font-bold">عقودي والمقابلات</h1>

        {/* عروض العمل الواردة (في انتظار الرد) */}
        <Card>
          <CardHeader>
            <CardTitle>عروض العمل الواردة ({offerContracts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-6 text-center">جاري التحميل...</div>
            ) : offerContracts.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">لا توجد عروض حالياً</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offerContracts.map(c => renderContractCard(c, true))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* العقود المقبولة */}
        {acceptedContracts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>العقود المقبولة ({acceptedContracts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedContracts.map(c => renderContractCard(c, false))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* العقود المرفوضة */}
        {rejectedContracts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>العقود المرفوضة ({rejectedContracts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rejectedContracts.map(c => renderContractCard(c, false))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* جميع العقود (ملخص) */}
        {allContracts.length === 0 && !loading && (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              لا توجد عقود حتى الآن
            </CardContent>
          </Card>
        )}

        {/* عروض Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              عروض المبيعات ({salesOffers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {offersLoading ? (
              <div className="py-6 text-center">جاري التحميل...</div>
            ) : salesOffers.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">لا توجد عروض من المبيعات حالياً</div>
            ) : (
              <div className="space-y-4">
                {/* العروض في انتظار الرد */}
                {pendingOffers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-yellow-700">عروض في انتظار الرد ({pendingOffers.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingOffers.map(offer => (
                        <Card key={offer.id} className="hover:shadow-md transition-shadow border-yellow-200 bg-yellow-50">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{offer.job?.title || offer.application?.job?.title || 'عرض عمل'}</div>
                              {getSalesOfferStatusBadge(offer)}
                            </div>
                            {offer.createdByUser && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                من: {offer.createdByUser.name}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-red-500 font-bold">{getCurrencyIcon(offer.currency as any)}</span>
                              <span className="font-medium">{(offer.value || 0).toLocaleString()} {offer.currency}</span>
                            </div>
                            {offer.notes && (
                              <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                                {offer.notes}
                              </div>
                            )}
                            <div className="pt-2 flex items-center gap-2">
                              <Button size="sm" onClick={() => handleAcceptOffer(offer)} className="flex-1 bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 ml-2" />
                                قبول
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleRejectOffer(offer)} className="flex-1 border-red-300 text-red-600 hover:bg-red-50">
                                <XCircle className="h-4 w-4 ml-2" />
                                رفض
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* العروض المقبولة */}
                {acceptedOffers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-green-700">العروض المقبولة ({acceptedOffers.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {acceptedOffers.map(offer => (
                        <Card key={offer.id} className="hover:shadow-md transition-shadow border-green-200 bg-green-50">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{offer.job?.title || offer.application?.job?.title || 'عرض عمل'}</div>
                              {getSalesOfferStatusBadge(offer)}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-red-500 font-bold">{getCurrencyIcon(offer.currency as any)}</span>
                              <span className="font-medium">{(offer.value || 0).toLocaleString()} {offer.currency}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* العروض المرفوضة */}
                {rejectedOffers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-red-700">العروض المرفوضة ({rejectedOffers.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rejectedOffers.map(offer => (
                        <Card key={offer.id} className="hover:shadow-md transition-shadow border-red-200 bg-red-50">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{offer.job?.title || offer.application?.job?.title || 'عرض عمل'}</div>
                              {getSalesOfferStatusBadge(offer)}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-red-500 font-bold">{getCurrencyIcon(offer.currency as any)}</span>
                              <span className="font-medium">{(offer.value || 0).toLocaleString()} {offer.currency}</span>
                            </div>
                            {offer.applicantRejectedNotes && (
                              <div className="text-xs text-muted-foreground bg-white p-2 rounded border">
                                ملاحظات الرفض: {offer.applicantRejectedNotes}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* قسم المقابلات - يظهر المقابلات التي حددها HR */}
        <Card>
          <CardHeader>
            <CardTitle>المقابلات المجدولة من HR ({interviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {interviewsLoading ? (
              <div className="py-6 text-center">جاري التحميل...</div>
            ) : interviews.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">لا توجد مقابلات مجدولة حالياً</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviews.map(interview => (
                  <Card key={interview.id} className="hover:shadow-md transition-shadow border-blue-200 bg-blue-50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-lg">{interview.title}</div>
                        {getInterviewStatusBadge(interview)}
                      </div>
                      
                      {interview.application?.job?.title && (
                        <div className="text-sm text-gray-700 font-medium">
                          📋 الوظيفة: {interview.application.job.title}
                        </div>
                      )}
                      
                      {/* التاريخ والوقت - بارز */}
                      <div className="bg-white p-3 rounded-lg border-2 border-blue-200">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span>📅 {new Date(interview.scheduledAt).toLocaleDateString('ar-SA', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <span>🕐 {new Date(interview.scheduledAt).toLocaleTimeString('ar-SA', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm bg-gray-100 p-2 rounded">
                        {getInterviewTypeIcon(interview.type)}
                        <span className="font-medium">
                          {interview.type === 'PHONE' ? '📞 مقابلة هاتفية' : 
                           interview.type === 'VIDEO' ? '📹 مقابلة فيديو' : 
                           interview.type === 'IN_PERSON' ? '🏢 مقابلة وجاهية' : 
                           interview.type}
                        </span>
                      </div>
                      
                      {interview.description && (
                        <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                          <strong>ملاحظات:</strong> {interview.description}
                        </div>
                      )}
                      
                      {interview.scheduledByUser && (
                        <div className="text-xs text-gray-600 flex items-center gap-1 bg-gray-100 p-2 rounded">
                          <User className="h-3 w-3" />
                          <span><strong>جدول بواسطة:</strong> {interview.scheduledByUser.name}</span>
                        </div>
                      )}
                      
                      {(interview.status === 'SCHEDULED' || interview.status === 'CONFIRMED') && 
                       !interview.applicantResponse && (
                        <div className="pt-2 flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={async () => {
                              try {
                                await applicantApiService.respondToInterview(interview.id, 'ACCEPTED');
                                toast({ title: t('common.success'), description: 'تم قبول المقابلة' });
                                fetchInterviews();
                              } catch (error: any) {
                                toast({ title: t('common.error'), description: error?.response?.data?.message || 'حدث خطأ', variant: 'destructive' });
                              }
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 ml-2" />
                            قبول
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setRejectInterview(interview);
                              setInterviewRejectDate("");
                              setInterviewRejectTime("");
                              setInterviewRejectNotes("");
                              setIsInterviewRejectDialogOpen(true);
                            }}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            variant="outline"
                          >
                            <XCircle className="h-4 w-4 ml-2" />
                            رفض
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>سبب الرفض</DialogTitle>
              <DialogDescription>اذكر ملاحظاتك ليتواصل معك مسئول التوظيف لاحقاً.</DialogDescription>
            </DialogHeader>
            <Textarea value={rejectNotes} onChange={(e)=>setRejectNotes(e.target.value)} placeholder="اكتب سبب الرفض..." />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={()=>setRejectDialogOpen(false)}>إلغاء</Button>
              <Button onClick={confirmReject}>تأكيد الرفض</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Interview Dialog */}
        <Dialog open={isInterviewRejectDialogOpen} onOpenChange={setIsInterviewRejectDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>رفض المقابلة</DialogTitle>
              <DialogDescription>
                يمكنك رفض المقابلة واقتراح ميعاد جديد. سيتم إرسال الطلب للموافقة.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {rejectInterview && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">المقابلة: {rejectInterview.title}</p>
                  <p className="text-xs text-gray-600">
                    الميعاد الأصلي: {new Date(rejectInterview.scheduledAt).toLocaleString('ar-SA')}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>ميعاد مقترح جديد <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">التاريخ <span className="text-red-500">*</span></Label>
                    <Input 
                      type="date" 
                      value={interviewRejectDate}
                      onChange={(e) => setInterviewRejectDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">الوقت <span className="text-red-500">*</span></Label>
                    <Input 
                      type="time" 
                      value={interviewRejectTime}
                      onChange={(e) => setInterviewRejectTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea 
                  value={interviewRejectNotes}
                  onChange={(e) => setInterviewRejectNotes(e.target.value)}
                  placeholder="اكتب سبب الرفض أو أي ملاحظات..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsInterviewRejectDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={async () => {
                    if (!rejectInterview) return;
                    
                    // التحقق من أن الميعاد المقترح موجود
                    if (!interviewRejectDate || !interviewRejectTime) {
                      toast({ title: t('common.error'), description: 'الميعاد المقترح مطلوب', variant: 'destructive' });
                      return;
                    }
                    
                    try {
                      const suggestedDate = new Date(`${interviewRejectDate}T${interviewRejectTime}`).toISOString();

                      await applicantApiService.respondToInterview(
                        rejectInterview.id, 
                        'REJECTED',
                        suggestedDate,
                        interviewRejectNotes || undefined
                      );
                      
                      toast({ title: t('common.success'), description: 'تم إرسال طلب رفض المقابلة' });
                      setIsInterviewRejectDialogOpen(false);
                      setRejectInterview(null);
                      setInterviewRejectDate("");
                      setInterviewRejectTime("");
                      setInterviewRejectNotes("");
                      fetchInterviews();
                    } catch (error: any) {
                      toast({ title: t('common.error'), description: error?.response?.data?.message || 'حدث خطأ', variant: 'destructive' });
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  إرسال طلب الرفض
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contract Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">تفاصيل العقد</DialogTitle>
              <DialogDescription>
                عرض تفاصيل العقد والوظيفة والشركة والمتقدم
              </DialogDescription>
            </DialogHeader>
            {loadingDetails ? (
              <div className="py-6 text-center">جاري التحميل...</div>
            ) : selectedContractDetails ? (
              <div className="space-y-6 mt-4">
                {/* معلومات العقد */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      معلومات العقد
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>العنوان:</strong> {selectedContractDetails.title}</div>
                    {selectedContractDetails.description && (
                      <div><strong>الوصف:</strong> {selectedContractDetails.description}</div>
                    )}
                    <div><strong>القيمة:</strong> 
                      <span className="text-red-500 font-bold mr-2">{getCurrencyIcon(selectedContractDetails.currency as any)}</span>
                      {(selectedContractDetails.value || 0).toLocaleString()} {selectedContractDetails.currency}
                    </div>
                    <div><strong>الحالة:</strong> {selectedContractDetails.status}</div>
                    {selectedContractDetails.startDate && (
                      <div><strong>تاريخ البدء:</strong> {new Date(selectedContractDetails.startDate).toLocaleDateString('ar-SA')}</div>
                    )}
                    {selectedContractDetails.endDate && (
                      <div><strong>تاريخ الانتهاء:</strong> {new Date(selectedContractDetails.endDate).toLocaleDateString('ar-SA')}</div>
                    )}
                  </CardContent>
                </Card>

                {/* معلومات الوظيفة */}
                {(selectedContractDetails as any).application?.job && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        معلومات الوظيفة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>المسمى الوظيفي:</strong> {(selectedContractDetails as any).application.job.title}</div>
                      {(selectedContractDetails as any).application.job.description && (
                        <div><strong>الوصف:</strong> {(selectedContractDetails as any).application.job.description}</div>
                      )}
                      {(selectedContractDetails as any).application.job.location && (
                        <div><strong>الموقع:</strong> {(selectedContractDetails as any).application.job.location}</div>
                      )}
                      {((selectedContractDetails as any).application.job.salaryMin || (selectedContractDetails as any).application.job.salaryMax) && (
                        <div><strong>الراتب:</strong> 
                          {(selectedContractDetails as any).application.job.salaryMin && (selectedContractDetails as any).application.job.salaryMax ? (
                            <>{(selectedContractDetails as any).application.job.salaryMin.toLocaleString()} - {(selectedContractDetails as any).application.job.salaryMax.toLocaleString()} {(selectedContractDetails as any).application.job.salaryCurrency || 'SAR'}</>
                          ) : (selectedContractDetails as any).application.job.salaryMin ? (
                            <>&gt; {(selectedContractDetails as any).application.job.salaryMin.toLocaleString()} {(selectedContractDetails as any).application.job.salaryCurrency || 'SAR'}</>
                          ) : null}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* معلومات الشركة */}
                {((selectedContractDetails as any).client || (selectedContractDetails as any).application?.job?.client) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        معلومات الشركة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const client = (selectedContractDetails as any).application?.job?.client || (selectedContractDetails as any).client;
                        return (
                          <>
                            <div><strong>اسم الشركة:</strong> {client.company || client.name}</div>
                            <div><strong>اسم العميل:</strong> {client.name}</div>
                            {client.email && <div><strong>البريد الإلكتروني:</strong> {client.email}</div>}
                            {client.phone && <div><strong>الهاتف:</strong> {client.phone}</div>}
                            {(client as any).industry && <div><strong>الصناعة:</strong> {(client as any).industry}</div>}
                            {(client as any).address && <div><strong>العنوان:</strong> {(client as any).address}</div>}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* معلومات المتقدم */}
                {((selectedContractDetails as any).applicant || (selectedContractDetails as any).application?.applicant) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        معلومات المتقدم
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const applicant = (selectedContractDetails as any).applicant || (selectedContractDetails as any).application?.applicant;
                        const user = applicant?.user;
                        return (
                          <>
                            {user?.name && <div><strong>الاسم:</strong> {user.name}</div>}
                            {user?.email && <div><strong>البريد الإلكتروني:</strong> {user.email}</div>}
                            {user?.phone && <div><strong>الهاتف:</strong> {user.phone}</div>}
                            {(selectedContractDetails as any).application?.status && (
                              <div><strong>حالة الطلب:</strong> {(selectedContractDetails as any).application.status}</div>
                            )}
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                إغلاق
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Sales Offer Dialog */}
        <Dialog open={isOfferRejectDialogOpen} onOpenChange={setIsOfferRejectDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>رفض عرض المبيعات</DialogTitle>
              <DialogDescription>
                {selectedOffer && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>الوظيفة:</strong> {selectedOffer.job?.title || selectedOffer.application?.job?.title || 'عرض عمل'}</p>
                    <p><strong>القيمة:</strong> 
                      <span className="text-red-500 font-bold mr-1">{getCurrencyIcon(selectedOffer.currency as any)}</span>
                      {selectedOffer.value.toLocaleString()} {selectedOffer.currency}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ملاحظات الرفض (اختياري)</Label>
                <Textarea 
                  value={offerRejectNotes}
                  onChange={(e) => setOfferRejectNotes(e.target.value)}
                  placeholder="يرجى توضيح سبب الرفض إن أمكن..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsOfferRejectDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button variant="destructive" onClick={confirmRejectOffer}>
                  تأكيد الرفض
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}


