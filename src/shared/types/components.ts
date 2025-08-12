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
  totalCountText?: string
  addButtonText?: string
  breadcrumbs: BreadcrumbItem[]
  totalItems?: number
  onCreate?: () => void
  actions?: React.ReactNode
}
