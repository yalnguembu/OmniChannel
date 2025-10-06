import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchFrontEventLogRequest, zSearchFrontEventLogResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchFrontEventLogRequest = z.infer<typeof zSearchFrontEventLogRequest>
type SearchFrontEventLogResponse = z.infer<typeof zSearchFrontEventLogResponse>

export interface FrontEventLogFilters extends Omit<SearchFrontEventLogRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface FrontEventLogState {
  frontEventLogs: SearchFrontEventLogResponse[]
  selectedFrontEventLog: SearchFrontEventLogResponse | null
  selectedFrontEventLogs: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: FrontEventLogFilters
  // You can add additional frontEventLog state properties here if needed
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

export interface FrontEventLogActions {
  // Data Actions
  setFrontEventLog: (frontEventLog: SearchFrontEventLogResponse[]) => void
  addItem: (item: SearchFrontEventLogResponse) => void
  updateItem: (id: string, item: Partial<SearchFrontEventLogResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchFrontEventLogResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<FrontEventLogFilters>) => void
  clearFilters: () => void

  setSelectedFrontEventLogs: (ids: string[]) => void
  selectFrontEventLog: (id: string) => void
  deselectFrontEventLog: (id: string) => void
  selectAllFrontEventLogs: () => void
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

export type FrontEventLogStore = FrontEventLogState & FrontEventLogActions

const initialState: FrontEventLogState = {
  frontEventLogs: [],
  selectedFrontEventLog: null,
  selectedFrontEventLogs: [],

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

export const useFrontEventLogStore = create<FrontEventLogStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setFrontEventLog: (frontEventLog) =>
        set((state: FrontEventLogState) => {
          state.frontEventLogs = frontEventLog
        }),

      addItem: (item) =>
        set((state: FrontEventLogState) => {
          state.frontEventLogs.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: FrontEventLogState) => {
          const index = state.frontEventLogs.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.frontEventLogs[index] = { ...state.frontEventLogs[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: FrontEventLogState) => {
          state.frontEventLogs = state.frontEventLogs.filter((item) => item.id !== id)
          state.selectedFrontEventLogs = state.selectedFrontEventLogs.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: FrontEventLogState) => {
          state.selectedFrontEventLog = item
        }),

      setCurrentPage: (page) =>
        set((state: FrontEventLogState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: FrontEventLogState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: FrontEventLogState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: FrontEventLogState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: FrontEventLogState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: FrontEventLogState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedFrontEventLogs: (ids) =>
        set((state: FrontEventLogState) => {
          state.selectedFrontEventLogs = ids
        }),

      selectFrontEventLog: (id) =>
        set((state: FrontEventLogState) => {
          if (!state.selectedFrontEventLogs.includes(id)) {
            state.selectedFrontEventLogs.push(id)
          }
        }),

      deselectFrontEventLog: (id) =>
        set((state: FrontEventLogState) => {
          state.selectedFrontEventLogs = state.selectedFrontEventLogs.filter((selectedId) => selectedId !== id)
        }),

      selectAllFrontEventLogs: () =>
        set((state: FrontEventLogState) => {
          state.selectedFrontEventLogs = state.frontEventLogs.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: FrontEventLogState) => {
          state.selectedFrontEventLogs = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: FrontEventLogState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: FrontEventLogState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: FrontEventLogState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: FrontEventLogState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: FrontEventLogState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: FrontEventLogState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: FrontEventLogState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: FrontEventLogState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: FrontEventLogState) => {
          state.selectedRows = rows
          state.selectedFrontEventLogs = rows
        }),

      reset: () =>
        set((state: FrontEventLogState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "frontEventLog-store",
    },
  ),
)
