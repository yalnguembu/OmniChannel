import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchWithdrawalMethodRequest, zSearchWithdrawalMethodResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchWithdrawalMethodRequest = z.infer<typeof zSearchWithdrawalMethodRequest>
type SearchWithdrawalMethodResponse = z.infer<typeof zSearchWithdrawalMethodResponse>

export interface WithdrawalMethodFilters extends Omit<SearchWithdrawalMethodRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface WithdrawalMethodState {
  withdrawalMethods: SearchWithdrawalMethodResponse[]
  selectedWithdrawalMethod: SearchWithdrawalMethodResponse | null
  selectedWithdrawalMethods: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: WithdrawalMethodFilters
  // You can add additional withdrawalMethod state properties here if needed
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

export interface WithdrawalMethodActions {
  // Data Actions
  setWithdrawalMethod: (withdrawalMethod: SearchWithdrawalMethodResponse[]) => void
  addItem: (item: SearchWithdrawalMethodResponse) => void
  updateItem: (id: string, item: Partial<SearchWithdrawalMethodResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchWithdrawalMethodResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<WithdrawalMethodFilters>) => void
  clearFilters: () => void

  setSelectedWithdrawalMethods: (ids: string[]) => void
  selectWithdrawalMethod: (id: string) => void
  deselectWithdrawalMethod: (id: string) => void
  selectAllWithdrawalMethods: () => void
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

export type WithdrawalMethodStore = WithdrawalMethodState & WithdrawalMethodActions

const initialState: WithdrawalMethodState = {
  withdrawalMethods: [],
  selectedWithdrawalMethod: null,
  selectedWithdrawalMethods: [],

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

export const useWithdrawalMethodStore = create<WithdrawalMethodStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setWithdrawalMethod: (withdrawalMethod) =>
        set((state: WithdrawalMethodState) => {
          state.withdrawalMethods = withdrawalMethod
        }),

      addItem: (item) =>
        set((state: WithdrawalMethodState) => {
          state.withdrawalMethods.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: WithdrawalMethodState) => {
          const index = state.withdrawalMethods.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.withdrawalMethods[index] = { ...state.withdrawalMethods[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: WithdrawalMethodState) => {
          state.withdrawalMethods = state.withdrawalMethods.filter((item) => item.id !== id)
          state.selectedWithdrawalMethods = state.selectedWithdrawalMethods.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: WithdrawalMethodState) => {
          state.selectedWithdrawalMethod = item
        }),

      setCurrentPage: (page) =>
        set((state: WithdrawalMethodState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: WithdrawalMethodState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: WithdrawalMethodState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: WithdrawalMethodState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: WithdrawalMethodState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: WithdrawalMethodState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedWithdrawalMethods: (ids) =>
        set((state: WithdrawalMethodState) => {
          state.selectedWithdrawalMethods = ids
        }),

      selectWithdrawalMethod: (id) =>
        set((state: WithdrawalMethodState) => {
          if (!state.selectedWithdrawalMethods.includes(id)) {
            state.selectedWithdrawalMethods.push(id)
          }
        }),

      deselectWithdrawalMethod: (id) =>
        set((state: WithdrawalMethodState) => {
          state.selectedWithdrawalMethods = state.selectedWithdrawalMethods.filter((selectedId) => selectedId !== id)
        }),

      selectAllWithdrawalMethods: () =>
        set((state: WithdrawalMethodState) => {
          state.selectedWithdrawalMethods = state.withdrawalMethods.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: WithdrawalMethodState) => {
          state.selectedWithdrawalMethods = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: WithdrawalMethodState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: WithdrawalMethodState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: WithdrawalMethodState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: WithdrawalMethodState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: WithdrawalMethodState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: WithdrawalMethodState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: WithdrawalMethodState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: WithdrawalMethodState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: WithdrawalMethodState) => {
          state.selectedRows = rows
          state.selectedWithdrawalMethods = rows
        }),

      reset: () =>
        set((state: WithdrawalMethodState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "withdrawalMethod-store",
    },
  ),
)
