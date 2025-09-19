import React, { useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"
import { ListPageHeaderProps } from "@/shared/types/components"
import { BreadcrumbNavigation } from "./BreadcrumbNavigation"
import { useUIStore } from "@/shared/stores/uiStore"

export const ListPageHeader: React.FC<ListPageHeaderProps> = ({ title, addButtonText, breadcrumbs, onCreate, actions }) => {
  const { setPageTitle } = useUIStore()

  useEffect(() => setPageTitle(title), [title])

  return (
    <div className="w-full grid">
      {/* <h1 className="text-2xl font-bold tracking-tight text-primary lg:hidden">{title}</h1> */}
      <div className="flex items-center justify-between">
        {breadcrumbs?.length ? <BreadcrumbNavigation breadcrumbs={breadcrumbs} /> : <></>}
        <div className="flex gap-4 items-center">
          {addButtonText && (
            <Button onClick={onCreate} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">{addButtonText}</span>
            </Button>
          )}
          {actions}
        </div>
      </div>
    </div>
  )
}
