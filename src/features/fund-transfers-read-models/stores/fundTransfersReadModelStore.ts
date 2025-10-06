import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchFundTransfersReadModelRequest, zSearchFundTransfersReadModelResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchFundTransfersReadModelRequest = z.infer<typeof zSearchFundTransfersReadModelRequest>
type SearchFundTransfersReadModelResponse = z.infer<typeof zSearchFundTransfersReadModelResponse>

export interface FundTransfersReadModelFilters extends Omit<SearchFundTransfersReadModelRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface FundTransfersReadModelState {
  fundTransfersReadModels: SearchFundTransfersReadModelResponse[]
  selectedFundTransfersReadModel: SearchFundTransfersReadModelResponse | null
  selectedFundTransfersReadModels: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: FundTransfersReadModelFilters
  // You can add additional fundTransfersReadModel state properties here if needed
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

export interface FundTransfersReadModelActions {
  // Data Actions
  setFundTransfersReadModel: (fundTransfersReadModel: SearchFundTransfersReadModelResponse[]) => void
  addItem: (item: SearchFundTransfersReadModelResponse) => void
  updateItem: (id: string, item: Partial<SearchFundTransfersReadModelResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchFundTransfersReadModelResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<FundTransfersReadModelFilters>) => void
  clearFilters: () => void

  setSelectedFundTransfersReadModels: (ids: string[]) => void
  selectFundTransfersReadModel: (id: string) => void
  deselectFundTransfersReadModel: (id: string) => void
  selectAllFundTransfersReadModels: () => void
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

export type FundTransfersReadModelStore = FundTransfersReadModelState & FundTransfersReadModelActions

const initialState: FundTransfersReadModelState = {
  fundTransfersReadModels: [],
  selectedFundTransfersReadModel: null,
  selectedFundTransfersReadModels: [],

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

export const useFundTransfersReadModelStore = create<FundTransfersReadModelStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setFundTransfersReadModel: (fundTransfersReadModel) =>
        set((state: FundTransfersReadModelState) => {
          state.fundTransfersReadModels = fundTransfersReadModel
        }),

      addItem: (item) =>
        set((state: FundTransfersReadModelState) => {
          state.fundTransfersReadModels.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: FundTransfersReadModelState) => {
          const index = state.fundTransfersReadModels.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.fundTransfersReadModels[index] = { ...state.fundTransfersReadModels[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: FundTransfersReadModelState) => {
          state.fundTransfersReadModels = state.fundTransfersReadModels.filter((item) => item.id !== id)
          state.selectedFundTransfersReadModels = state.selectedFundTransfersReadModels.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: FundTransfersReadModelState) => {
          state.selectedFundTransfersReadModel = item
        }),

      setCurrentPage: (page) =>
        set((state: FundTransfersReadModelState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: FundTransfersReadModelState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: FundTransfersReadModelState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: FundTransfersReadModelState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: FundTransfersReadModelState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: FundTransfersReadModelState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedFundTransfersReadModels: (ids) =>
        set((state: FundTransfersReadModelState) => {
          state.selectedFundTransfersReadModels = ids
        }),

      selectFundTransfersReadModel: (id) =>
        set((state: FundTransfersReadModelState) => {
          if (!state.selectedFundTransfersReadModels.includes(id)) {
            state.selectedFundTransfersReadModels.push(id)
          }
        }),

      deselectFundTransfersReadModel: (id) =>
        set((state: FundTransfersReadModelState) => {
          state.selectedFundTransfersReadModels = state.selectedFundTransfersReadModels.filter((selectedId) => selectedId !== id)
        }),

      selectAllFundTransfersReadModels: () =>
        set((state: FundTransfersReadModelState) => {
          state.selectedFundTransfersReadModels = state.fundTransfersReadModels.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: FundTransfersReadModelState) => {
          state.selectedFundTransfersReadModels = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: FundTransfersReadModelState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: FundTransfersReadModelState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: FundTransfersReadModelState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: FundTransfersReadModelState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: FundTransfersReadModelState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: FundTransfersReadModelState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: FundTransfersReadModelState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: FundTransfersReadModelState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: FundTransfersReadModelState) => {
          state.selectedRows = rows
          state.selectedFundTransfersReadModels = rows
        }),

      reset: () =>
        set((state: FundTransfersReadModelState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "fundTransfersReadModel-store",
    },
  ),
)
