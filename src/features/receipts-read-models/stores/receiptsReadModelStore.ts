import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchReceiptsReadModelRequest, zSearchReceiptsReadModelResponse } from "@/shared/api/zod.gen"
import { endOfDay, startOfDay } from "@/shared/lib/date"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchReceiptsReadModelRequest = z.infer<typeof zSearchReceiptsReadModelRequest>
type SearchReceiptsReadModelResponse = z.infer<typeof zSearchReceiptsReadModelResponse>

export interface ReceiptsReadModelFilters extends Omit<SearchReceiptsReadModelRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface ReceiptsReadModelState {
  receiptsReadModels: SearchReceiptsReadModelResponse[]
  selectedReceiptsReadModel: SearchReceiptsReadModelResponse | null
  selectedReceiptsReadModels: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: ReceiptsReadModelFilters
  // You can add additional receiptsReadModel state properties here if needed
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

export interface ReceiptsReadModelActions {
  // Data Actions
  setReceiptsReadModel: (receiptsReadModel: SearchReceiptsReadModelResponse[]) => void
  addItem: (item: SearchReceiptsReadModelResponse) => void
  updateItem: (id: string, item: Partial<SearchReceiptsReadModelResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchReceiptsReadModelResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<ReceiptsReadModelFilters>) => void
  clearFilters: () => void

  setSelectedReceiptsReadModels: (ids: string[]) => void
  selectReceiptsReadModel: (id: string) => void
  deselectReceiptsReadModel: (id: string) => void
  selectAllReceiptsReadModels: () => void
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
  // NEW: Get current state snapshot
  getStateSnapshot: () => ReceiptsReadModelState
}

export type ReceiptsReadModelStore = ReceiptsReadModelState & ReceiptsReadModelActions

const initialState: ReceiptsReadModelState = {
  receiptsReadModels: [],
  selectedReceiptsReadModel: null,
  selectedReceiptsReadModels: [],

  currentPage: 1,
  pageSize: 9999,
  totalItems: 0,
  totalPages: 0,

  sortBy: "createdAt",
  sortDirection: SortDirection.DESC,

  filters: {
    createdFrom: startOfDay(new Date()).toISOString(),
    createdTo: endOfDay(new Date()).toISOString(),
  },

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

export const useReceiptsReadModelStore = create<ReceiptsReadModelStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      setReceiptsReadModel: (receiptsReadModel) =>
        set((state: ReceiptsReadModelState) => {
          state.receiptsReadModels = receiptsReadModel
        }),

      addItem: (item) =>
        set((state: ReceiptsReadModelState) => {
          state.receiptsReadModels.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: ReceiptsReadModelState) => {
          const index = state.receiptsReadModels.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.receiptsReadModels[index] = { ...state.receiptsReadModels[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: ReceiptsReadModelState) => {
          state.receiptsReadModels = state.receiptsReadModels.filter((item) => item.id !== id)
          state.selectedReceiptsReadModels = state.selectedReceiptsReadModels.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: ReceiptsReadModelState) => {
          state.selectedReceiptsReadModel = item
        }),

      setCurrentPage: (page) =>
        set((state: ReceiptsReadModelState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: ReceiptsReadModelState) => {
          state.pageSize = size
        }),

      setPaginationData: (total, totalPages) =>
        set((state: ReceiptsReadModelState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: ReceiptsReadModelState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: ReceiptsReadModelState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: ReceiptsReadModelState) => {
          state.filters = {
            createdFrom: startOfDay(new Date()).toISOString(),
            createdTo: endOfDay(new Date()).toISOString(),
          }
          state.currentPage = 1
        }),

      setSelectedReceiptsReadModels: (ids) =>
        set((state: ReceiptsReadModelState) => {
          state.selectedReceiptsReadModels = ids
        }),

      selectReceiptsReadModel: (id) =>
        set((state: ReceiptsReadModelState) => {
          if (!state.selectedReceiptsReadModels.includes(id)) {
            state.selectedReceiptsReadModels.push(id)
          }
        }),

      deselectReceiptsReadModel: (id) =>
        set((state: ReceiptsReadModelState) => {
          state.selectedReceiptsReadModels = state.selectedReceiptsReadModels.filter((selectedId) => selectedId !== id)
        }),

      selectAllReceiptsReadModels: () =>
        set((state: ReceiptsReadModelState) => {
          state.selectedReceiptsReadModels = state.receiptsReadModels.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: ReceiptsReadModelState) => {
          state.selectedReceiptsReadModels = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: ReceiptsReadModelState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: ReceiptsReadModelState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: ReceiptsReadModelState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: ReceiptsReadModelState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: ReceiptsReadModelState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: ReceiptsReadModelState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: ReceiptsReadModelState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: ReceiptsReadModelState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: ReceiptsReadModelState) => {
          state.selectedRows = rows
          state.selectedReceiptsReadModels = rows
        }),

      reset: () =>
        set((state: ReceiptsReadModelState) => {
          Object.assign(state, initialState)
        }),

      // NEW: Method to get current state snapshot
      getStateSnapshot: () => {
        return get()
      },
    })),
    {
      name: "receiptsReadModel-store",
    },
  ),
)
