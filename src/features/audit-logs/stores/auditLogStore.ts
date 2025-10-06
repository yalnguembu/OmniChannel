import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchAuditLogRequest, zSearchAuditLogResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchAuditLogRequest = z.infer<typeof zSearchAuditLogRequest>
type SearchAuditLogResponse = z.infer<typeof zSearchAuditLogResponse>

export interface AuditLogFilters extends Omit<SearchAuditLogRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface AuditLogState {
  auditLogs: SearchAuditLogResponse[]
  selectedAuditLog: SearchAuditLogResponse | null
  selectedAuditLogs: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: AuditLogFilters
  // You can add additional auditLog state properties here if needed
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

export interface AuditLogActions {
  // Data Actions
  setAuditLog: (auditLog: SearchAuditLogResponse[]) => void
  addItem: (item: SearchAuditLogResponse) => void
  updateItem: (id: string, item: Partial<SearchAuditLogResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchAuditLogResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<AuditLogFilters>) => void
  clearFilters: () => void

  setSelectedAuditLogs: (ids: string[]) => void
  selectAuditLog: (id: string) => void
  deselectAuditLog: (id: string) => void
  selectAllAuditLogs: () => void
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

export type AuditLogStore = AuditLogState & AuditLogActions

const initialState: AuditLogState = {
  auditLogs: [],
  selectedAuditLog: null,
  selectedAuditLogs: [],

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

export const useAuditLogStore = create<AuditLogStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setAuditLog: (auditLog) =>
        set((state: AuditLogState) => {
          state.auditLogs = auditLog
        }),

      addItem: (item) =>
        set((state: AuditLogState) => {
          state.auditLogs.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: AuditLogState) => {
          const index = state.auditLogs.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.auditLogs[index] = { ...state.auditLogs[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: AuditLogState) => {
          state.auditLogs = state.auditLogs.filter((item) => item.id !== id)
          state.selectedAuditLogs = state.selectedAuditLogs.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: AuditLogState) => {
          state.selectedAuditLog = item
        }),

      setCurrentPage: (page) =>
        set((state: AuditLogState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: AuditLogState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: AuditLogState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: AuditLogState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: AuditLogState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: AuditLogState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedAuditLogs: (ids) =>
        set((state: AuditLogState) => {
          state.selectedAuditLogs = ids
        }),

      selectAuditLog: (id) =>
        set((state: AuditLogState) => {
          if (!state.selectedAuditLogs.includes(id)) {
            state.selectedAuditLogs.push(id)
          }
        }),

      deselectAuditLog: (id) =>
        set((state: AuditLogState) => {
          state.selectedAuditLogs = state.selectedAuditLogs.filter((selectedId) => selectedId !== id)
        }),

      selectAllAuditLogs: () =>
        set((state: AuditLogState) => {
          state.selectedAuditLogs = state.auditLogs.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: AuditLogState) => {
          state.selectedAuditLogs = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: AuditLogState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: AuditLogState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: AuditLogState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: AuditLogState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: AuditLogState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: AuditLogState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: AuditLogState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: AuditLogState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: AuditLogState) => {
          state.selectedRows = rows
          state.selectedAuditLogs = rows
        }),

      reset: () =>
        set((state: AuditLogState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "auditLog-store",
    },
  ),
)
