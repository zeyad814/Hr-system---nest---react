import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
};

export default function ClientDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  const [noteContent, setNoteContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

  const [reminders, setReminders] = useState<any[]>([]);
  const [reminderTitle, setReminderTitle] = useState("");
  const [remindAt, setRemindAt] = useState("");

  const [contracts, setContracts] = useState<any[]>([]);
  const [contractTitle, setContractTitle] = useState("");
  const [contractUrl, setContractUrl] = useState("");
  const [contractSignedAt, setContractSignedAt] = useState("");

  const [revenues, setRevenues] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [revenueMonthYear, setRevenueMonthYear] = useState("");

  const loadClient = async () => {
    if (!id) return;
    setLoading(true);
    try {
      console.log("=== Loading client data for ID:", id);
      const [c, n, r, ct, rv] = await Promise.all([
        api.get(`/client/admin/${id}`),
        api.get(`/client/${id}/notes`),
        api.get(`/client/${id}/reminders`),
        api.get(`/client/${id}/contracts`),
        api.get(`/client/${id}/revenues`),
      ]);
      console.log("Client data loaded:", c.data);
      console.log("Notes:", n.data);
      console.log("Reminders:", r.data);
      console.log("Contracts:", ct.data);
      console.log("Revenues:", rv.data);
      setClient(c.data);
      setNotes(n.data ?? []);
      setReminders(r.data ?? []);
      setContracts(ct.data ?? []);
      setRevenues(rv.data ?? []);
    } catch (error) {
      console.error("Error loading client data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClient();
  }, [id]);

  const addNote = async () => {
    if (!noteContent.trim() || !id) return;
    try {
      console.log("=== Adding note for client:", id);
      console.log("Note content:", noteContent.trim());
      const response = await api.post(`/client/${id}/notes`, { content: noteContent.trim() });
      console.log("Note added successfully:", response.data);
      setNoteContent("");
      await loadClient();
    } catch (error) {
      console.error("Error adding note:", error);
      alert(t('errors.failedToAddNote'));
    }
  };

  const addReminder = async () => {
    if (!reminderTitle.trim() || !remindAt || !id) return;
    try {
      console.log("=== Adding reminder for client:", id);
      console.log("Reminder data:", { title: reminderTitle.trim(), remindAt });
      const response = await api.post(`/client/${id}/reminders`, { title: reminderTitle.trim(), remindAt });
      console.log("Reminder added successfully:", response.data);
      setReminderTitle("");
      setRemindAt("");
      await loadClient();
    } catch (error) {
      console.error("Error adding reminder:", error);
      alert(t('errors.failedToAddReminder'));
    }
  };

  const addContract = async () => {
    if (!contractTitle.trim() || !id) return;
    try {
      console.log("=== Adding contract for client:", id);
      console.log("Contract data:", { title: contractTitle.trim(), fileUrl: contractUrl || undefined, signedAt: contractSignedAt || undefined });
      const response = await api.post(`/client/${id}/contracts`, { title: contractTitle.trim(), fileUrl: contractUrl || undefined, signedAt: contractSignedAt || undefined });
      console.log("Contract added successfully:", response.data);
      setContractTitle("");
      setContractUrl("");
      setContractSignedAt("");
      await loadClient();
    } catch (error) {
      console.error("Error adding contract:", error);
      alert(t('errors.failedToAddContract'));
    }
  };

  const addRevenue = async () => {
    if (!amount || !id) return;
    try {
      console.log("=== Adding revenue for client:", id);

      // Parse month-year from input (format: "YYYY-MM")
      let periodMonth: number | undefined;
      let periodYear: number | undefined;

      if (revenueMonthYear) {
        const [year, month] = revenueMonthYear.split('-');
        periodMonth = parseInt(month);
        periodYear = parseInt(year);
      }

      console.log("Revenue data:", { amount, periodMonth, periodYear });
      const response = await api.post(`/client/${id}/revenues`, {
        amount: Number(amount),
        periodMonth,
        periodYear
      });
      console.log("Revenue added successfully:", response.data);
      setAmount("");
      setRevenueMonthYear("");
      await loadClient();
    } catch (error) {
      console.error("Error adding revenue:", error);
      alert(t('errors.failedToAddRevenue'));
    }
  };

  return (
    <MainLayout userRole="admin" userName="محمد أحمد">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">تفاصيل العميل</h1>
          <Link to="/admin/clients" className="text-primary">عودة للقائمة</Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{loading ? "...تحميل" : client?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {client && (
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground">البريد:</span> {client.email || "—"}</div>
                <div><span className="text-muted-foreground">الهاتف:</span> {client.phone || "—"}</div>
                <div><span className="text-muted-foreground">الحالة:</span> {client.status}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="notes">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="revenues">Revenues</TabsTrigger>
          </TabsList>

          <TabsContent value="notes">
            <div className="flex gap-2 mb-3">
              <Input placeholder="أضف ملاحظة" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
              <Button onClick={addNote}>إضافة</Button>
            </div>
            <ul className="space-y-2">
              {notes.map((n) => (
                <li key={n.id} className="p-3 rounded border">{n.content}</li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="reminders">
            <div className="flex flex-col md:flex-row gap-2 mb-3">
              <Input placeholder="عنوان التذكير" value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} />
              <Input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
              <Button onClick={addReminder}>إضافة</Button>
            </div>
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li key={r.id} className="p-3 rounded border flex justify-between">
                  <span>{r.title}</span>
                  <span className="text-muted-foreground text-xs">{new Date(r.remindAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="contracts">
            <div className="flex flex-col md:flex-row gap-2 mb-3">
              <Input placeholder="عنوان العقد" value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} />
              <Input placeholder="رابط الملف" value={contractUrl} onChange={(e) => setContractUrl(e.target.value)} />
              <Input type="date" value={contractSignedAt} onChange={(e) => setContractSignedAt(e.target.value)} />
              <Button onClick={addContract}>إضافة</Button>
            </div>
            <ul className="space-y-2">
              {(contracts || []).map((c) => (
                <li key={c.id} className="p-3 rounded border flex justify-between">
                  <span>{c.title}</span>
                  <span className="text-muted-foreground text-xs">{c.signedAt ? new Date(c.signedAt).toLocaleDateString() : "—"}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="revenues">
            <div className="flex flex-col md:flex-row gap-2 mb-3">
              <Input placeholder="المبلغ" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input type="month" value={revenueMonthYear} onChange={(e) => setRevenueMonthYear(e.target.value)} />
              <Button onClick={addRevenue}>إضافة</Button>
            </div>
            <ul className="space-y-2">
              {revenues.map((rv) => (
                <li key={rv.id} className="p-3 rounded border flex justify-between">
                  <span>{rv.amount} ريال</span>
                  <span className="text-muted-foreground text-xs">{rv.periodMonth ? `${rv.periodMonth}/${rv.periodYear ?? ''}` : ''}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}


