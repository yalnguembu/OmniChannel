import React from "react"
import { CreatePageHeaderProps } from "@/shared/types/components"
import { BreadcrumbNavigation } from "./BreadcrumbNavigation"

export const CreatePageHeader: React.FC<CreatePageHeaderProps> = ({ title, breadcrumbs }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>{" "}
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation breadcrumbs={breadcrumbs} />
      </div>
    </div>
  )
}
