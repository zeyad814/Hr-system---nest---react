import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
};

export default function ClientDetail() {
  const { id } = useParams();
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
  const [periodMonth, setPeriodMonth] = useState("");
  const [periodYear, setPeriodYear] = useState("");

  const loadClient = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [c, n, r, ct, rv] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/clients/${id}/notes`),
        api.get(`/clients/${id}/reminders`),
        api.get(`/clients/${id}/contracts`),
        api.get(`/clients/${id}/revenues`),
      ]);
      setClient(c.data);
      setNotes(n.data ?? []);
      setReminders(r.data ?? []);
      setContracts(ct.data ?? []);
      setRevenues(rv.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClient();
  }, [id]);

  const addNote = async () => {
    if (!noteContent.trim() || !id) return;
    await api.post(`/clients/${id}/notes`, { content: noteContent.trim() });
    setNoteContent("");
    loadClient();
  };

  const addReminder = async () => {
    if (!reminderTitle.trim() || !remindAt || !id) return;
    await api.post(`/clients/${id}/reminders`, { title: reminderTitle.trim(), remindAt });
    setReminderTitle("");
    setRemindAt("");
    loadClient();
  };

  const addContract = async () => {
    if (!contractTitle.trim() || !id) return;
    await api.post(`/clients/${id}/contracts`, { title: contractTitle.trim(), fileUrl: contractUrl || undefined, signedAt: contractSignedAt || undefined });
    setContractTitle("");
    setContractUrl("");
    setContractSignedAt("");
    loadClient();
  };

  const addRevenue = async () => {
    if (!amount || !id) return;
    await api.post(`/clients/${id}/revenues`, { amount, periodMonth: periodMonth ? Number(periodMonth) : undefined, periodYear: periodYear ? Number(periodYear) : undefined });
    setAmount("");
    setPeriodMonth("");
    setPeriodYear("");
    loadClient();
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
              <Input placeholder="المبلغ" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input placeholder="شهر" value={periodMonth} onChange={(e) => setPeriodMonth(e.target.value)} />
              <Input placeholder="سنة" value={periodYear} onChange={(e) => setPeriodYear(e.target.value)} />
              <Button onClick={addRevenue}>إضافة</Button>
            </div>
            <ul className="space-y-2">
              {revenues.map((rv) => (
                <li key={rv.id} className="p-3 rounded border flex justify-between">
                  <span>{rv.amount}</span>
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


