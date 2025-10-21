
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, LogIn, Building2, Briefcase, Menu, Users, UserPlus, TrendingUp ,Linkedin,
  Instagram,
  Twitter,
  MapPin, Phone,Mail} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface LoginForm {
  email: string;
  password: string;
}



const Login = () => {
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const { login, user, isAuthenticated } = useAuth();

  // If user is already authenticated, show a message instead of redirecting
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">
              {t('auth.alreadyLoggedIn') || 'مسجل دخول بالفعل'}
            </CardTitle>
            <CardDescription>
              {t('auth.alreadyLoggedInDesc') || 'أنت مسجل دخول بالفعل. يمكنك الانتقال للوحة التحكم أو تسجيل الخروج.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {t('auth.currentUser') || 'المستخدم الحالي'}: <strong>{user.name}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('auth.role') || 'الدور'}: <strong>{user.role}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  switch (user.role) {
                    case 'ADMIN':
                      navigate('/admin');
                      break;
                    case 'HR':
                      navigate('/hr');
                      break;
                    case 'CLIENT':
                      navigate('/client');
                      break;
                    case 'APPLICANT':
                      navigate('/applicant');
                      break;
                    case 'SALES':
                      navigate('/sales');
                      break;
                    default:
                      navigate('/dashboard');
                  }
                }}
                className="flex-1"
              >
                {t('auth.goToDashboard') || 'الذهاب للوحة التحكم'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('token_expiry');
                  window.location.reload();
                }}
                className="flex-1"
              >
                {t('auth.logout') || 'تسجيل الخروج'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLoginInputChange = (field: keyof LoginForm, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    setError("");
  };



  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!loginForm.email || !loginForm.password) {
      setError(t('auth.allFieldsRequired') || 'All fields are required');
      setIsLoading(false);
      return;
    }
    if (!loginForm.email.includes("@")) {
      setError(t('auth.invalidEmail') || 'Please enter a valid email');
      setIsLoading(false);
      return;
    }

    try {
      // Use AuthContext login function which handles navigation automatically
      await login(loginForm.email, loginForm.password);
      
      // Login successful - AuthContext will handle navigation
      // No need for manual navigation here as AuthContext.login() already does it
    } catch (err) {
      setError(t('auth.invalidCredentials') || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };



  // Test login function for quick access
  const handleTestLogin = async (role: string) => {
    setIsLoading(true);
    setError("");
    
    // Test credentials for each role
    const testCredentials = {
      admin: { email: 'admin@test.com', password: 'Pass123!' },
      hr: { email: 'hr@test.com', password: 'Pass123!' },
      sales: { email: 'sales@test.com', password: 'Pass123!' },
      client: { email: 'client@test.com', password: 'Pass123!' },
      applicant: { email: 'applicant@test.com', password: 'Pass123!' }
    };
    
    const credentials = testCredentials[role.toLowerCase()];
    if (!credentials) {
      const errorMsg = `بيانات اعتماد غير صحيحة للدور: ${role}. الأدوار المتاحة: ${Object.keys(testCredentials).join(', ')}`;
      setError(errorMsg);
      console.error('Invalid role for test login:', role);
      setIsLoading(false);
      return;
    }

    try {
      console.log(`محاولة تسجيل دخول تجريبي للدور: ${role} باستخدام البريد: ${credentials.email}`);
      
      // Use AuthContext login function which handles navigation
      await login(credentials.email, credentials.password);
      
      toast({
        title: 'تسجيل دخول تجريبي ناجح',
        description: `تم تسجيل الدخول بنجاح كـ ${role.toUpperCase()}`,
      });
      
      console.log(`تم تسجيل الدخول بنجاح للدور: ${role}`);
    } catch (err: any) {
      console.error('Test login error:', err);
      
      // Provide more detailed error messages
      let errorMessage = 'فشل في تسجيل الدخول التجريبي';
      
      if (err?.response?.status === 401) {
        errorMessage = `خطأ في المصادقة: بيانات الاعتماد غير صحيحة للدور ${role}`;
      } else if (err?.response?.status === 404) {
        errorMessage = `المستخدم غير موجود: ${credentials.email}. تأكد من تشغيل البذور (seed)`;
      } else if (err?.response?.status >= 500) {
        errorMessage = 'خطأ في الخادم. تأكد من تشغيل الخادم الخلفي';
      } else if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('Network Error')) {
        errorMessage = 'خطأ في الشبكة. تأكد من تشغيل الخادم على http://localhost:3000';
      } else if (err?.message) {
        errorMessage = `خطأ: ${err.message}`;
      }
      
      setError(errorMessage);
      
      toast({
        title: 'فشل تسجيل الدخول التجريبي',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
                  
               
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {t('auth.login')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.enterCredentials') || 'Enter your credentials to access the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={t('auth.enterEmail') || 'Enter your email'} 
                  value={loginForm.email} 
                  onChange={(e) => handleLoginInputChange("email", e.target.value)} 
                  className="text-left" 
                  dir="ltr" 
                />
              </div>
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder={t('auth.enterPassword') || 'Enter your password'} 
                    value={loginForm.password} 
                    onChange={(e) => handleLoginInputChange("password", e.target.value)} 
                    className="pl-10" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('auth.loggingIn') || 'Logging in...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('auth.login')}
                  </div>
                )}
              </Button>
              
              {/* Register Link */}
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {t('auth.noAccount') || 'ليس لديك حساب؟'}{' '}
                  <Link 
                    to="/register" 
                    className="text-primary hover:underline font-medium"
                  >
                    {t('auth.createAccount') || 'إنشاء حساب جديد'}
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Test Login Buttons */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/25">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">
            أزرار الاختبار السريع - للتطوير فقط
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestLogin('admin')}
              disabled={isLoading}
              className="text-xs"
            >
              <Users className="h-3 w-3 mr-1" />
              مدير النظام
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestLogin('hr')}
              disabled={isLoading}
              className="text-xs"
            >
              <Briefcase className="h-3 w-3 mr-1" />
              الموارد البشرية
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestLogin('sales')}
              disabled={isLoading}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              المبيعات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestLogin('client')}
              disabled={isLoading}
              className="text-xs"
            >
              <Building2 className="h-3 w-3 mr-1" />
              العميل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestLogin('applicant')}
              disabled={isLoading}
              className="text-xs col-span-2 md:col-span-1"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              المتقدم للوظيفة
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            هذه الأزرار تسمح بالدخول السريع لاختبار الأدوار المختلفة مع توكنات صالحة
          </p>
        </div>
        </div>
      </div>

      {/* Footer */}
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
  );
};

export default Login;
