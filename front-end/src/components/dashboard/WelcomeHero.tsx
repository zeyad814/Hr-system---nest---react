import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Briefcase, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import heroImage from "@/assets/hero-crm.jpg"

interface WelcomeHeroProps {
  userRole: string
  userName: string
}

export function WelcomeHero({ userRole, userName }: WelcomeHeroProps) {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (userRole === "admin") {
      navigate("/admin/reports");
    }
    // يمكن إضافة المزيد من الحالات للأدوار الأخرى هنا
  };

  const getRoleWelcome = () => {
    switch (userRole) {
      case "hr":
        return {
          title: "مرحباً بك في نظام إدارة التوظيف",
          subtitle: "أدر الوظائف والمرشحين بكفاءة عالية",
          action: "عرض الوظائف المتاحة"
        }
      case "sales":
        return {
          title: "لوحة تحكم المبيعات الخاصة بك",
          subtitle: "تابع العملاء والعقود والإيرادات",
          action: "إضافة عميل جديد"
        }
      case "client":
        return {
          title: "أهلاً وسهلاً في منصة التوظيف",
          subtitle: "اطلب وظائف جديدة وتابع المرشحين",
          action: "طلب وظيفة جديدة"
        }
      case "applicant":
        return {
          title: "ابحث عن وظيفتك المثالية",
          subtitle: "تصفح الوظائف المتاحة وقدم طلبك",
          action: "تصفح الوظائف"
        }
      default:
        return {
          title: "لوحة التحكم الإدارية",
          subtitle: "إدارة شاملة للنظام والمستخدمين",
          action: "عرض التقارير"
        }
    }
  }

  const welcome = getRoleWelcome()

  return (
    <Card className="overflow-hidden mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px]">
          {/* Content */}
          <div className="p-8 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground leading-tight">
                  مرحباً {userName}!
                </h1>
                <h2 className="text-xl font-semibold text-primary">
                  {welcome.title}
                </h2>
                <p className="text-muted-foreground">
                  {welcome.subtitle}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>إدارة شاملة</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>متابعة مستمرة</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>تقارير تفصيلية</span>
                </div>
              </div>

              <div className="pt-4">
                <Button className="crm-button-primary" onClick={handleActionClick}>
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  {welcome.action}
                </Button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative overflow-hidden">
            <img 
              src={heroImage} 
              alt="نظام إدارة التوظيف والمبيعات" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}