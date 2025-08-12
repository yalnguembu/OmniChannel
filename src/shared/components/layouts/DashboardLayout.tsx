import { useUIStore } from "@/shared/stores/uiStore"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Outlet } from "@tanstack/react-router"
import { AppSidebar } from "@/shared/components/sidebar"

export const DashboardLayout = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={toggleSidebar} className="w-screen overflow-hidden min-h-screen flex justify-end bg-muted">
      <AppSidebar />
      <SidebarInset className="flex-1 h-screen overflow-hidden p-4 bg-muted">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
