import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSalesCurrency } from '@/contexts/SalesCurrencyContext';
import { toast } from '@/hooks/use-toast';
import { salesOffersApiService, SalesOffer } from '@/services/salesOffersApi';
import { DollarSign, CheckCircle, XCircle, AlertCircle, Briefcase, User } from 'lucide-react';

export default function ApplicantSalesOffers() {
  const { t } = useLanguage();
  const { currency, getCurrencyIcon } = useSalesCurrency();

  const [offers, setOffers] = useState<SalesOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<SalesOffer | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await salesOffersApiService.getApplicantOffers();
      setOffers(data);
    } catch (e) {
      console.error('Error fetching offers:', e);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offer: SalesOffer) => {
    try {
      await salesOffersApiService.applicantRespond(offer.id, 'ACCEPTED');
      toast({ title: t('common.success'), description: 'تم قبول العرض' });
      fetchOffers();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.response?.data?.message || 'فشل قبول العرض', variant: 'destructive' });
    }
  };

  const handleReject = (offer: SalesOffer) => {
    setSelectedOffer(offer);
    setRejectNotes('');
    setIsRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedOffer) return;
    try {
      await salesOffersApiService.applicantRespond(selectedOffer.id, 'REJECTED', rejectNotes || undefined);
      toast({ title: t('common.success'), description: 'تم إرسال طلب الرفض للمراجعة' });
      setIsRejectDialogOpen(false);
      setSelectedOffer(null);
      setRejectNotes('');
      fetchOffers();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.response?.data?.message || 'فشل رفض العرض', variant: 'destructive' });
    }
  };

  const pendingOffers = offers.filter(o => o.status === 'PENDING' && !o.applicantResponse);
  const acceptedOffers = offers.filter(o => o.applicantResponse === 'ACCEPTED' || o.status === 'ACCEPTED');
  const rejectedOffers = offers.filter(o => o.applicantResponse === 'REJECTED');
  const reviewedOffers = offers.filter(o => o.status === 'SALES_APPROVED' || o.status === 'SALES_REJECTED');

  const getStatusBadge = (offer: SalesOffer) => {
    if (offer.applicantResponse === 'ACCEPTED') {
      return <Badge className="bg-green-100 text-green-800">✓ تم القبول</Badge>;
    }
    if (offer.applicantResponse === 'REJECTED' && offer.salesResponse === 'PENDING') {
      return <Badge className="bg-yellow-100 text-yellow-800">⏳ في انتظار مراجعة Sales</Badge>;
    }
    if (offer.status === 'SALES_APPROVED') {
      return <Badge className="bg-blue-100 text-blue-800">✓ وافق Sales - يمكنك قبول العرض الجديد</Badge>;
    }
    if (offer.status === 'SALES_REJECTED') {
      return <Badge className="bg-red-100 text-red-800">✗ رفض Sales</Badge>;
    }
    return null;
  };

  return (
    <MainLayout userRole="applicant">
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl sm:text-3xl font-bold">عروض Sales</h1>

        {/* عروض في انتظار الرد */}
        <Card>
          <CardHeader>
            <CardTitle>عروض في انتظار الرد ({pendingOffers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-6 text-center">جاري التحميل...</div>
            ) : pendingOffers.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">لا توجد عروض حالياً</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOffers.map(offer => (
                  <Card key={offer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{offer.job?.title || 'عرض عمل'}</div>
                        {getStatusBadge(offer)}
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
                        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                          {offer.notes}
                        </div>
                      )}
                      <div className="pt-2 flex items-center gap-2">
                        <Button size="sm" onClick={() => handleAccept(offer)} className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 ml-2" />
                          قبول
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(offer)} className="flex-1 border-red-300 text-red-600 hover:bg-red-50">
                          <XCircle className="h-4 w-4 ml-2" />
                          رفض
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* عروض مقبولة */}
        {acceptedOffers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>عروض مقبولة ({acceptedOffers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedOffers.map(offer => (
                  <Card key={offer.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{offer.job?.title || 'عرض عمل'}</div>
                        <Badge className="bg-green-100 text-green-800">✓ مقبول</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-red-500 font-bold">{getCurrencyIcon(offer.currency as any)}</span>
                        <span className="font-medium">{(offer.value || 0).toLocaleString()} {offer.currency}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* عروض مرفوضة (في انتظار المراجعة أو تمت المراجعة) */}
        {(rejectedOffers.length > 0 || reviewedOffers.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>عروض مرفوضة ({rejectedOffers.length + reviewedOffers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...rejectedOffers, ...reviewedOffers].map(offer => (
                  <Card key={offer.id} className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{offer.job?.title || 'عرض عمل'}</div>
                        {getStatusBadge(offer)}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-red-500 font-bold">{getCurrencyIcon(offer.currency as any)}</span>
                        <span className="font-medium">{(offer.value || 0).toLocaleString()} {offer.currency}</span>
                      </div>
                      {offer.applicantRejectedNotes && (
                        <div className="text-xs text-muted-foreground bg-white p-2 rounded">
                          <strong>ملاحظاتك:</strong> {offer.applicantRejectedNotes}
                        </div>
                      )}
                      {offer.salesRejectedNotes && (
                        <div className="text-xs text-red-600 bg-white p-2 rounded">
                          <strong>رد Sales:</strong> {offer.salesRejectedNotes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>رفض العرض</DialogTitle>
              <DialogDescription>
                {selectedOffer && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>الوظيفة:</strong> {selectedOffer.job?.title}</p>
                    <p><strong>المبلغ:</strong> {getCurrencyIcon(selectedOffer.currency as any)} {(selectedOffer.value || 0).toLocaleString()} {selectedOffer.currency}</p>
                  </div>
                )}
                يمكنك إضافة ملاحظات لسبب الرفض. سيتم إرسال الطلب للمراجعة.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea 
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="اكتب سبب الرفض أو أي ملاحظات..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={confirmReject} className="bg-red-600 hover:bg-red-700">
                  إرسال طلب الرفض
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}


