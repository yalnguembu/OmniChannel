import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchVwTransactionsSummaryRequest, zSearchVwTransactionsSummaryResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchVwTransactionsSummaryRequest = z.infer<typeof zSearchVwTransactionsSummaryRequest>
type SearchVwTransactionsSummaryResponse = z.infer<typeof zSearchVwTransactionsSummaryResponse>

export interface VwTransactionsSummaryFilters extends Omit<SearchVwTransactionsSummaryRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface VwTransactionsSummaryState {
  vwTransactionsSummarys: SearchVwTransactionsSummaryResponse[]
  selectedVwTransactionsSummary: SearchVwTransactionsSummaryResponse | null
  selectedVwTransactionsSummarys: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: VwTransactionsSummaryFilters
  // You can add additional vwTransactionsSummary state properties here if needed
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

export interface VwTransactionsSummaryActions {
  // Data Actions
  setVwTransactionsSummary: (vwTransactionsSummary: SearchVwTransactionsSummaryResponse[]) => void
  addItem: (item: SearchVwTransactionsSummaryResponse) => void
  updateItem: (id: string, item: Partial<SearchVwTransactionsSummaryResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchVwTransactionsSummaryResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<VwTransactionsSummaryFilters>) => void
  clearFilters: () => void

  setSelectedVwTransactionsSummarys: (ids: string[]) => void
  selectVwTransactionsSummary: (id: string) => void
  deselectVwTransactionsSummary: (id: string) => void
  selectAllVwTransactionsSummarys: () => void
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

export type VwTransactionsSummaryStore = VwTransactionsSummaryState & VwTransactionsSummaryActions

const initialState: VwTransactionsSummaryState = {
  vwTransactionsSummarys: [],
  selectedVwTransactionsSummary: null,
  selectedVwTransactionsSummarys: [],

  currentPage: 1,
  pageSize: 10,
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

export const useVwTransactionsSummaryStore = create<VwTransactionsSummaryStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setVwTransactionsSummary: (vwTransactionsSummary) =>
        set((state: VwTransactionsSummaryState) => {
          state.vwTransactionsSummarys = vwTransactionsSummary
        }),

      addItem: (item) =>
        set((state: VwTransactionsSummaryState) => {
          state.vwTransactionsSummarys.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: VwTransactionsSummaryState) => {
          const index = state.vwTransactionsSummarys.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.vwTransactionsSummarys[index] = { ...state.vwTransactionsSummarys[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: VwTransactionsSummaryState) => {
          state.vwTransactionsSummarys = state.vwTransactionsSummarys.filter((item) => item.id !== id)
          state.selectedVwTransactionsSummarys = state.selectedVwTransactionsSummarys.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: VwTransactionsSummaryState) => {
          state.selectedVwTransactionsSummary = item
        }),

      setCurrentPage: (page) =>
        set((state: VwTransactionsSummaryState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: VwTransactionsSummaryState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: VwTransactionsSummaryState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: VwTransactionsSummaryState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: VwTransactionsSummaryState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: VwTransactionsSummaryState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedVwTransactionsSummarys: (ids) =>
        set((state: VwTransactionsSummaryState) => {
          state.selectedVwTransactionsSummarys = ids
        }),

      selectVwTransactionsSummary: (id) =>
        set((state: VwTransactionsSummaryState) => {
          if (!state.selectedVwTransactionsSummarys.includes(id)) {
            state.selectedVwTransactionsSummarys.push(id)
          }
        }),

      deselectVwTransactionsSummary: (id) =>
        set((state: VwTransactionsSummaryState) => {
          state.selectedVwTransactionsSummarys = state.selectedVwTransactionsSummarys.filter((selectedId) => selectedId !== id)
        }),

      selectAllVwTransactionsSummarys: () =>
        set((state: VwTransactionsSummaryState) => {
          state.selectedVwTransactionsSummarys = state.vwTransactionsSummarys.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: VwTransactionsSummaryState) => {
          state.selectedVwTransactionsSummarys = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: VwTransactionsSummaryState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: VwTransactionsSummaryState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: VwTransactionsSummaryState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: VwTransactionsSummaryState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: VwTransactionsSummaryState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: VwTransactionsSummaryState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: VwTransactionsSummaryState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: VwTransactionsSummaryState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: VwTransactionsSummaryState) => {
          state.selectedRows = rows
          state.selectedVwTransactionsSummarys = rows
        }),

      reset: () =>
        set((state: VwTransactionsSummaryState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "vwTransactionsSummary-store",
    },
  ),
)
