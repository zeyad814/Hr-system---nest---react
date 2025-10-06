import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserPlus, Building2, Briefcase, Menu, Users, TrendingUp ,  Instagram,
  Twitter,
  Linkedin,
  MapPin, Phone,Mail} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface RegisterForm {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
  
  // Applicant Personal Details
  dateOfBirth: string;
  nationality: string;
  gender: string;
  maritalStatus: string;
  address: string;
  location: string;
  
  // Company Info (for clients)
  companyName: string;
  companySize: string;
  industry: string;
  website: string;
  establishedYear: string;
  employees: string;
  
  // Professional Info
  experience: string;
  skills: string;
  bio: string;
  coverLetter: string;
  expectedSalary: string;
  availableFrom: string;
  workType: string;
  languages: string;
  
  // Social Links
  portfolio: string;
  linkedin: string;
  github: string;
  
  // Agreement
  agreeToTerms: boolean;
}

const Register = () => {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    dateOfBirth: "",
    nationality: "",
    gender: "",
    maritalStatus: "",
    address: "",
    location: "",
    companyName: "",
    companySize: "",
    industry: "",
    website: "",
    establishedYear: "",
    employees: "",
    experience: "",
    skills: "",
    bio: "",
    coverLetter: "",
    expectedSalary: "",
    availableFrom: "",
    workType: "",
    languages: "",
    portfolio: "",
    linkedin: "",
    github: "",
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: keyof RegisterForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep1 = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password || !form.confirmPassword || !form.role) {
      setError(t('auth.allFieldsRequired') || 'All fields are required');
      return false;
    }
    
    if (!form.email.includes("@")) {
      setError(t('auth.invalidEmail') || 'Please enter a valid email');
      return false;
    }
    
    if (form.password.length < 6) {
      setError(t('auth.passwordMinLength') || 'Password must be at least 6 characters');
      return false;
    }
    
    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch') || 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (form.role === "CLIENT") {
      if (!form.companyName || !form.companySize || !form.industry) {
        setError(t('auth.companyInfoRequired') || 'All company information is required');
        return false;
      }
    }
    
    if (form.role === "APPLICANT") {
      if (!form.dateOfBirth || !form.nationality || !form.gender) {
        setError(t('auth.personalDetailsRequired') || 'Personal details are required');
        return false;
      }
    }
    
    return true;
  };

  const validateStep3 = () => {
    if (form.role === "APPLICANT") {
      if (!form.experience || !form.skills) {
        setError(t('auth.experienceSkillsRequired') || 'Experience and skills are required');
        return false;
      }
    }
    
    if (!form.agreeToTerms) {
      setError(t('auth.agreeToTerms') || 'You must agree to the terms and conditions');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      // Register user first
      const userData = {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        role: form.role
      };

      const registerResponse = await api.post('/auth/register', userData);
      
      // If user is an applicant, create comprehensive applicant profile
      if (form.role === 'APPLICANT') {
        const token = registerResponse.data?.access_token;
        if (token) {
          localStorage.setItem('access_token', token);
          
          const applicantData = {
            phone: form.phone,
            dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
            nationality: form.nationality,
            gender: form.gender,
            maritalStatus: form.maritalStatus,
            address: form.address,
            location: form.location,
            bio: form.bio,
            coverLetter: form.coverLetter,
            expectedSalary: form.expectedSalary,
            availableFrom: form.availableFrom ? new Date(form.availableFrom).toISOString() : undefined,
            workType: form.workType,
            skills: form.skills,
            languages: form.languages,
            portfolio: form.portfolio,
            linkedin: form.linkedin,
            github: form.github
          };
          
          await api.post('/applicants/profile', applicantData);
        }
      }
      
      // If user is a client, create client profile
      if (form.role === 'CLIENT') {
        const token = registerResponse.data?.access_token;
        if (token) {
          localStorage.setItem('access_token', token);
          
          const clientData = {
            name: `${form.firstName} ${form.lastName}`,
            companyName: form.companyName,
            companySize: form.companySize,
            industry: form.industry,
            website: form.website,
            email: form.email,
            phone: form.phone,
            address: form.address,
            location: form.location,
            description: form.bio,
            establishedYear: form.establishedYear ? parseInt(form.establishedYear) : undefined,
            employees: form.employees
          };
          
          await api.post('/clients/profile', clientData);
        }
      }
      
      toast({
        title: t('auth.registrationSuccess') || 'Account created successfully',
        description: t('auth.pleaseLogin') || 'Please login with your new credentials',
      });
      
      navigate("/login");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('auth.registrationError') || 'An error occurred while creating the account. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t('auth.firstName')}</Label>
          <Input
            id="firstName"
            placeholder={t('auth.firstNamePlaceholder') || 'Ahmed'}
            value={form.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t('auth.lastName')}</Label>
          <Input
            id="lastName"
            placeholder={t('auth.lastNamePlaceholder') || 'Mohammed'}
            value={form.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('auth.emailPlaceholder') || 'example@company.com'}
          value={form.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="text-left"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('auth.phone')}</Label>
        <Input
          id="phone"
          placeholder={t('auth.phonePlaceholder') || '+966 50 123 4567'}
          value={form.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className="text-left"
          dir="ltr"
        />
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <Label htmlFor="role">{t('auth.userType')}</Label>
        <Select value={form.role} onValueChange={(value) => handleInputChange("role", value)}>
          <SelectTrigger>
            <SelectValue placeholder={t('auth.selectUserType') || 'Select user type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CLIENT">{t('roles.client')} ({t('auth.company') || 'Company'})</SelectItem>
            <SelectItem value="APPLICANT">{t('roles.applicant')} ({t('auth.jobSeeker') || 'Job Seeker'})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t('auth.passwordPlaceholder') || 'Enter password (at least 6 characters)'}
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="pl-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t('auth.confirmPasswordPlaceholder') || 'Re-enter password'}
            value={form.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className="pl-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      {form.role === "CLIENT" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="companyName">اسم الشركة</Label>
            <Input
              id="companyName"
              placeholder="شركة التقنية المتقدمة"
              value={form.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize">حجم الشركة</Label>
            <Select value={form.companySize} onValueChange={(value) => handleInputChange("companySize", value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر حجم الشركة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">{t('auth.companySize.startup') || 'شركة ناشئة (1-10 موظفين)'}</SelectItem>
                <SelectItem value="small">{t('auth.companySize.small') || 'شركة صغيرة (11-50 موظف)'}</SelectItem>
                <SelectItem value="medium">{t('auth.companySize.medium') || 'شركة متوسطة (51-200 موظف)'}</SelectItem>
                <SelectItem value="large">{t('auth.companySize.large') || 'شركة كبيرة (201-1000 موظف)'}</SelectItem>
                <SelectItem value="enterprise">{t('auth.companySize.enterprise') || 'مؤسسة كبرى (+1000 موظف)'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">{t('auth.industry') || 'القطاع'}</Label>
            <Select value={form.industry} onValueChange={(value) => handleInputChange("industry", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('auth.selectIndustry') || 'اختر القطاع'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">{t('auth.industries.technology') || 'التقنية'}</SelectItem>
                <SelectItem value="finance">{t('auth.industries.finance') || 'المالية والمصرفية'}</SelectItem>
                <SelectItem value="healthcare">{t('auth.industries.healthcare') || 'الرعاية الصحية'}</SelectItem>
                <SelectItem value="education">{t('auth.industries.education') || 'التعليم'}</SelectItem>
                <SelectItem value="retail">{t('auth.industries.retail') || 'التجارة والبيع بالتجزئة'}</SelectItem>
                <SelectItem value="manufacturing">{t('auth.industries.manufacturing') || 'التصنيع'}</SelectItem>
                <SelectItem value="construction">{t('auth.industries.construction') || 'البناء والتشييد'}</SelectItem>
                <SelectItem value="other">{t('auth.industries.other') || 'أخرى'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="establishedYear">سنة التأسيس</Label>
              <Input
                id="establishedYear"
                type="number"
                placeholder="2020"
                value={form.establishedYear}
                onChange={(e) => handleInputChange("establishedYear", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employees">عدد الموظفين</Label>
              <Input
                id="employees"
                placeholder="50"
                value={form.employees}
                onChange={(e) => handleInputChange("employees", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">{t('auth.website') || 'موقع الشركة (اختياري)'}</Label>
            <Input
              id="website"
              placeholder={t('auth.websitePlaceholder') || 'https://company.com'}
              value={form.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="text-left"
              dir="ltr"
            />
          </div>
        </>
      )}

      {form.role === "APPLICANT" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationality">الجنسية</Label>
              <Input
                id="nationality"
                placeholder="السعودية"
                value={form.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">الجنس</Label>
              <Select value={form.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">ذكر</SelectItem>
                  <SelectItem value="FEMALE">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">الحالة الاجتماعية</Label>
            <Select value={form.maritalStatus} onValueChange={(value) => handleInputChange("maritalStatus", value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة الاجتماعية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE">أعزب</SelectItem>
                <SelectItem value="MARRIED">متزوج</SelectItem>
                <SelectItem value="DIVORCED">مطلق</SelectItem>
                <SelectItem value="WIDOWED">أرمل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              placeholder="الرياض، المملكة العربية السعودية"
              value={form.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">المدينة</Label>
            <Input
              id="location"
              placeholder="الرياض"
              value={form.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      {form.role === "APPLICANT" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="experience">{t('auth.experience') || 'سنوات الخبرة'}</Label>
            <Select value={form.experience} onValueChange={(value) => handleInputChange("experience", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('auth.selectExperience') || 'اختر سنوات الخبرة'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresh">{t('auth.experienceLevels.fresh') || 'خريج جديد'}</SelectItem>
                <SelectItem value="1-2">{t('auth.experienceLevels.junior') || '1-2 سنة'}</SelectItem>
                <SelectItem value="3-5">{t('auth.experienceLevels.mid') || '3-5 سنوات'}</SelectItem>
                <SelectItem value="6-10">{t('auth.experienceLevels.senior') || '6-10 سنوات'}</SelectItem>
                <SelectItem value="10+">{t('auth.experienceLevels.expert') || 'أكثر من 10 سنوات'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">{t('auth.skills') || 'المهارات الرئيسية'}</Label>
            <Textarea
              id="skills"
              placeholder={t('auth.skillsPlaceholder') || 'مثال: JavaScript, React, Node.js, Python, إدارة المشاريع...'}
              value={form.skills}
              onChange={(e) => handleInputChange("skills", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedSalary">الراتب المتوقع</Label>
              <Input
                id="expectedSalary"
                placeholder="15000 ريال"
                value={form.expectedSalary}
                onChange={(e) => handleInputChange("expectedSalary", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableFrom">متاح من تاريخ</Label>
              <Input
                id="availableFrom"
                type="date"
                value={form.availableFrom}
                onChange={(e) => handleInputChange("availableFrom", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workType">نوع العمل المفضل</Label>
            <Select value={form.workType} onValueChange={(value) => handleInputChange("workType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع العمل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_TIME">دوام كامل</SelectItem>
                <SelectItem value="PART_TIME">دوام جزئي</SelectItem>
                <SelectItem value="CONTRACT">عقد مؤقت</SelectItem>
                <SelectItem value="FREELANCE">عمل حر</SelectItem>
                <SelectItem value="REMOTE">عمل عن بُعد</SelectItem>
                <SelectItem value="HYBRID">عمل مختلط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">اللغات</Label>
            <Input
              id="languages"
              placeholder="العربية، الإنجليزية، الفرنسية"
              value={form.languages}
              onChange={(e) => handleInputChange("languages", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">رابط الأعمال (اختياري)</Label>
            <Input
              id="portfolio"
              placeholder="https://portfolio.com"
              value={form.portfolio}
              onChange={(e) => handleInputChange("portfolio", e.target.value)}
              className="text-left"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn (اختياري)</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={form.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                className="text-left"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub (اختياري)</Label>
              <Input
                id="github"
                placeholder="https://github.com/username"
                value={form.github}
                onChange={(e) => handleInputChange("github", e.target.value)}
                className="text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">خطاب التقديم (اختياري)</Label>
            <Textarea
              id="coverLetter"
              placeholder="اكتب خطاب تقديم مختصر يوضح دوافعك وأهدافك المهنية..."
              value={form.coverLetter}
              onChange={(e) => handleInputChange("coverLetter", e.target.value)}
              rows={4}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="bio">{t('auth.bio') || 'نبذة شخصية (اختياري)'}</Label>
        <Textarea
          id="bio"
          placeholder={t('auth.bioPlaceholder') || 'اكتب نبذة مختصرة عنك أو عن شركتك...'}
          value={form.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          rows={4}
        />
      </div>

      {/* Terms Agreement */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <Checkbox
          id="terms"
          checked={form.agreeToTerms}
          onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
        />
        <Label htmlFor="terms" className="text-sm">
          {t('auth.agreeToTermsText') || 'أوافق على'}{" "}
          <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline">
            {t('auth.termsAndConditions') || 'الشروط والأحكام'}
          </Link>
          {" "}{t('auth.and') || 'و'}{" "}
          <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
            {t('auth.privacyPolicy') || 'سياسة الخصوصية'}
          </Link>
        </Label>
      </div>
    </div>
  );

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
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="w-full max-w-lg">

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{t('auth.createNewAccount') || 'إنشاء حساب جديد'}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.stepOf') ? t('auth.stepOf').replace('{current}', currentStep.toString()).replace('{total}', '3') : `الخطوة ${currentStep} من 3`}
            </CardDescription>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    {t('common.previous') || 'السابق'}
                  </Button>
                )}
                
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('auth.creating') || 'جاري الإنشاء...'}
                    </div>
                  ) : currentStep === 3 ? (
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      {t('auth.createAccount') || 'إنشاء الحساب'}
                    </div>
                  ) : (
                    t('common.next') || 'التالي'
                  )}
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {t('auth.haveAccount') || 'لديك حساب بالفعل؟'}{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    {t('auth.login') || 'تسجيل الدخول'}
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>

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

export default Register;
