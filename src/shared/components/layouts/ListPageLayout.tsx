import React from "react"
import { cn } from "@/shared/lib/utils"

interface ListPageLayoutProps {
  header?: React.ReactNode
  filter?: React.ReactNode
  content: React.ReactNode
  className?: string
  contentClassName?: string
}

export const ListPageLayout: React.FC<ListPageLayoutProps> = ({ header, filter, content, className, contentClassName }) => {
  return (
    <div className={cn("flex h-full flex-col overflow-y-auto", className)}>
      {header && <div className="flex-shrink-0">{header}</div>}

      <div className="flex flex-1 overflow-hidden w-full">
        <div className={cn("flex flex-1 flex-col overflow-hidden pt-4", contentClassName)}>
          {filter && <div className="flex-shrink-0 bg-background/50">{filter}</div>}

          <div className="flex-1 overflow-x-hidden pt-4">{content}</div>
        </div>
      </div>
    </div>
  )
}

export const StandardListPageLayout: React.FC<Omit<ListPageLayoutProps, "sidebar">> = (props) => <ListPageLayout {...props} />

interface ListPageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  className?: string
}

export const ListPageHeader: React.FC<ListPageHeaderProps> = ({ title, subtitle, actions, breadcrumbs, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumbs && <div className="text-sm text-muted-foreground">{breadcrumbs}</div>}

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </div>
  )
}
