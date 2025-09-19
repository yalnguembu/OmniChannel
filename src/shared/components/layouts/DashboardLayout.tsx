import { useUIStore } from "@/shared/stores/uiStore"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Outlet } from "@tanstack/react-router"
import { AppSidebar } from "@/shared/components/sidebar"
import { Button } from "@/shared/components/ui/button"
import { Bell } from "lucide-react"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { Separator } from "@/shared/components/ui/separator"
import { UserDropdown } from "@/shared/components/sidebar/UserDropdown"

export const DashboardLayout = () => {
  const { sidebarOpen, toggleSidebar, pageTitle } = useUIStore()

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={toggleSidebar} className="w-screen overflow-hidden min-h-screen flex justify-end bg-muted">
      <AppSidebar />
      <SidebarInset className="flex-1 h-screen overflow-hidden bg-muted">
        <div className="flex items-center justify-between border-b bg-background px-2 lg:px-4 py-1">
          <div className="flex items-center gap-x-2 lg:gap-x-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <h1 className="lg:text-2xl font-semibold tracking-tight text-accent">{pageTitle}</h1>
          </div>
          <div className="flex lg:gap-x-4 items-center">
            <Button variant="outline" className="flex items-center gap-2 border-transparent lg:border-muted-foreground/20 text-muted-foreground/80">
              <Bell className="h-4 w-4" />
              <span className="hidden lg:inline">Notification</span>
            </Button>
            <UserDropdown />
          </div>
        </div>
        {/* <div className="p-4"> */}
        <Outlet />
        {/* </div> */}
      </SidebarInset>
    </SidebarProvider>
  )
}
