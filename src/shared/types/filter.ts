import { z } from "zod"
import { FilterFieldType } from "../enums/filter"

export interface FilterOption {
  label: string
  value: string
}

export interface DateRangeValue {
  from: string | Date | null
  to: string | Date | null
}

export interface FilterFieldConfig {
  key: string
  label?: string
  labelKey?: string // Explicit translation key
  type: FilterFieldType
  placeholder?: string
  placeholderKey?: string // Explicit translation key
  options?: FilterOption[]
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  multiple?: boolean
  validation?: z.ZodType<any>
  className?: string
  description?: string
  fetchOptions?: () => any
  isLoadingOptions?: boolean
  transform?: (value: any) => Record<string, any>
}

export interface FilterSection {
  title?: string
  titleKey?: string
  fields: FilterFieldConfig[]
  collapsible?: boolean
  defaultCollapsed?: boolean
}
export type ViewMode = "list" | "grid"
export interface BaseFilterProps<T = Record<string, any>> {
  schema?: z.ZodSchema<T>
  onFilter: (values: T) => void
  onReset?: () => void
  defaultValues?: Partial<T>
  isLoading?: boolean
  showResetButton?: boolean
  showFilterButton?: boolean
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  refreshData: () => void
  hasSelection: boolean
  selectedRows: any[]
  selectionCount: number
  onImport?: () => void
  onExport?: () => void
  enableDateRange?: boolean
  sections?: FilterSection[]
  fieldTranslationPrefix?: string
  containerRef?: React.RefObject<HTMLDivElement>
}
