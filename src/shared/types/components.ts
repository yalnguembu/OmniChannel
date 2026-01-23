// Page Header Types
export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface CreatePageHeaderProps {
  title: string
  breadcrumbs: BreadcrumbItem[]
}

export interface ListPageHeaderProps {
  title: string
  description?: string
  addButtonText?: string
  breadcrumbs?: BreadcrumbItem[]
  onCreate?: () => void
  actions?: React.ReactNode
}
