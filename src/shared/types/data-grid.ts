import type { SortDirection } from "../enums/data-grid"
import { ReactNode } from "react"

// Data Grid types
export interface DataGridColumnHeader {
  key: string
  label: string
  sortable?: boolean
  width?: number
  minWidth?: number
  resizable?: boolean
  isBadge?: boolean
}

export interface DataGridRowEntry {
  getId: () => string
  getCandidateId?: () => string
  getTextFor: (columnKey: string) => string | string[]
}

export interface DataGridSort {
  column: string
  direction: SortDirection | null
}

// Component-specific types for DataGrid
export interface BulkAction {
  label: string
  action: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  loading?: boolean
}

type ACTION = "view" | "delete" | "edit" | "activate" | "deactivate"

export interface DataGridProps {
  columnHeaders: DataGridColumnHeader[]
  items: DataGridRowEntry[]
  total?: number
  page?: number
  limit?: number
  hasPagination?: boolean
  onPageChange?: (page: number, pageSize: number) => void
  isLoading?: boolean
  emptyMessage?: string
  enableSelection?: boolean
  selectedRows?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  enableSorting?: boolean
  sortConfig?: DataGridSort
  onSortChange?: (sort: DataGridSort) => void
  enableColumnVisibility?: boolean
  hiddenColumns?: string[]
  onColumnVisibilityChange?: (hiddenColumns: string[]) => void
  bulkActions?: BulkAction[]
  renderCell?: (item: DataGridRowEntry, columnKey: string) => ReactNode
  dispatch?: (action: ACTION, id: string) => void
  actions?: ACTION[]
  showTitle?: boolean
}

// Common component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingProps {
  isLoading: boolean
  loadingText?: string
}

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number, pageSize: number) => void
}
