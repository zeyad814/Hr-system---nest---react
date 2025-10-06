import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { AppNavbar } from "./AppNavbar"
import { Toaster } from "@/components/ui/toaster"

interface MainLayoutProps {
  children: React.ReactNode
  userRole?: string
  userName?: string
}

export function MainLayout({ 
  children, 
  userRole = "admin", 
  userName = "أحمد محمد" 
}: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full" dir="rtl">
        <AppNavbar userRole={userRole} userName={userName} />
        <div className="flex">
          <div className="mt-16">
            <AppSidebar userRole={userRole} />
          </div>
          <main className="flex-1 p-6 bg-muted/20 min-h-[calc(100vh-4rem)] overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}