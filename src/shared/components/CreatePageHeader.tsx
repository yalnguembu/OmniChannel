import React, { useEffect } from "react"
import { CreatePageHeaderProps } from "@/shared/types/components"
import { BreadcrumbNavigation } from "./BreadcrumbNavigation"
import { useUIStore } from "@/shared/stores/uiStore"

export const CreatePageHeader: React.FC<CreatePageHeaderProps> = ({ title, breadcrumbs }) => {
  const { setPageTitle } = useUIStore()

  useEffect(() => setPageTitle(title), [title])

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">{breadcrumbs?.length ? <BreadcrumbNavigation breadcrumbs={breadcrumbs} /> : <></>}</div>
    </div>
  )
}
