import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchWebhookLogRequest, zSearchWebhookLogResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchWebhookLogRequest = z.infer<typeof zSearchWebhookLogRequest>
type SearchWebhookLogResponse = z.infer<typeof zSearchWebhookLogResponse>

export interface WebhookLogFilters extends Omit<SearchWebhookLogRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface WebhookLogState {
  webhookLogs: SearchWebhookLogResponse[]
  selectedWebhookLog: SearchWebhookLogResponse | null
  selectedWebhookLogs: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: WebhookLogFilters
  // You can add additional webhookLog state properties here if needed
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

export interface WebhookLogActions {
  // Data Actions
  setWebhookLog: (webhookLog: SearchWebhookLogResponse[]) => void
  addItem: (item: SearchWebhookLogResponse) => void
  updateItem: (id: string, item: Partial<SearchWebhookLogResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchWebhookLogResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<WebhookLogFilters>) => void
  clearFilters: () => void

  setSelectedWebhookLogs: (ids: string[]) => void
  selectWebhookLog: (id: string) => void
  deselectWebhookLog: (id: string) => void
  selectAllWebhookLogs: () => void
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

export type WebhookLogStore = WebhookLogState & WebhookLogActions

const initialState: WebhookLogState = {
  webhookLogs: [],
  selectedWebhookLog: null,
  selectedWebhookLogs: [],

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

export const useWebhookLogStore = create<WebhookLogStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setWebhookLog: (webhookLog) =>
        set((state: WebhookLogState) => {
          state.webhookLogs = webhookLog
        }),

      addItem: (item) =>
        set((state: WebhookLogState) => {
          state.webhookLogs.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: WebhookLogState) => {
          const index = state.webhookLogs.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.webhookLogs[index] = { ...state.webhookLogs[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: WebhookLogState) => {
          state.webhookLogs = state.webhookLogs.filter((item) => item.id !== id)
          state.selectedWebhookLogs = state.selectedWebhookLogs.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: WebhookLogState) => {
          state.selectedWebhookLog = item
        }),

      setCurrentPage: (page) =>
        set((state: WebhookLogState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: WebhookLogState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: WebhookLogState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: WebhookLogState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: WebhookLogState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: WebhookLogState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedWebhookLogs: (ids) =>
        set((state: WebhookLogState) => {
          state.selectedWebhookLogs = ids
        }),

      selectWebhookLog: (id) =>
        set((state: WebhookLogState) => {
          if (!state.selectedWebhookLogs.includes(id)) {
            state.selectedWebhookLogs.push(id)
          }
        }),

      deselectWebhookLog: (id) =>
        set((state: WebhookLogState) => {
          state.selectedWebhookLogs = state.selectedWebhookLogs.filter((selectedId) => selectedId !== id)
        }),

      selectAllWebhookLogs: () =>
        set((state: WebhookLogState) => {
          state.selectedWebhookLogs = state.webhookLogs.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: WebhookLogState) => {
          state.selectedWebhookLogs = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: WebhookLogState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: WebhookLogState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: WebhookLogState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: WebhookLogState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: WebhookLogState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: WebhookLogState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: WebhookLogState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: WebhookLogState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: WebhookLogState) => {
          state.selectedRows = rows
          state.selectedWebhookLogs = rows
        }),

      reset: () =>
        set((state: WebhookLogState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "webhookLog-store",
    },
  ),
)
