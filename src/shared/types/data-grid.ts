import type { SortDirection } from "../enums/data-grid"
import { ReactNode } from "react"
import { BadgeStyles } from "./enums"

export type BadgeTheme = "active" | "deactive" | "true" | "false" | "failed" | "cancelled" | "completed" | "success" | "warn" | ""

export interface DataGridColumnHeader {
  key: string
  label: string
  sortable?: boolean
  width?: number
  minWidth?: number
  resizable?: boolean
  isBadge?: boolean
  badgeTheme?: BadgeStyles
  shouldClick?: boolean
  style?: string
}

export interface DataGridRowEntry {
  getId: () => string
  getTextFor: (columnKey: string) => string | string[]
}

export interface DataGridSort {
  column: string
  direction: SortDirection | null
}

export interface BulkAction {
  label: string
  action: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  loading?: boolean
}

export type ACTION = "view" | "delete" | "edit" | "activate" | "deactivate" | "ROW_CLICK"

export type BreakPoint = "sm" | "md" | "lg" | "xl" | "xl2"
export type ViewMode = "list" | "grid"

export type DataGridViewMode = Record<BreakPoint, ViewMode> | ViewMode

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
  renderCell?: (item: DataGridRowEntry, column: DataGridColumnHeader, view: ViewMode) => ReactNode
  dispatch: (action: ACTION, id: string) => void
  actions?: ACTION[]
  showTitle?: boolean
  viewMode?: DataGridViewMode
  gridSize?: string
}

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface LoadingProps {
  isLoading: boolean
  loadingText?: string
  isProcessing?: boolean
  processingRowId: string
}

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number, pageSize: number) => void
}
