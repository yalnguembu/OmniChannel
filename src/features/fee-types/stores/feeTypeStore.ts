import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchFeeTypeRequest, zSearchFeeTypeResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchFeeTypeRequest = z.infer<typeof zSearchFeeTypeRequest>
type SearchFeeTypeResponse = z.infer<typeof zSearchFeeTypeResponse>

export interface FeeTypeFilters extends Omit<SearchFeeTypeRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface FeeTypeState {
  feeTypes: SearchFeeTypeResponse[]
  selectedFeeType: SearchFeeTypeResponse | null
  selectedFeeTypes: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: FeeTypeFilters
  // You can add additional feeType state properties here if needed
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

export interface FeeTypeActions {
  // Data Actions
  setFeeType: (feeType: SearchFeeTypeResponse[]) => void
  addItem: (item: SearchFeeTypeResponse) => void
  updateItem: (id: string, item: Partial<SearchFeeTypeResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchFeeTypeResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<FeeTypeFilters>) => void
  clearFilters: () => void

  setSelectedFeeTypes: (ids: string[]) => void
  selectFeeType: (id: string) => void
  deselectFeeType: (id: string) => void
  selectAllFeeTypes: () => void
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

export type FeeTypeStore = FeeTypeState & FeeTypeActions

const initialState: FeeTypeState = {
  feeTypes: [],
  selectedFeeType: null,
  selectedFeeTypes: [],

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

export const useFeeTypeStore = create<FeeTypeStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setFeeType: (feeType) =>
        set((state: FeeTypeState) => {
          state.feeTypes = feeType
        }),

      addItem: (item) =>
        set((state: FeeTypeState) => {
          state.feeTypes.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: FeeTypeState) => {
          const index = state.feeTypes.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.feeTypes[index] = { ...state.feeTypes[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: FeeTypeState) => {
          state.feeTypes = state.feeTypes.filter((item) => item.id !== id)
          state.selectedFeeTypes = state.selectedFeeTypes.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: FeeTypeState) => {
          state.selectedFeeType = item
        }),

      setCurrentPage: (page) =>
        set((state: FeeTypeState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: FeeTypeState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: FeeTypeState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: FeeTypeState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: FeeTypeState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: FeeTypeState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedFeeTypes: (ids) =>
        set((state: FeeTypeState) => {
          state.selectedFeeTypes = ids
        }),

      selectFeeType: (id) =>
        set((state: FeeTypeState) => {
          if (!state.selectedFeeTypes.includes(id)) {
            state.selectedFeeTypes.push(id)
          }
        }),

      deselectFeeType: (id) =>
        set((state: FeeTypeState) => {
          state.selectedFeeTypes = state.selectedFeeTypes.filter((selectedId) => selectedId !== id)
        }),

      selectAllFeeTypes: () =>
        set((state: FeeTypeState) => {
          state.selectedFeeTypes = state.feeTypes.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: FeeTypeState) => {
          state.selectedFeeTypes = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: FeeTypeState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: FeeTypeState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: FeeTypeState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: FeeTypeState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: FeeTypeState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: FeeTypeState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: FeeTypeState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: FeeTypeState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: FeeTypeState) => {
          state.selectedRows = rows
          state.selectedFeeTypes = rows
        }),

      reset: () =>
        set((state: FeeTypeState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "feeType-store",
    },
  ),
)
