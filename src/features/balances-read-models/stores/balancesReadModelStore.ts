import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchBalancesReadModelRequest, zSearchBalancesReadModelResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchBalancesReadModelRequest = z.infer<typeof zSearchBalancesReadModelRequest>
type SearchBalancesReadModelResponse = z.infer<typeof zSearchBalancesReadModelResponse>

export interface BalancesReadModelFilters extends Omit<SearchBalancesReadModelRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface BalancesReadModelState {
  balancesReadModels: SearchBalancesReadModelResponse[]
  selectedBalancesReadModel: SearchBalancesReadModelResponse | null
  selectedBalancesReadModels: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: BalancesReadModelFilters
  // You can add additional balancesReadModel state properties here if needed
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

export interface BalancesReadModelActions {
  // Data Actions
  setBalancesReadModel: (balancesReadModel: SearchBalancesReadModelResponse[]) => void
  addItem: (item: SearchBalancesReadModelResponse) => void
  updateItem: (id: string, item: Partial<SearchBalancesReadModelResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchBalancesReadModelResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<BalancesReadModelFilters>) => void
  clearFilters: () => void

  setSelectedBalancesReadModels: (ids: string[]) => void
  selectBalancesReadModel: (id: string) => void
  deselectBalancesReadModel: (id: string) => void
  selectAllBalancesReadModels: () => void
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

export type BalancesReadModelStore = BalancesReadModelState & BalancesReadModelActions

const initialState: BalancesReadModelState = {
  balancesReadModels: [],
  selectedBalancesReadModel: null,
  selectedBalancesReadModels: [],

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

export const useBalancesReadModelStore = create<BalancesReadModelStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setBalancesReadModel: (balancesReadModel) =>
        set((state: BalancesReadModelState) => {
          state.balancesReadModels = balancesReadModel
        }),

      addItem: (item) =>
        set((state: BalancesReadModelState) => {
          state.balancesReadModels.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: BalancesReadModelState) => {
          const index = state.balancesReadModels.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.balancesReadModels[index] = { ...state.balancesReadModels[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: BalancesReadModelState) => {
          state.balancesReadModels = state.balancesReadModels.filter((item) => item.id !== id)
          state.selectedBalancesReadModels = state.selectedBalancesReadModels.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: BalancesReadModelState) => {
          state.selectedBalancesReadModel = item
        }),

      setCurrentPage: (page) =>
        set((state: BalancesReadModelState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: BalancesReadModelState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: BalancesReadModelState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: BalancesReadModelState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: BalancesReadModelState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: BalancesReadModelState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedBalancesReadModels: (ids) =>
        set((state: BalancesReadModelState) => {
          state.selectedBalancesReadModels = ids
        }),

      selectBalancesReadModel: (id) =>
        set((state: BalancesReadModelState) => {
          if (!state.selectedBalancesReadModels.includes(id)) {
            state.selectedBalancesReadModels.push(id)
          }
        }),

      deselectBalancesReadModel: (id) =>
        set((state: BalancesReadModelState) => {
          state.selectedBalancesReadModels = state.selectedBalancesReadModels.filter((selectedId) => selectedId !== id)
        }),

      selectAllBalancesReadModels: () =>
        set((state: BalancesReadModelState) => {
          state.selectedBalancesReadModels = state.balancesReadModels.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: BalancesReadModelState) => {
          state.selectedBalancesReadModels = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: BalancesReadModelState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: BalancesReadModelState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: BalancesReadModelState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: BalancesReadModelState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: BalancesReadModelState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: BalancesReadModelState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: BalancesReadModelState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: BalancesReadModelState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: BalancesReadModelState) => {
          state.selectedRows = rows
          state.selectedBalancesReadModels = rows
        }),

      reset: () =>
        set((state: BalancesReadModelState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "balancesReadModel-store",
    },
  ),
)
