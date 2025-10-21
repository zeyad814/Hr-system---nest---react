import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  BarChart3,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Settings,
  Home,
  UserCheck,
  Calendar,
  Target,
  Building2,
  FileBarChart,
  Video,
  User,
  Archive,
  Bell,
  Package
} from "lucide-react"

import { useLanguage } from "@/contexts/LanguageContext"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"

// Navigation items for different user roles with translation support
const getAdminItems = (t: any) => [
  { title: t('nav.dashboard'), url: "/admin", icon: Home },
  { title: t('nav.userManagement'), url: "/admin/users", icon: UserCheck },
  { title: t('nav.clients'), url: "/admin/clients", icon: Users },
  { title: t('nav.jobs'), url: "/admin/jobs", icon: Briefcase },
  { title: t('nav.contracts'), url: "/admin/contracts", icon: FileText },
  { title: t('nav.reports'), url: "/admin/reports", icon: FileBarChart },
  { title: t('nav.targets'), url: "/admin/monthly-targets", icon: Target },
  { title: t('nav.skillPackages'), url: "/admin/skill-packages", icon: Package },
  { title: t('nav.interviews'), url: "/admin/interviews", icon: Video },
  { title: t('nav.systemSettings'), url: "/admin/settings", icon: Settings },
]

const getHrItems = (t: any) => [
  { title: t('nav.dashboard'), url: "/hr", icon: Home },
  { title: t('nav.jobs'), url: "/hr/jobs", icon: Briefcase },
  { title: t('nav.candidates'), url: "/hr/candidates", icon: Users },
  { title: t('nav.interviews'), url: "/hr/interviews", icon: Calendar },
  { title: t('nav.reports'), url: "/hr/reports", icon: BarChart3 },
  { title: t('nav.profile'), url: "/hr/profile", icon: User },
]

const getSalesItems = (t: any) => [
  { title: t('nav.dashboard'), url: "/sales", icon: Home },
  { title: t('nav.contracts'), url: "/sales/contracts", icon: FileText },
  { title: t('nav.revenue'), url: "/sales/revenue", icon: DollarSign },
  { title: t('nav.targets'), url: "/sales/targets", icon: Target },
  //{ title: t('nav.reminders'), url: "/sales/reminders", icon: Bell },
  { title: t('nav.profile'), url: "/sales/profile", icon: User },
]

const getClientItems = (t: any) => [
  { title: t('nav.dashboard'), url: "/client", icon: Home },
  { title: t('nav.requestJob'), url: "/client/request-job", icon: Briefcase },
  { title: t('nav.jobs'), url: "/client/jobs", icon: Briefcase },
  { title: t('nav.candidates'), url: "/client/candidates", icon: Users },
  { title: t('nav.contracts'), url: "/client/contracts", icon: FileText },
  { title: t('nav.profile'), url: "/client/profile", icon: User },
]

const getApplicantItems = (t: any) => [
  { title: t('nav.dashboard'), url: "/applicant", icon: Home },
  { title: t('nav.jobs'), url: "/applicant/jobs", icon: Briefcase },
  { title: t('nav.applications'), url: "/applicant/applications", icon: FileText },
  { title: t('nav.interviews'), url: "/applicant/interviews", icon: Calendar },
  { title: t('nav.profile'), url: "/applicant/profile", icon: User },
]

export function AppSidebar({ userRole = "admin" }: { userRole?: string }) {
  const { state, open } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"
  const { t, isRTL } = useLanguage()

  // Select navigation items based on user role
  const getNavigationItems = () => {
    switch (userRole) {
      case "hr":
        return getHrItems(t)
      case "sales":
        return getSalesItems(t)
      case "client":
        return getClientItems(t)
      case "applicant":
        return getApplicantItems(t)
      default:
        return getAdminItems(t)
    }
  }

  const navigationItems = getNavigationItems()
  const isActive = (path: string) => currentPath === path

  const getRoleTitle = () => {
    switch (userRole) {
      case "hr":
        return t('roles.hrEmployee')
      case "sales":
        return t('roles.salesEmployee')
      case "client":
        return t('roles.client')
      case "applicant":
        return t('roles.applicant')
      default:
        return t('roles.administrator')
    }
  }

  return (
    <Sidebar
      className="transition-all duration-300"
      collapsible="icon"
      side="right"
    >
      <SidebarContent className="bg-sidebar">
        <div className="p-3 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="text-center">
              <h2 className="text-lg font-bold text-sidebar-foreground">
                {t('app.title')}
              </h2>
              <p className="text-sm text-sidebar-foreground/70 mt-1">
                {getRoleTitle()}
              </p>
            </div>
          )}
        </div>

       

        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-3 py-1">
            {!isCollapsed && t('nav.mainMenu')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.url}
                      className={`nav-item transition-all duration-200 rounded-lg px-3 py-2 flex items-center ${
                        isActive(item.url)
                          ? "bg-red-600  text-white shadow-md border-l-4 border-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-sm"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 transition-colors duration-200 ${
                        isCollapsed ? "mx-auto" : "ml-2"
                      } ${
                        isActive(item.url) ? "text-white" : "text-current"
                      }`} />
                      {!isCollapsed && (
                        <span className="font-medium transition-colors duration-200">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> 

      </SidebarContent>
      
    </Sidebar>
  )
}