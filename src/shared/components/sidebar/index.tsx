import { Sidebar, SidebarContent, SidebarHeader, SidebarRail, SidebarSeparator, SidebarGroup, SidebarGroupLabel, SidebarMenuItem } from "@/shared/components/ui/sidebar"
import SideBarMenuItems from "./SideBarMenuItems"
import Header from "./Header"
import { adminMenus } from "@/shared/lib/menu"
import { Info } from "lucide-react"
import { useTranslation } from "react-i18next"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader className="bg-background py-1.5">
        <Header />
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent className="bg-background">
        {adminMenus.map((admin, index) => (
          <SidebarGroup key={admin.groupTitle + index}>
            {admin.groupTitle.length > 0 && <SidebarGroupLabel>{t(admin.groupTitle)}</SidebarGroupLabel>}
            <SideBarMenuItems items={admin.elements} />
          </SidebarGroup>
        ))}
        <SidebarSeparator className="mx-0 bg-muted/30" />
        {/* <SidebarGroup> */}
        {/* <SidebarMenuItem> */}
        <div className="flex items-center text-muted-foreground/70 p-2 w-full mt-auto group-data-[collapsible=icon]:p-4">
          <Info className="inline size-4" />
          <span className="pl-2 font-medium text-sm group-data-[collapsible=icon]:hidden">{t("menu.support")}</span>
        </div>
        {/* </SidebarMenuItem> */}
        {/* </SidebarGroup> */}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
