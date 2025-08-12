import React from "react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Plus, Bell } from "lucide-react"
import { ListPageHeaderProps } from "@/shared/types/components"
import { BreadcrumbNavigation } from "./BreadcrumbNavigation"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { Separator } from "@/shared/components/ui/separator"

export const ListPageHeader: React.FC<ListPageHeaderProps> = ({ title, totalCountText, addButtonText, breadcrumbs, totalItems, onCreate, actions }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
          {!!totalItems && totalItems > 0 && (
            <Badge variant="secondary" className="text-sm">
              {totalCountText}
            </Badge>
          )}
        </div>
        <div className="flex gap-4 items-center">
          {addButtonText && (
            <Button onClick={onCreate} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">{addButtonText}</span>
            </Button>
          )}

          <Button variant="outline" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden lg:inline">Notification</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation breadcrumbs={breadcrumbs} />
        <div>{actions}</div>
      </div>
    </div>
  )
}
