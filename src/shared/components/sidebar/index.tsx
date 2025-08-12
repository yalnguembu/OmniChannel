import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarSeparator } from "@/shared/components/ui/sidebar"
import SideBarMenuItems from "./SideBarMenuItems"
import Header from "./Header"
import { UserDropdown } from "./UserDropdown"
import { adminMenus } from "@/shared/lib/menu"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader className="bg-background">
        <Header />
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent className="bg-background">
        <SideBarMenuItems items={adminMenus} />
      </SidebarContent>
      <SidebarSeparator className="mx-0" />
      <SidebarFooter className="bg-background">
        <UserDropdown />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
