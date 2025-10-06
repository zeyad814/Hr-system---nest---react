
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Globe, 
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Instagram,
  Twitter,
  Languages,
  Search,
  Filter,
  Menu,
  LayoutDashboard,
  Heart,
  Shield,
  Award,
  Target,
  Lightbulb,
  UserCheck,
  Stethoscope,
  GraduationCap,
  Clock,
  CheckCircle,
  Send,
  Flag,
  ArrowRight
} from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for partner companies
const partnerCompanies = [
  {
    id: 1,
    name: "شركة التقنية المتقدمة",
    industry: "تقنية المعلومات",
    city: "الرياض",
    country: "السعودية",
    logo: "/placeholder.svg",
    openJobs: 15,
    rating: 4.8,
    description: "شركة رائدة في مجال تقنية المعلومات والحلول الرقمية"
  },
  {
    id: 2,
    name: "مجموعة الخليج للاستثمار",
    industry: "المالية والاستثمار",
    city: "دبي", 
    country: "الإمارات",
    logo: "/placeholder.svg",
    openJobs: 8,
    rating: 4.6,
    description: "مجموعة استثمارية متنوعة مع محفظة واسعة من الشركات"
  },
  {
    id: 3,
    name: "شركة البناء الحديث",
    industry: "الإنشاءات والعقارات",
    city: "الكويت",
    country: "الكويت", 
    logo: "/placeholder.svg",
    openJobs: 23,
    rating: 4.5,
    description: "شركة إنشاءات رائدة مع خبرة تزيد عن 20 عاماً"
  },
  {
    id: 4,
    name: "مجموعة الصحة المتكاملة",
    industry: "الرعاية الصحية",
    city: "الدوحة",
    country: "قطر",
    logo: "/placeholder.svg", 
    openJobs: 12,
    rating: 4.9,
    description: "مقدم خدمات رعاية صحية متكاملة ومتطورة"
  },
  {
    id: 5,
    name: "شركة الطاقة المستدامة",
    industry: "الطاقة والبيئة",
    city: "أبوظبي",
    country: "الإمارات",
    logo: "/placeholder.svg",
    openJobs: 18,
    rating: 4.7,
    description: "رائدة في مجال حلول الطاقة المتجددة والمستدامة"
  },
  {
    id: 6,
    name: "مجموعة التجارة الدولية",
    industry: "التجارة والتوزيع",
    city: "جدة",
    country: "السعودية",
    logo: "/placeholder.svg",
    openJobs: 9,
    rating: 4.4,
    description: "شبكة واسعة من شركات التجارة والتوزيع الإقليمية"
  }
];

// Animated counter component
const StatCard = ({ number, suffix, label }) => {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      let start = 0
      const end = number
      const duration = 2000
      const increment = end / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [isVisible, number])

  return (
    <div ref={countRef} className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border">
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-primary">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm sm:text-base lg:text-lg text-muted-foreground">{label}</div>
    </div>
  )
}

const HomePage = () => {
  const { t, language, isRTL } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [showMap, setShowMap] = useState(false)

  // Helper function to get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user?.role) return '/'
    const role = user.role.toLowerCase()
    switch (role) {
      case 'admin': return '/admin'
      case 'hr': return '/hr'
      case 'sales': return '/sales'
      case 'client': return '/client'
      case 'applicant': return '/applicant'
      default: return '/'
    }
  }

  // Get unique industries and countries for filters
  const industries = [...new Set(partnerCompanies.map(company => company.industry))]
  const countries = [...new Set(partnerCompanies.map(company => company.country))]

  // Filter companies based on search and filters
  const filteredCompanies = partnerCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = selectedIndustry === "all" || company.industry === selectedIndustry
    const matchesCountry = selectedCountry === "all" || company.country === selectedCountry
    return matchesSearch && matchesIndustry && matchesCountry
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse flex-1 min-w-0 ">
              <div className="flex items-center space-x-1.5 sm:space-x-2 space-x-reverse min-w-0 ">
              
              <div className="h-9 w-9 rounded-2xl flex-shrink-0 bg-white  ">
                <a href="/" className="h-full w-full flex items-center justify-center">
                  <img src="/logo.png" alt="YAS Logo" className="h-full w-full object-contain" />
                  </a>
                </div>
                <div className="min-w-0 pr-2 pl-2">
                  <h1 className="text-sm font-bold truncate bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">YAS GLOBAL PARTNER</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Innovative HR Solutions</p>
                </div>
              </div>
            </div>

            {/* Controls and Auth Buttons */}
            <div className="flex items-center gap-2">
              {/* Theme and Language Toggles - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <ThemeToggle />
                <LanguageToggle />
              </div>
              
              {/* Auth Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-2">
                {isAuthenticated ? (
                  <Button size="sm" variant="outline" asChild>
                    <Link to={getDashboardRoute()}>
                      <LayoutDashboard className="h-4 w-4 ml-2" />
                      الداشبورد
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/login">تسجيل الدخول</Link>
                  </Button>
                )}
              </div>
              
              {/* Mobile Menu */}
              <div className="flex items-center gap-2 sm:hidden">
                {/* Theme and Language for small screens */}
                <div className="hidden xs:flex items-center gap-1">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>
                
                {/* Mobile Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {/* Theme and Language for very small screens */}
                    <div className="flex items-center justify-between p-2 xs:hidden">
                      <ThemeToggle />
                      <LanguageToggle />
                    </div>
                    {isAuthenticated ? (
                      <DropdownMenuItem asChild>
                        <Link to={getDashboardRoute()} className="w-full cursor-pointer">
                          <LayoutDashboard className="h-4 w-4 ml-2" />
                          الداشبورد
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link to="/login" className="w-full cursor-pointer">
                          <Users className="h-5 w-5 ml-2 pr-2" />
                          تسجيل الدخول
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
              
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Company Identity Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 to-red-200/20 dark:from-red-900/20 dark:to-red-800/20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Company Header */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center shadow-2xl">
                  <img src="/logo.png" alt="YAS Logo" className="h-full w-full object-contain bg-white  rounded-2xl" />
                </div>
              </div>
              
              <Badge variant="secondary" className="mb-4 text-xs sm:text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Globe className="h-4 w-4 sm:h-6 sm:w-4 ml-1 pr-1" />
                {language === 'ar' ? 'شريك عالمي في الموارد البشرية' : 'Global HR Partner'}
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-red-700 via-red-800 to-red-900 bg-clip-text text-transparent leading-tight">
                YAS GLOBAL PARTNER
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-2 max-w-4xl mx-auto">
                {language === 'ar' 
                  ? 'نرحب بكم في ياس جلوبال بارتنر، حيث نقدم حلولاً مبتكرة لتحقيق طموحاتكم! نحن هنا لبناء شراكات ناجحة تدعم نمو أعمالكم بتميز ومهنية.'
                  : 'Welcome to Yas Global Partner, where we deliver innovative solutions to match your ambitions! We are here to build successful partnerships that support your business growth with excellence and professionalism.'
                }
              </p>
            </div>

            {/* Action Buttons */}
             <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16 px-4">
               <Button size="lg" asChild className="text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 w-full sm:w-auto bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900">
                 <Link to="/register">
                   {language === 'ar' ? 'ابدأ رحلتك المهنية' : 'Start Your Career Journey'}
                   <ChevronRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-5 w-5`} />
                 </Link>
               </Button>
               <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20">
                 <Link to="/partners">
                   {language === 'ar' ? 'تصفح شركاؤنا' : 'Browse Our Partners'}
                 </Link>
               </Button>
             </div>
           </div>
         </div>
       </section>

       {/* About Company Section */}
       <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-900">
         <div className="container mx-auto px-4">
           <div className="max-w-6xl mx-auto">
             {/* Section Header */}
             <div className="text-center mb-12 sm:mb-16">
               <Badge variant="outline" className="mb-4 text-sm border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">
                 {language === 'ar' ? 'من نحن' : 'About Us'}
               </Badge>
               <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                 {language === 'ar' ? 'عن الشركة' : 'About Company'}
               </h2>
               <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                 {language === 'ar' 
                   ? 'لسنوات، كنا نحول صناعة التوظيف والاستقطاب والتوطين والاستشارات في الخليج، خاصة في دولة الإمارات العربية المتحدة.'
                   : 'For years, we have been transforming the HR recruitment, headhunting, emiratization, and consulting industry in the Gulf, especially in the UAE.'
                 }
               </p>
             </div>

             {/* Company Description */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
               <div className="space-y-6">
                 <div className="flex items-start space-x-4 space-x-reverse">
                   <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                     <Building2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                   </div>
                   <div>
                     <h3 className=" pr-2 pl-2 text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                       {language === 'ar' ? 'خبرة واسعة' : 'Extensive Experience'}
                     </h3>
                     <p className="text-muted-foreground leading-relaxed">
                       {language === 'ar' 
                         ? 'مع مرور الوقت، قدمنا حلول توظيف واستشارات مبتكرة وفعالة للشركات من جميع الأحجام والمجالات.'
                         : 'Over time, we have provided innovative and effective recruitment and consulting solutions for companies of all sizes and fields.'
                       }
                     </p>
                   </div>
                 </div>

                 <div className="flex items-start space-x-4 space-x-reverse">
                   <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                     <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                   </div>
                   <div>
                     <h3 className=" pr-2 pl-2 text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                       {language === 'ar' ? 'الثقة والشفافية' : 'Trust & Transparency'}
                     </h3>
                     <p className="text-muted-foreground leading-relaxed">
                       {language === 'ar' 
                         ? 'نؤمن أن الشراكات العظيمة تقوم على أساس متين من الثقة والشفافية والنمو والتميز.'
                         : 'We believe that great partnerships are based on a solid foundation of trust, transparency, growth, and excellence.'
                       }
                     </p>
                   </div>
                 </div>
               </div>

               <div className="space-y-6">
                 <div className="flex items-start space-x-4 space-x-reverse">
                   <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                     <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                   </div>
                   <div>
                     <h3 className=" pr-2 pl-2 text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                       {language === 'ar' ? 'هدفنا' : 'Our Goal'}
                     </h3>
                     <p className="text-muted-foreground leading-relaxed">
                       {language === 'ar' 
                         ? 'هدفنا هو رسم رحلة شركائنا من التعقيد إلى التبسيط والتميز ومساعدتهم على التفوق على الآخرين في اختيار أفضل الكوادر والموظفين.'
                         : 'Our goal is to map our partners\' journey from complexity to simplification and excellence and help them excel over others in choosing the best cadres and employees.'
                       }
                     </p>
                   </div>
                 </div>

                 <div className="flex items-start space-x-4 space-x-reverse">
                   <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                     <Lightbulb className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                   </div>
                   <div>
                     <h3 className=" pr-2 pl-2 text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                       {language === 'ar' ? 'حلول مبتكرة' : 'Innovative Solutions'}
                     </h3>
                     <p className="text-muted-foreground leading-relaxed">
                       {language === 'ar' 
                         ? 'نقدم أفضل الحلول والاستشارات في الموارد البشرية من خلال نظام بيئي مبتكر من الحلول.'
                         : 'We provide the best solutions and consulting in human resources through an innovative ecosystem of solutions.'
                       }
                     </p>
                   </div>
                 </div>
               </div>
             </div>

             {/* Vision & Mission */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
               {/* Vision */}
               <Card className="p-8 border-2 border-red-100 dark:border-red-900 bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-slate-900">
                 <div className="flex items-center mb-6">
                   <div className="h-14 w-14 rounded-2xl bg-red-700 flex items-center justify-center mr-4">
                     <Award className="h-7 w-7 text-white" />
                   </div>
                   <h3 className=" pr-2 pl-2 text-2xl font-bold text-gray-900 dark:text-white">
                     {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
                   </h3>
                 </div>
                 <p className="text-muted-foreground leading-relaxed text-lg">
                   {language === 'ar' 
                     ? 'رؤيتنا تتمحور حول مهمة عميقة: خلق مستقبل يزدهر فيه الجميع في حياتهم المهنية. كشركة رائدة في حلول المواهب والاستشارات، نحن ملتزمون بتعزيز القابلية للتوظيف المستدامة والدائمة للأفراد مع مساعدة المنظمات على تعزيز قواها العاملة.'
                     : 'Our vision is centered around a profound mission: to create a future where everyone thrives in their careers. As a premier talent solutions and advisory firm, we are committed to promoting sustainable and lifelong employability for individuals while helping organizations enhance their workforces.'
                   }
                 </p>
               </Card>

               {/* Mission */}
               <Card className="p-8 border-2 border-green-100 dark:border-green-900 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-900">
                 <div className="flex items-center mb-6">
                   <div className="h-14 w-14 rounded-2xl bg-green-600 flex items-center justify-center mr-4">
                     <Heart className="h-7 w-7 text-white" />
                   </div>
                   <h3 className=" pr-2 pl-2 text-2xl font-bold text-gray-900 dark:text-white">
                     {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
                   </h3>
                 </div>
                 <p className="text-muted-foreground leading-relaxed text-lg">
                   {language === 'ar' 
                     ? 'مهمتنا هي العثور على أفضل المرشحين من خلال نظام بيئي مبتكر من الحلول، مما يضمن النتائج الأكثر فعالية من حيث التكلفة لعملائنا. نربط أفضل المواهب بالفرص المناسبة وننظر إلى ما وراء السير الذاتية لنرى الإمكانات في الناس.'
                     : 'Our mission is to source the best candidates through an innovative ecosystem of solutions, ensuring the most cost-effective outcomes for our clients. We connect top talent with the right opportunities and look beyond resumes to see the potential in people.'
                   }
                 </p>
               </Card>
             </div>
            </div>
          </div>
        </section>

        {/* Our Services Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-800 dark:to-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 sm:mb-16">
                <Badge variant="outline" className="mb-4 text-sm border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">
                  {language === 'ar' ? 'خدماتنا' : 'Our Services'}
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الخدمات التي نقدمها' : 'Services We Provide'}
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {language === 'ar' 
                    ? 'نقدم مجموعة شاملة من الخدمات المتخصصة في الموارد البشرية والاستشارات لمساعدة شركائنا على تحقيق أهدافهم.'
                    : 'We offer a comprehensive range of specialized HR and consulting services to help our partners achieve their goals.'
                  }
                </p>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* HR Recruitment */}
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 group hover:-translate-y-2">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className=" pr-2 pl-2 text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                    {language === 'ar' ? 'التوظيف والاستقطاب' : 'HR Recruitment'}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed mb-6">
                    {language === 'ar' 
                      ? 'نساعد الشركات في العثور على أفضل المواهب المناسبة لاحتياجاتها من خلال عمليات توظيف متقدمة ومدروسة.'
                      : 'We help companies find the best talents suitable for their needs through advanced and thoughtful recruitment processes.'
                    }
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      {language === 'ar' ? 'خدمة أساسية' : 'Core Service'}
                    </Badge>
                  </div>
                </Card>

                {/* Headhunting */}
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 group hover:-translate-y-2">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Search className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className=" pr-2 pl-2 text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                    {language === 'ar' ? 'البحث التنفيذي' : 'Headhunting'}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed mb-6">
                    {language === 'ar' 
                      ? 'نتخصص في البحث عن المديرين التنفيذيين والمناصب القيادية العليا لضمان الحصول على أفضل الكفاءات.'
                      : 'We specialize in searching for executives and senior leadership positions to ensure getting the best competencies.'
                    }
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {language === 'ar' ? 'خدمة متخصصة' : 'Specialized Service'}
                    </Badge>
                  </div>
                </Card>

                {/* Emiratization */}
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 group hover:-translate-y-2">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Flag className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className=" pr-2 pl-2 text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                    {language === 'ar' ? 'التوطين' : 'Emiratization'}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed mb-6">
                    {language === 'ar' 
                      ? 'نساعد الشركات في تحقيق أهداف التوطين من خلال استقطاب وتطوير المواهب المحلية المؤهلة.'
                      : 'We help companies achieve emiratization goals by attracting and developing qualified local talents.'
                    }
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {language === 'ar' ? 'خدمة استراتيجية' : 'Strategic Service'}
                    </Badge>
                  </div>
                </Card>

                {/* HR Consulting */}
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 group hover:-translate-y-2">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Briefcase className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className=" pr-2 pl-2 text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                    {language === 'ar' ? 'استشارات الموارد البشرية' : 'HR Consulting'}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed mb-6">
                    {language === 'ar' 
                      ? 'نقدم استشارات شاملة في مجال الموارد البشرية لتحسين الأداء التنظيمي وتطوير السياسات والإجراءات.'
                      : 'We provide comprehensive HR consulting to improve organizational performance and develop policies and procedures.'
                    }
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                      {language === 'ar' ? 'خدمة استشارية' : 'Advisory Service'}
                    </Badge>
                  </div>
                </Card>

                {/* Training & Development */}
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 group hover:-translate-y-2">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className=" pr-2 pl-2 text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                    {language === 'ar' ? 'التدريب والتطوير' : 'Training & Development'}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed mb-6">
                    {language === 'ar' 
                      ? 'نصمم برامج تدريبية متخصصة لتطوير مهارات الموظفين وتعزيز قدراتهم المهنية والشخصية.'
                      : 'We design specialized training programs to develop employee skills and enhance their professional and personal capabilities.'
                    }
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      {language === 'ar' ? 'خدمة تطويرية' : 'Development Service'}
                    </Badge>
                  </div>
                </Card>

                {/* Talent Management */}
                <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 group hover:-translate-y-2">
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className=" pr-2 pl-2 text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                    {language === 'ar' ? 'إدارة المواهب' : 'Talent Management'}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed mb-6">
                    {language === 'ar' 
                      ? 'نساعد في تطوير استراتيجيات شاملة لإدارة المواهب من الاستقطاب إلى التطوير والاحتفاظ بالكفاءات.'
                      : 'We help develop comprehensive talent management strategies from recruitment to development and talent retention.'
                    }
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                      {language === 'ar' ? 'خدمة شاملة' : 'Comprehensive Service'}
                    </Badge>
                  </div>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="text-center mt-12 sm:mt-16">
                <p className="text-lg text-muted-foreground mb-6">
                  {language === 'ar' 
                    ? 'هل تحتاج إلى المزيد من المعلومات حول خدماتنا؟'
                    : 'Need more information about our services?'
                  }
                </p>
                <Button size="lg" className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-8 py-3">
                  {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                  <ArrowRight className={`${isRTL ? 'mr-2' : 'ml-2'} h-5 w-5`} />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
       <section className="py-12 sm:py-16 lg:py-20 bg-background">
         <div className="container mx-auto px-4">
           <div className="text-center mb-8 sm:mb-12">
             <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-foreground">{t('homepage.stats.title')}</h2>
             <p className="text-base sm:text-lg text-muted-foreground px-2">
               {t('homepage.stats.subtitle')}
             </p>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
             <StatCard number={500} suffix="+" label={t('homepage.stats.partnerCompanies')} />
             <StatCard number={10000} suffix="+" label={t('homepage.stats.availableJobs')} />
             <StatCard number={50000} suffix="+" label={t('homepage.stats.jobSeekers')} />
             <StatCard number={95} suffix="%" label={t('homepage.stats.satisfactionRate')} />
           </div>
         </div>
       </section>

      {/* Partner Companies Showcase */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('homepage.partners.title')}</h2>
            <p className="text-base sm:text-lg text-muted-foreground px-2">
              {t('homepage.partners.subtitle')}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            <div className="flex items-center space-x-2 space-x-reverse w-full sm:w-auto">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('homepage.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <SelectValue placeholder={t('homepage.filter.sector')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('homepage.filter.allSectors')}</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full sm:w-48">
                <MapPin className="h-4 w-4 ml-2" />
                <SelectValue placeholder="الدولة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الدول</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="w-full sm:w-auto"
            >
              {showMap ? "عرض القائمة" : "عرض الخريطة"}
            </Button>
          </div>

          {!showMap ? (
            /* Company Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse flex-1 min-w-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                            {company.name}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm truncate">{company.industry}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse flex-shrink-0">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-medium">{company.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                      {company.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                      <div className="flex items-center space-x-1 space-x-reverse text-muted-foreground">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{company.city}, {company.country}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                        {company.openJobs} وظيفة شاغرة
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Map View Placeholder */
            <div className="h-64 sm:h-80 lg:h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center px-4">
                <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className=" pr-2 pl-2 text-base sm:text-lg font-medium mb-2">عرض الخريطة التفاعلية</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  سيتم عرض مواقع الشركات على الخريطة هنا
                </p>
              </div>
            </div>
          )}
        </div>
      </section>



      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium mb-4">
              <Phone className="w-4 h-4 mr-2" />
              {isRTL ? 'تواصل معنا' : 'Get In Touch'}
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isRTL ? 'ابدأ رحلتك معنا اليوم' : 'Start Your Journey With Us Today'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {isRTL 
                ? 'نحن هنا لمساعدتك في العثور على أفضل المواهب أو الفرص الوظيفية المناسبة لك'
                : 'We are here to help you find the best talents or career opportunities that suit you'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className=" pr-2 pl-2 text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
                </h3>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isRTL ? 'العنوان' : 'Address'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {isRTL 
                          ? 'الإمارات العربية المتحدة - دبي'
                          : 'United Arab Emirates - Dubai'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isRTL ? 'الهاتف' : 'Phone'}
                      </h4>
                      <a href="tel:+971501234567" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        +971 50 123 4567
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isRTL ? 'البريد الإلكتروني' : 'Email'}
                      </h4>
                      <a href="mailto:info@yasglobalpartner.com" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        info@yasglobalpartner.com
                      </a>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isRTL ? 'ساعات العمل' : 'Working Hours'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isRTL 
                          ? 'الأحد - الخميس: 9:00 ص - 6:00 م'
                          : 'Sunday - Thursday: 9:00 AM - 6:00 PM'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className=" pr-2 pl-2 text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {isRTL ? 'أرسل لنا رسالة' : 'Send Us a Message'}
              </h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? 'الاسم الأول' : 'First Name'}
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={isRTL ? 'أدخل اسمك الأول' : 'Enter your first name'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? 'اسم العائلة' : 'Last Name'}
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={isRTL ? 'أدخل اسم العائلة' : 'Enter your last name'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'الموضوع' : 'Subject'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={isRTL ? 'أدخل موضوع الرسالة' : 'Enter message subject'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea 
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <Mail className="w-5 h-5" />
                    <span>{isRTL ? 'إرسال الرسالة' : 'Send Message'}</span>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('homepage.features.whyChoose')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('homepage.features.whyChooseDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className=" pr-2 pl-2 font-semibold mb-2">{t('homepage.features.wideNetwork')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('homepage.features.wideNetworkDesc')}
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className=" pr-2 pl-2 font-semibold mb-2">{t('homepage.features.advancedTech')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('homepage.features.advancedTechDesc')}
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className=" pr-2 pl-2 font-semibold mb-2">{t('homepage.features.comprehensiveTracking')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('homepage.features.comprehensiveTrackingDesc')}
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className=" pr-2 pl-2 font-semibold mb-2">{t('homepage.features.regionalCoverage')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('homepage.features.regionalCoverageDesc')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <div className="h-8 w-8 rounded-lg  flex items-center justify-center">
                  <img src="/logo.png" alt="YAS Logo" className="h-full w-full object-contain bg-white  rounded-2xl" />
                </div>
                <span className="font-bold text-lg">YAS GLOBAL PARTNER</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Innovative HR solutions to match your ambitions. Building successful partnerships that support business growth with excellence.
              </p>
              <div className="flex space-x-3 space-x-reverse">
                <Button size="icon" variant="ghost" asChild>
                  <a href="https://www.linkedin.com/company/yasglobal" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="icon" variant="ghost" asChild>
                  <a href="https://twitter.com/yasglobal" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="icon" variant="ghost" asChild>
                  <a href="https://www.instagram.com/yasglobal" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Our Services</h4>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground">HR Consulting</div>
                <div className="text-muted-foreground">Emiratisation</div>
                <div className="text-muted-foreground">Executive Search</div>
                <div className="text-muted-foreground">Medical Manpower Supply</div>
                <div className="text-muted-foreground">Training Services</div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Get In Touch</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+971 4 243 8653 - EXT. 419</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>info@yasglobal.ae</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Office No.19, Unit 2201, Metropolis Tower AL Abraj Street, Business Bay, Dubai, UAE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} YAS GLOBAL PARTNER. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
