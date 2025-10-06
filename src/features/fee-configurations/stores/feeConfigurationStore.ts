import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchFeeConfigurationRequest, zSearchFeeConfigurationResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchFeeConfigurationRequest = z.infer<typeof zSearchFeeConfigurationRequest>
type SearchFeeConfigurationResponse = z.infer<typeof zSearchFeeConfigurationResponse>

export interface FeeConfigurationFilters extends Omit<SearchFeeConfigurationRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface FeeConfigurationState {
  feeConfigurations: SearchFeeConfigurationResponse[]
  selectedFeeConfiguration: SearchFeeConfigurationResponse | null
  selectedFeeConfigurations: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: FeeConfigurationFilters
  // You can add additional feeConfiguration state properties here if needed
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

export interface FeeConfigurationActions {
  // Data Actions
  setFeeConfiguration: (feeConfiguration: SearchFeeConfigurationResponse[]) => void
  addItem: (item: SearchFeeConfigurationResponse) => void
  updateItem: (id: string, item: Partial<SearchFeeConfigurationResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchFeeConfigurationResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<FeeConfigurationFilters>) => void
  clearFilters: () => void

  setSelectedFeeConfigurations: (ids: string[]) => void
  selectFeeConfiguration: (id: string) => void
  deselectFeeConfiguration: (id: string) => void
  selectAllFeeConfigurations: () => void
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

export type FeeConfigurationStore = FeeConfigurationState & FeeConfigurationActions

const initialState: FeeConfigurationState = {
  feeConfigurations: [],
  selectedFeeConfiguration: null,
  selectedFeeConfigurations: [],

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

export const useFeeConfigurationStore = create<FeeConfigurationStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setFeeConfiguration: (feeConfiguration) =>
        set((state: FeeConfigurationState) => {
          state.feeConfigurations = feeConfiguration
        }),

      addItem: (item) =>
        set((state: FeeConfigurationState) => {
          state.feeConfigurations.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: FeeConfigurationState) => {
          const index = state.feeConfigurations.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.feeConfigurations[index] = { ...state.feeConfigurations[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: FeeConfigurationState) => {
          state.feeConfigurations = state.feeConfigurations.filter((item) => item.id !== id)
          state.selectedFeeConfigurations = state.selectedFeeConfigurations.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: FeeConfigurationState) => {
          state.selectedFeeConfiguration = item
        }),

      setCurrentPage: (page) =>
        set((state: FeeConfigurationState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: FeeConfigurationState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: FeeConfigurationState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: FeeConfigurationState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: FeeConfigurationState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: FeeConfigurationState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedFeeConfigurations: (ids) =>
        set((state: FeeConfigurationState) => {
          state.selectedFeeConfigurations = ids
        }),

      selectFeeConfiguration: (id) =>
        set((state: FeeConfigurationState) => {
          if (!state.selectedFeeConfigurations.includes(id)) {
            state.selectedFeeConfigurations.push(id)
          }
        }),

      deselectFeeConfiguration: (id) =>
        set((state: FeeConfigurationState) => {
          state.selectedFeeConfigurations = state.selectedFeeConfigurations.filter((selectedId) => selectedId !== id)
        }),

      selectAllFeeConfigurations: () =>
        set((state: FeeConfigurationState) => {
          state.selectedFeeConfigurations = state.feeConfigurations.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: FeeConfigurationState) => {
          state.selectedFeeConfigurations = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: FeeConfigurationState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: FeeConfigurationState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: FeeConfigurationState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: FeeConfigurationState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: FeeConfigurationState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: FeeConfigurationState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: FeeConfigurationState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: FeeConfigurationState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: FeeConfigurationState) => {
          state.selectedRows = rows
          state.selectedFeeConfigurations = rows
        }),

      reset: () =>
        set((state: FeeConfigurationState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "feeConfiguration-store",
    },
  ),
)
