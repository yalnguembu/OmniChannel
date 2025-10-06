import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchCompanyAppLimitRequest, zSearchCompanyAppLimitResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchCompanyAppLimitRequest = z.infer<typeof zSearchCompanyAppLimitRequest>
type SearchCompanyAppLimitResponse = z.infer<typeof zSearchCompanyAppLimitResponse>

export interface CompanyAppLimitFilters extends Omit<SearchCompanyAppLimitRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface CompanyAppLimitState {
  companyAppLimits: SearchCompanyAppLimitResponse[]
  selectedCompanyAppLimit: SearchCompanyAppLimitResponse | null
  selectedCompanyAppLimits: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: CompanyAppLimitFilters
  // You can add additional companyAppLimit state properties here if needed
  isLoading: boolean
  isSearching: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null

  // View State
  viewMode: "grid" | "list"
  isFilterCollapsed: boolean
  selectedRows: string[]
}

export interface CompanyAppLimitActions {
  // Data Actions
  setCompanyAppLimit: (companyAppLimit: SearchCompanyAppLimitResponse[]) => void
  addItem: (item: SearchCompanyAppLimitResponse) => void
  updateItem: (id: string, item: Partial<SearchCompanyAppLimitResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchCompanyAppLimitResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<CompanyAppLimitFilters>) => void
  clearFilters: () => void

  setSelectedCompanyAppLimits: (ids: string[]) => void
  selectCompanyAppLimit: (id: string) => void
  deselectCompanyAppLimit: (id: string) => void
  selectAllCompanyAppLimits: () => void
  clearSelection: () => void

  setLoading: (loading: boolean) => void
  setSearching: (searching: boolean) => void
  setCreating: (creating: boolean) => void
  setUpdating: (updating: boolean) => void
  setDeleting: (deleting: boolean) => void

  setError: (error: string | null) => void

  setViewMode: (mode: "grid" | "list") => void
  toggleFilter: () => void
  setSelectedRows: (rows: string[]) => void

  reset: () => void
}

export type CompanyAppLimitStore = CompanyAppLimitState & CompanyAppLimitActions

const initialState: CompanyAppLimitState = {
  companyAppLimits: [],
  selectedCompanyAppLimit: null,
  selectedCompanyAppLimits: [],

  currentPage: 1,
  pageSize: 10000,
  totalItems: 0,
  totalPages: 0,

  sortBy: "createdAt",
  sortDirection: SortDirection.DESC,

  filters: {},

  isLoading: false,
  isSearching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  viewMode: "list",
  isFilterCollapsed: false,
  selectedRows: [],
}

export const useCompanyAppLimitStore = create<CompanyAppLimitStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setCompanyAppLimit: (companyAppLimit) =>
        set((state: CompanyAppLimitState) => {
          state.companyAppLimits = companyAppLimit
        }),

      addItem: (item) =>
        set((state: CompanyAppLimitState) => {
          state.companyAppLimits.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: CompanyAppLimitState) => {
          const index = state.companyAppLimits.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.companyAppLimits[index] = { ...state.companyAppLimits[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: CompanyAppLimitState) => {
          state.companyAppLimits = state.companyAppLimits.filter((item) => item.id !== id)
          state.selectedCompanyAppLimits = state.selectedCompanyAppLimits.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: CompanyAppLimitState) => {
          state.selectedCompanyAppLimit = item
        }),

      setCurrentPage: (page) =>
        set((state: CompanyAppLimitState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: CompanyAppLimitState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: CompanyAppLimitState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: CompanyAppLimitState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: CompanyAppLimitState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: CompanyAppLimitState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedCompanyAppLimits: (ids) =>
        set((state: CompanyAppLimitState) => {
          state.selectedCompanyAppLimits = ids
        }),

      selectCompanyAppLimit: (id) =>
        set((state: CompanyAppLimitState) => {
          if (!state.selectedCompanyAppLimits.includes(id)) {
            state.selectedCompanyAppLimits.push(id)
          }
        }),

      deselectCompanyAppLimit: (id) =>
        set((state: CompanyAppLimitState) => {
          state.selectedCompanyAppLimits = state.selectedCompanyAppLimits.filter((selectedId) => selectedId !== id)
        }),

      selectAllCompanyAppLimits: () =>
        set((state: CompanyAppLimitState) => {
          state.selectedCompanyAppLimits = state.companyAppLimits.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: CompanyAppLimitState) => {
          state.selectedCompanyAppLimits = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: CompanyAppLimitState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: CompanyAppLimitState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: CompanyAppLimitState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: CompanyAppLimitState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: CompanyAppLimitState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: CompanyAppLimitState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: CompanyAppLimitState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: CompanyAppLimitState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: CompanyAppLimitState) => {
          state.selectedRows = rows
          state.selectedCompanyAppLimits = rows
        }),

      reset: () =>
        set((state: CompanyAppLimitState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "companyAppLimit-store",
    },
  ),
)
