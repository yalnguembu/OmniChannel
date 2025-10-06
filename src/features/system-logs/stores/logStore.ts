import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchLogRequest, zSearchLogResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchLogRequest = z.infer<typeof zSearchLogRequest>
type SearchLogResponse = z.infer<typeof zSearchLogResponse>

export interface LogFilters extends Omit<SearchLogRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface LogState {
  logs: SearchLogResponse[]
  selectedLog: SearchLogResponse | null
  selectedLogs: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: LogFilters
  // You can add additional log state properties here if needed
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

export interface LogActions {
  // Data Actions
  setLog: (log: SearchLogResponse[]) => void
  addItem: (item: SearchLogResponse) => void
  updateItem: (id: string, item: Partial<SearchLogResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchLogResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<LogFilters>) => void
  clearFilters: () => void

  setSelectedLogs: (ids: string[]) => void
  selectLog: (id: string) => void
  deselectLog: (id: string) => void
  selectAllLogs: () => void
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

export type LogStore = LogState & LogActions

const initialState: LogState = {
  logs: [],
  selectedLog: null,
  selectedLogs: [],

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

export const useLogStore = create<LogStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setLog: (log) =>
        set((state: LogState) => {
          state.logs = log
        }),

      addItem: (item) =>
        set((state: LogState) => {
          state.logs.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: LogState) => {
          const index = state.logs.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.logs[index] = { ...state.logs[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: LogState) => {
          state.logs = state.logs.filter((item) => item.id !== id)
          state.selectedLogs = state.selectedLogs.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: LogState) => {
          state.selectedLog = item
        }),

      setCurrentPage: (page) =>
        set((state: LogState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: LogState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: LogState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: LogState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: LogState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: LogState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedLogs: (ids) =>
        set((state: LogState) => {
          state.selectedLogs = ids
        }),

      selectLog: (id) =>
        set((state: LogState) => {
          if (!state.selectedLogs.includes(id)) {
            state.selectedLogs.push(id)
          }
        }),

      deselectLog: (id) =>
        set((state: LogState) => {
          state.selectedLogs = state.selectedLogs.filter((selectedId) => selectedId !== id)
        }),

      selectAllLogs: () =>
        set((state: LogState) => {
          state.selectedLogs = state.logs.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: LogState) => {
          state.selectedLogs = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: LogState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: LogState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: LogState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: LogState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: LogState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: LogState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: LogState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: LogState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: LogState) => {
          state.selectedRows = rows
          state.selectedLogs = rows
        }),

      reset: () =>
        set((state: LogState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "log-store",
    },
  ),
)
