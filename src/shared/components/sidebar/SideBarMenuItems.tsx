import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/shared/components/ui/sidebar"
import { SideBarMenuItem } from "@/shared/types/menu"
import React, { useEffect } from "react"
import { useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Link } from "@tanstack/react-router"
import { useUIStore } from "@/shared/stores/uiStore"

type SideBarMenuItemsProps = {
  items: SideBarMenuItem[]
}

const SideBarMenuItems: React.FC<SideBarMenuItemsProps> = ({ items }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const currentPath = location.pathname

  const updateMenuProperty = useUIStore((state) => state.updateMenuProperty)
  const getMenuProperty = useUIStore((state) => state.getMenuProperty)

  useEffect(() => {
    items.forEach((item) => {
      if (item.path && currentPath.includes(item.path)) {
        updateMenuProperty(`sidebar.${item.label}`, { isActive: true, isOpen: true })
      } else if (item.children?.some((child) => child.path && currentPath.startsWith(child.path))) {
        updateMenuProperty(`sidebar.${item.label}`, { isActive: false, isOpen: true })
      } else {
        updateMenuProperty(`sidebar.${item.label}`, { isActive: false })
      }

      item.children?.forEach((subItem) => {
        const isSubActive = subItem.path && currentPath.startsWith(subItem.path)
        if (isSubActive) {
          updateMenuProperty(`sidebar.${item.label}.subItems.${subItem.label}`, {
            isActive: true,
          })
        } else {
          updateMenuProperty(`sidebar.${item.label}.subItems.${subItem.label}`, {
            isActive: false,
          })
        }
      })
    })
  }, [currentPath, items, updateMenuProperty])

  return (
    <SidebarGroup className="text-muted-foreground group-data-[collapsible=icon]:p-0">
      <SidebarMenu className="gap-y-3">
        {items.map((item, index) => {
          const isActive = !!item.path && currentPath.includes(item.path)
          const menuState = getMenuProperty(`sidebar.${item.label}`) || {}
          const isOpen = menuState.isOpen || false

          const handleToggle = (open: boolean) => {
            updateMenuProperty(`sidebar.${item.label}`, { isOpen: open })
          }

          return item.children ? (
            <Collapsible key={`menu.${item.label} ${index}`} asChild className="group/collapsible" open={isOpen} onOpenChange={handleToggle}>
              <SidebarMenuItem data-active={isActive}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton variant="outline" isActive={isActive} className="w-full flex justify-between items-center px-2 xl:px-4 py-1">
                    <div className="flex items-center">
                      {item.icon && <item.icon className="inline size-4" />}
                      <span className="pl-2 font-medium group-data-[collapsible=icon]:hidden">{t(item.label as any)}</span>
                    </div>
                    <ChevronRight className="ml-auto transition-transform size-5 -400 duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                  <SidebarMenuSub className="pt-2">
                    {item.children?.map((subItem) => {
                      const isSubActive = subItem.path && currentPath.toLocaleLowerCase() === subItem.path.toLocaleLowerCase()
                      return (
                        <SidebarMenuSubItem
                          className={`text-muted-foreground ${isSubActive ? "border-r-4 rounded-l rounded-r-xs bg-accent/5 border-r-primary text-primary" : ""}`}
                          key={subItem.label}
                          data-active={isSubActive}
                        >
                          <SidebarMenuSubButton className="text-base" size="sm" asChild>
                            <div className="w-full py-4 flex justify-between items-center">
                              <Link to={subItem.path} className={`inline-block py-3 text-sm truncate w-full ${isSubActive ? "font-semibold text-primary" : ""}`}>
                                {/*subItem.icon && <subItem.icon className="inline size-4" />*/}
                                <span className="pl-2 py-3">{t(subItem.label as any)}</span>
                              </Link>
                            </div>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={`menu.${item.label} ${index}`} data-active={isActive}>
              <SidebarMenuButton variant="outline" isActive={isActive} asChild>
                <Link to={item.path} className={`truncate w-full flex items-center xl:px-4 ${isActive ? "font-semibold" : ""}`}>
                  {item.icon && <item.icon className="inline size-4" />}
                  <span className="pl-2 font-medium group-data-[collapsible=icon]:hidden">{t(item.label as any)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default SideBarMenuItems
