
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  Users, 
  Settings,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

const WhatsAppIntegration = () => {
  const chatMessages = [
    {
      id: 1,
      sender: "أحمد محمد",
      message: "مرحباً، أريد الاستفسار عن وظيفة مطور التطبيقات",
      time: "10:30",
      type: "incoming",
      status: "delivered"
    },
    {
      id: 2,
      sender: "نظام التوظيف",
      message: "مرحباً بك أحمد! سأقوم بمساعدتك. هل لديك خبرة في تطوير التطبيقات؟",
      time: "10:32",
      type: "outgoing",
      status: "read"
    }
  ];

  const activeChats = [
    {
      id: 1,
      name: "سارة علي",
      lastMessage: "متى يمكنني البدء في العمل؟",
      time: "5 دقائق",
      unread: 2,
      status: "active"
    },
    {
      id: 2,
      name: "محمد أحمد",
      lastMessage: "شكراً لكم على الفرصة",
      time: "15 دقيقة",
      unread: 0,
      status: "completed"
    }
  ];

  return (
    <MainLayout userRole="hr" userName="موظف الموارد البشرية">
      <div className="space-y-6" dir="rtl">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">تكامل واتساب</h1>
            <p className="text-muted-foreground">إدارة المحادثات والرسائل التلقائية</p>
          </div>
          <Button className="gap-2">
            <Settings className="h-4 w-4" />
            إعدادات واتساب
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">المحادثات النشطة</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الرسائل المرسلة</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <Send className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الردود التلقائية</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
                <Bot className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">معدل الاستجابة</p>
                  <p className="text-2xl font-bold">95%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Chats List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                المحادثات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeChats.map((chat) => (
                  <div key={chat.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{chat.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {chat.unread > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            {chat.unread}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          {chat.status === "active" ? (
                            <Clock className="h-3 w-3 text-warning" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-secondary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                المحادثة - أحمد محمد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 min-h-[400px]">
                {/* Messages */}
                <div className="flex-1 space-y-3 mb-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.type === 'outgoing'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">{message.time}</span>
                          {message.type === 'outgoing' && (
                            <CheckCircle className="h-3 w-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2 border-t pt-4">
                  <Input
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1"
                  />
                  <Button size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Bot className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Send className="h-6 w-6" />
                <span>إرسال تذكير المقابلة</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Bot className="h-6 w-6" />
                <span>تفعيل الرد التلقائي</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>إرسال رسالة جماعية</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default WhatsAppIntegration;
