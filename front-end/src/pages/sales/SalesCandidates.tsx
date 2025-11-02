import { useEffect, useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSalesCurrency } from '@/contexts/SalesCurrencyContext';
import { toast } from '@/hooks/use-toast';
import { hrApiService } from '@/services/hrApi';
import { salesOffersApiService } from '@/services/salesOffersApi';
import { Users, Briefcase, Search, DollarSign, FileText, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { SalesOffer } from '@/services/salesOffersApi';

type Candidate = {
  id: string;
  userId?: string;
  applicantId?: string; // Applicant.id (not User.id)
  applicationId?: string;
  name: string;
  email: string;
  position: string;
  jobId?: string;
  jobTitle?: string;
  status: string;
  appliedDate: string;
  clientId?: string;
};

export default function SalesCandidates() {
  const { t } = useLanguage();
  const { currency, getCurrencyIcon } = useSalesCurrency();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [offers, setOffers] = useState<SalesOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNotes, setOfferNotes] = useState('');

  useEffect(() => {
    fetchCandidates();
    fetchOffers();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const resp = await hrApiService.getApplicants('OFFER');
      // فلترة المتقدمين بحالة OFFER فقط
      const list = (resp.data || []).flatMap((a: any) => {
        const apps = a.applications || [];
        return apps
          .filter((app: any) => app.status === 'OFFER')
          .map((app: any) => ({
            id: `${a.id}-${app.id}`,
            userId: a.user?.id || a.userId,
            applicantId: a.id, // Applicant.id
            applicationId: app.id,
            name: a.user?.name || 'غير محدد',
            email: a.user?.email || '',
            position: app.job?.title || 'غير محدد',
            jobId: app.jobId || app.job?.id,
            jobTitle: app.job?.title,
            status: app.status,
            appliedDate: new Date(app.createdAt || a.createdAt || Date.now()).toLocaleDateString('ar-SA'),
            clientId: app.job?.clientId,
          }));
      });
      setCandidates(list);
    } catch (e: any) {
      console.error('Error fetching candidates:', e);
      toast({
        title: t('common.error'),
        description: e?.response?.data?.message || 'فشل في جلب المرشحين',
        variant: 'destructive',
      });
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const data = await salesOffersApiService.getAll();
      setOffers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Error fetching offers:', e);
      setOffers([]);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  const openOfferDialog = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setOfferAmount('');
    setOfferNotes('');
    setIsOfferDialogOpen(true);
  };

  const createOffer = async () => {
    if (!selectedCandidate || !selectedCandidate.applicationId || !selectedCandidate.applicantId || !selectedCandidate.jobId) {
      toast({ title: t('common.error'), description: 'بيانات غير مكتملة', variant: 'destructive' });
      return;
    }
    const numeric = parseFloat(offerAmount || '0');
    if (!numeric || isNaN(numeric)) {
      toast({ title: t('common.error'), description: 'المبلغ مطلوب', variant: 'destructive' });
      return;
    }
    try {
      await salesOffersApiService.create({
        applicationId: selectedCandidate.applicationId,
        applicantId: selectedCandidate.applicantId, // Applicant.id
        jobId: selectedCandidate.jobId,
        value: numeric,
        currency,
        notes: offerNotes || undefined,
      });
      
      toast({ title: t('common.success'), description: 'تم إرسال العرض للمتقدم' });
      setIsOfferDialogOpen(false);
      setSelectedCandidate(null);
      setOfferAmount('');
      setOfferNotes('');
      await fetchOffers(); // إعادة تحميل العروض
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.response?.data?.message || 'فشل إرسال العرض', variant: 'destructive' });
    }
  };

  // الحصول على عرض لهذا المرشح (بناءً على applicationId)
  const getCandidateOffer = (candidate: Candidate): SalesOffer | undefined => {
    return offers.find(offer => 
      offer.applicationId === candidate.applicationId &&
      offer.jobId === candidate.jobId
    );
  };

  // عرض حالة العرض
  const getOfferStatusBadge = (offer: SalesOffer) => {
    if (offer.status === 'ACCEPTED' || offer.applicantResponse === 'ACCEPTED') {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          مقبول
        </Badge>
      );
    }
    if (offer.status === 'REJECTED' || offer.applicantResponse === 'REJECTED') {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          مرفوض
        </Badge>
      );
    }
    if (offer.status === 'PENDING' || !offer.applicantResponse) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          في انتظار الرد
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800">
        {offer.status}
      </Badge>
    );
  };

  return (
    <MainLayout userRole="sales">
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">المرشحون المؤهلون</h1>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ابحث عن مرشح..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <Card>
          <CardHeader>
            <CardTitle>المرشحون بحالة OFFER ({filteredCandidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-6 text-center">جاري التحميل...</div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">لا يوجد مرشحون مؤهلون حالياً</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCandidates.map(c => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{c.position}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        تاريخ التقديم: {c.appliedDate}
                      </div>
                      <Badge className="bg-green-100 text-green-800">{c.status}</Badge>
                      
                      {/* عرض حالة العرض أو زر تقديم عرض */}
                      {(() => {
                        const offer = getCandidateOffer(c);
                        if (offer) {
                          return (
                            <div className="pt-2 space-y-2">
                              {getOfferStatusBadge(offer)}
                              <div className="text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <span className="text-red-500 font-bold">{getCurrencyIcon(offer.currency as any)}</span>
                                  <span>القيمة: {offer.value.toLocaleString()} {offer.currency}</span>
                                </div>
                                {offer.notes && (
                                  <div className="mt-1 text-xs">ملاحظات: {offer.notes}</div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div className="pt-2">
                            <Button size="sm" onClick={() => openOfferDialog(c)} className="w-full">
                              <DollarSign className="h-4 w-4 ml-2" />
                              تقديم عرض
                            </Button>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Offer Dialog */}
        <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تقديم عرض للمرشح</DialogTitle>
              <DialogDescription>
                {selectedCandidate && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>المرشح:</strong> {selectedCandidate.name}</p>
                    <p><strong>الوظيفة:</strong> {selectedCandidate.position}</p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-bold text-xl">{getCurrencyIcon(currency as any)}</span>
                  <Input 
                    type="number" 
                    value={offerAmount} 
                    onChange={(e) => setOfferAmount(e.target.value)} 
                    placeholder="0" 
                  />
                  <span className="text-sm font-medium">{currency}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات إضافية (اختياري)</Label>
                <Textarea 
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="أي معلومات إضافية تريد تقديمها للمرشح..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={createOffer}>
                  إرسال العرض
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

