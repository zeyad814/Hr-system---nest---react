import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSalesCurrency } from '@/contexts/SalesCurrencyContext';
import { toast } from '@/hooks/use-toast';
import { salesOffersApiService, SalesOffer } from '@/services/salesOffersApi';
import { AlertCircle, User, Briefcase, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SalesOffersReview() {
  const { t } = useLanguage();
  const { currency, getCurrencyIcon } = useSalesCurrency();

  const [pendingRejections, setPendingRejections] = useState<SalesOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<SalesOffer | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewResponse, setReviewResponse] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [newOfferAmount, setNewOfferAmount] = useState('');
  const [newOfferNotes, setNewOfferNotes] = useState('');

  useEffect(() => {
    fetchPendingRejections();
  }, []);

  const fetchPendingRejections = async () => {
    try {
      setLoading(true);
      const data = await salesOffersApiService.getPendingRejections();
      setPendingRejections(data);
    } catch (e) {
      console.error('Error fetching pending rejections:', e);
      setPendingRejections([]);
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (offer: SalesOffer) => {
    setSelectedOffer(offer);
    setReviewResponse('APPROVED');
    setReviewNotes('');
    setNewOfferAmount(offer.value.toString());
    setNewOfferNotes('');
    setIsReviewDialogOpen(true);
  };

  const confirmReview = async () => {
    if (!selectedOffer) return;
    try {
      await salesOffersApiService.reviewRejection(
        selectedOffer.id,
        reviewResponse,
        reviewNotes || undefined
      );

      // إذا وافق Sales، يمكنه إنشاء عرض جديد
      if (reviewResponse === 'APPROVED' && newOfferAmount) {
        const numeric = parseFloat(newOfferAmount || '0');
        if (numeric && !isNaN(numeric) && selectedOffer.applicationId && selectedOffer.applicantId && selectedOffer.jobId) {
          try {
            await salesOffersApiService.create({
              applicationId: selectedOffer.applicationId,
              applicantId: selectedOffer.applicantId,
              jobId: selectedOffer.jobId,
              value: numeric,
              currency,
              notes: newOfferNotes || undefined,
            });
            toast({ title: t('common.success'), description: 'تم الموافقة وإنشاء عرض جديد' });
          } catch (e: any) {
            console.error('Error creating new offer:', e);
            toast({ title: t('common.success'), description: 'تم الموافقة، ولكن فشل إنشاء عرض جديد' });
          }
        } else {
          toast({ title: t('common.success'), description: 'تم الموافقة' });
        }
      } else {
        toast({ title: t('common.success'), description: 'تم معالجة الطلب' });
      }

      setIsReviewDialogOpen(false);
      setSelectedOffer(null);
      fetchPendingRejections();
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.response?.data?.message || 'فشل معالجة الطلب', variant: 'destructive' });
    }
  };

  return (
    <MainLayout userRole="sales">
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl sm:text-3xl font-bold">مراجعة طلبات رفض العروض</h1>

        <Card>
          <CardHeader>
            <CardTitle>طلبات في انتظار المراجعة ({pendingRejections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-6 text-center">جاري التحميل...</div>
            ) : pendingRejections.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">لا توجد طلبات حالياً</div>
            ) : (
              <div className="space-y-4">
                {pendingRejections.map(offer => (
                  <Card key={offer.id} className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">{offer.applicant?.user?.name || 'غير محدد'}</span>
                            <Badge className="bg-yellow-100 text-yellow-800">مرفوض</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            الوظيفة: {offer.job?.title || '-'}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>المبلغ الأصلي: {getCurrencyIcon(offer.currency as any)} {(offer.value || 0).toLocaleString()} {offer.currency}</span>
                            </div>
                            {offer.applicantRejectedAt && (
                              <div className="flex items-center gap-1">
                                <span>تاريخ الرفض: {new Date(offer.applicantRejectedAt).toLocaleString('ar-SA')}</span>
                              </div>
                            )}
                          </div>
                          {offer.applicantRejectedNotes && (
                            <div className="bg-white p-2 rounded text-xs text-gray-700">
                              <strong>ملاحظات المتقدم:</strong> {offer.applicantRejectedNotes}
                            </div>
                          )}
                        </div>
                        <Button size="sm" onClick={() => openReviewDialog(offer)}>
                          <FileText className="h-4 w-4 ml-2" />
                          مراجعة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>مراجعة طلب رفض العرض</DialogTitle>
              <DialogDescription>
                {selectedOffer && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>المتقدم:</strong> {selectedOffer.applicant?.user?.name}</p>
                    <p><strong>الوظيفة:</strong> {selectedOffer.job?.title}</p>
                    <p><strong>المبلغ الأصلي:</strong> {getCurrencyIcon(selectedOffer.currency as any)} {(selectedOffer.value || 0).toLocaleString()} {selectedOffer.currency}</p>
                    {selectedOffer.applicantRejectedNotes && (
                      <div className="bg-gray-50 p-2 rounded mt-2">
                        <strong>ملاحظات المتقدم:</strong> {selectedOffer.applicantRejectedNotes}
                      </div>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>القرار</Label>
                <Select value={reviewResponse} onValueChange={(v: any) => setReviewResponse(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">موافقة (إنشاء عرض جديد)</SelectItem>
                    <SelectItem value="REJECTED">رفض نهائي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reviewResponse === 'APPROVED' && (
                <>
                  <div className="space-y-2">
                    <Label>مبلغ العرض الجديد</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-bold text-xl">{getCurrencyIcon(currency as any)}</span>
                      <Input 
                        type="number" 
                        value={newOfferAmount}
                        onChange={(e) => setNewOfferAmount(e.target.value)}
                        placeholder="0"
                      />
                      <span className="text-sm font-medium">{currency}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات للعرض الجديد (اختياري)</Label>
                    <Textarea 
                      value={newOfferNotes}
                      onChange={(e) => setNewOfferNotes(e.target.value)}
                      placeholder="أي معلومات إضافية..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              {reviewResponse === 'REJECTED' && (
                <div className="space-y-2">
                  <Label>ملاحظات (اختياري)</Label>
                  <Textarea 
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="اكتب ملاحظاتك..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={confirmReview}>
                  {reviewResponse === 'APPROVED' ? 'موافقة وإنشاء عرض جديد' : 'رفض نهائي'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

