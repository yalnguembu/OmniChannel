import React from "react"
import { cn } from "@/shared/lib/utils"
import { useTranslation } from "react-i18next"

interface ListPageLayoutProps {
  header?: React.ReactNode
  filter?: React.ReactNode
  statistic?: React.ReactNode
  content: React.ReactNode
  className?: string
  contentClassName?: string
}

export const ListPageLayout: React.FC<ListPageLayoutProps> = ({ header, filter, content, statistic, className, contentClassName }) => {
  const { t } = useTranslation()
  return (
    <div className={cn("flex h-full flex-col justify-between overflow-y-hidden", className)}>
      {header && <div className="flex-shrink-0 px-4 pt-4">{header}</div>}

      {/* <div className="flex flex-1 overflow-hidden w-full"> */}
      <div className={cn("flex flex-1 flex-col overflow-x-hidden overflow-y-auto mt-2 relative px-4 ", contentClassName)}>
        {statistic && <div className="flex-shrink-0 mb-1 mt-2">{statistic}</div>}
        {filter && <div className="flex-shrink-0 mb-1 sticky top-0 shadow z-10">{filter}</div>}

        <div className="pt-4 min-h-3/5 h-content">
          {content}
          <div className="mt-4 block border-t py-4 text-center text-muted-foreground">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </div>
      {/* </div> */}
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
