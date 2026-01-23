import { useUIStore } from "@/shared/stores/uiStore"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Link, Outlet } from "@tanstack/react-router"
import { AppSidebar } from "@/shared/components/sidebar"
import { Button } from "@/shared/components/ui/button"
import { Bell, Loader, Search } from "lucide-react"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { Separator } from "@/shared/components/ui/separator"
import { UserDropdown } from "@/shared/components/sidebar/UserDropdown"
// import { getApiUserMe } from "@/shared/api/sdk.gen"
// import { useQuery } from "@tanstack/react-query"
// import { useSessionStore } from "@/shared"
import { ScrollToTopButton } from "../ScrollToTopButton"
import AppLogo from "@/assets/images/logo/icon.png"

export const DashboardLayout = () => {
  const { sidebarOpen, toggleSidebar, pageTitle } = useUIStore()
  // const sessionStore = useSessionStore()

  // const { isLoading } = useQuery({
  //   queryKey: ["user-profile"],
  //   queryFn: async () => {
  //     const result = await getApiUserMe()
  //     if (result.data?.data) {
  //       sessionStore.setPermissions(result.data.data?.permissions || [])
  //     }
  //     return result.data
  //   },
  // })

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={toggleSidebar} className="w-screen overflow-hidden min-h-screen flex flex-col justify-end bg-muted">
      <div className="w-full">
        <div className="flex items-center justify-between border-b bg-background px-2 lg:px-4 py-1">
          <div className="flex items-center gap-x-2 lg:gap-x-4">
            <Link to="/" className="flex items-center gap-2 py-0">
              <img src="/logo-horizontal.png" title="Omni Channel" className="w-32" />
            </Link>
          </div>
          <div>
            {/** search bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-64 lg:w-80 rounded-md border border-input bg-muted/50 pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

          </div>
          <div className="flex lg:gap-x-4 items-center">
            <button className="flex items-center gap-2 border-transparent lg:border-muted-foreground/20 text-muted-foreground/80">
              <Bell className="h-4 w-4" />
            </button>
            <UserDropdown />
          </div>
        </div>
      </div>
      <div className="flex-1  flex justify-end bg-muted">
        <AppSidebar className="mt-16" />
        <SidebarInset className="flex-1 h-screen overflow-hidden bg-muted">

          {/*isLoading ? (
          <div className="flex w-full h-full items-center justify-center">
            <Loader />
          </div>
        ) : (
          <Outlet />
        )*/}
          <Outlet />
          <ScrollToTopButton />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
