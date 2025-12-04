import { Bell, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { ProfileSection } from "@/components/profile/ProfileSection"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useSystemSettings } from "@/hooks/useSystemSettings"

interface AppNavbarProps {
  userRole?: string
  userName?: string
}

export function AppNavbar({ userRole = "admin", userName = "أحمد محمد" }: AppNavbarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showProfileSection, setShowProfileSection] = useState(false);
  const { t } = useLanguage();
  const { logo } = useSystemSettings();
  
  // Use actual user data if available
  const actualUserRole = user?.role || userRole;
  const actualUserName = user?.name || userName;

  const getRoleDisplayName = () => {
    switch (actualUserRole?.toLowerCase()) {
      case "hr":
        return t('roles.hrEmployee')
      case "sales":
        return t('roles.salesEmployee')
      case "client":
        return t('roles.client')
      case "applicant":
        return t('roles.applicant')
      case "admin":
        return t('roles.administrator')
      default:
        return t('roles.administrator')
    }
  }



  const handleCloseProfileSection = () => {
    setShowProfileSection(false);
  };


  

  const handleLogout = () => {
    logout();
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-4">
        {/* Right side - Logo and Menu */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
              <div className="h-9 w-9 rounded-2xl flex-shrink-0 bg-white  ">
                <a href="/" className="h-full w-full flex items-center justify-center">
                  <img src={logo} alt="YAS Logo" className="h-full w-full object-contain" />
                  </a>
                </div>            </div>
            <span className="hidden sm:block font-bold text-base sm:text-lg">YAS GLOBAL PARTNER</span>
          </div>
        </div>

        {/* Left side - Theme, Language, Notifications and User */}
        <div className="flex items-center gap-2 sm:gap-3 mr-auto">
          {/* Theme and Language Toggles */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs">
                0
              </Badge>
            </Button>
          </div>

          {/* User Dropdown - Arabic RTL */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 sm:h-10 w-auto px-2 sm:px-3 gap-1.5 sm:gap-2" dir="rtl">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.png" alt={actualUserName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {actualUserName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-right">
                  <span className="text-sm font-medium">{actualUserName}</span>
                  <span className="text-xs text-muted-foreground">{getRoleDisplayName()}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 flex-row-reverse" align="start" forceMount >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 text-right">
                  <p className="text-sm font-medium leading-none">{actualUserName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {getRoleDisplayName()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />


              <DropdownMenuItem 
                className="cursor-pointer text-destructive flex items-center justify-between"
                onClick={handleLogout}
              >
                <span>{t('auth.logout')}</span>
                <LogOut className="mr-2 h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    
    {/* Profile Section */}
    <ProfileSection 
      isVisible={showProfileSection}
      onClose={handleCloseProfileSection}
      userRole={actualUserRole}
      userName={actualUserName}
    />
  </>
  )
}
