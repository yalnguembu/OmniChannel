import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchWithdrawalsReadModelRequest, zSearchWithdrawalsReadModelResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchWithdrawalsReadModelRequest = z.infer<typeof zSearchWithdrawalsReadModelRequest>
type SearchWithdrawalsReadModelResponse = z.infer<typeof zSearchWithdrawalsReadModelResponse>

export interface WithdrawalsReadModelFilters extends Omit<SearchWithdrawalsReadModelRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface WithdrawalsReadModelState {
  withdrawalsReadModels: SearchWithdrawalsReadModelResponse[]
  selectedWithdrawalsReadModel: SearchWithdrawalsReadModelResponse | null
  selectedWithdrawalsReadModels: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: WithdrawalsReadModelFilters
  // You can add additional withdrawalsReadModel state properties here if needed
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

export interface WithdrawalsReadModelActions {
  // Data Actions
  setWithdrawalsReadModel: (withdrawalsReadModel: SearchWithdrawalsReadModelResponse[]) => void
  addItem: (item: SearchWithdrawalsReadModelResponse) => void
  updateItem: (id: string, item: Partial<SearchWithdrawalsReadModelResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchWithdrawalsReadModelResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<WithdrawalsReadModelFilters>) => void
  clearFilters: () => void

  setSelectedWithdrawalsReadModels: (ids: string[]) => void
  selectWithdrawalsReadModel: (id: string) => void
  deselectWithdrawalsReadModel: (id: string) => void
  selectAllWithdrawalsReadModels: () => void
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

export type WithdrawalsReadModelStore = WithdrawalsReadModelState & WithdrawalsReadModelActions

const initialState: WithdrawalsReadModelState = {
  withdrawalsReadModels: [],
  selectedWithdrawalsReadModel: null,
  selectedWithdrawalsReadModels: [],

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

export const useWithdrawalsReadModelStore = create<WithdrawalsReadModelStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setWithdrawalsReadModel: (withdrawalsReadModel) =>
        set((state: WithdrawalsReadModelState) => {
          state.withdrawalsReadModels = withdrawalsReadModel
        }),

      addItem: (item) =>
        set((state: WithdrawalsReadModelState) => {
          state.withdrawalsReadModels.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: WithdrawalsReadModelState) => {
          const index = state.withdrawalsReadModels.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.withdrawalsReadModels[index] = { ...state.withdrawalsReadModels[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: WithdrawalsReadModelState) => {
          state.withdrawalsReadModels = state.withdrawalsReadModels.filter((item) => item.id !== id)
          state.selectedWithdrawalsReadModels = state.selectedWithdrawalsReadModels.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: WithdrawalsReadModelState) => {
          state.selectedWithdrawalsReadModel = item
        }),

      setCurrentPage: (page) =>
        set((state: WithdrawalsReadModelState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: WithdrawalsReadModelState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: WithdrawalsReadModelState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: WithdrawalsReadModelState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: WithdrawalsReadModelState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: WithdrawalsReadModelState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedWithdrawalsReadModels: (ids) =>
        set((state: WithdrawalsReadModelState) => {
          state.selectedWithdrawalsReadModels = ids
        }),

      selectWithdrawalsReadModel: (id) =>
        set((state: WithdrawalsReadModelState) => {
          if (!state.selectedWithdrawalsReadModels.includes(id)) {
            state.selectedWithdrawalsReadModels.push(id)
          }
        }),

      deselectWithdrawalsReadModel: (id) =>
        set((state: WithdrawalsReadModelState) => {
          state.selectedWithdrawalsReadModels = state.selectedWithdrawalsReadModels.filter((selectedId) => selectedId !== id)
        }),

      selectAllWithdrawalsReadModels: () =>
        set((state: WithdrawalsReadModelState) => {
          state.selectedWithdrawalsReadModels = state.withdrawalsReadModels.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: WithdrawalsReadModelState) => {
          state.selectedWithdrawalsReadModels = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: WithdrawalsReadModelState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: WithdrawalsReadModelState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: WithdrawalsReadModelState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: WithdrawalsReadModelState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: WithdrawalsReadModelState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: WithdrawalsReadModelState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: WithdrawalsReadModelState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: WithdrawalsReadModelState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: WithdrawalsReadModelState) => {
          state.selectedRows = rows
          state.selectedWithdrawalsReadModels = rows
        }),

      reset: () =>
        set((state: WithdrawalsReadModelState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "withdrawalsReadModel-store",
    },
  ),
)
