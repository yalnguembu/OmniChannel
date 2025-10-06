import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchWebhookRequest, zSearchWebhookResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchWebhookRequest = z.infer<typeof zSearchWebhookRequest>
type SearchWebhookResponse = z.infer<typeof zSearchWebhookResponse>

export interface WebhookFilters extends Omit<SearchWebhookRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface WebhookState {
  webhooks: SearchWebhookResponse[]
  selectedWebhook: SearchWebhookResponse | null
  selectedWebhooks: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: WebhookFilters
  // You can add additional webhook state properties here if needed
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

export interface WebhookActions {
  // Data Actions
  setWebhook: (webhook: SearchWebhookResponse[]) => void
  addItem: (item: SearchWebhookResponse) => void
  updateItem: (id: string, item: Partial<SearchWebhookResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchWebhookResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<WebhookFilters>) => void
  clearFilters: () => void

  setSelectedWebhooks: (ids: string[]) => void
  selectWebhook: (id: string) => void
  deselectWebhook: (id: string) => void
  selectAllWebhooks: () => void
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

export type WebhookStore = WebhookState & WebhookActions

const initialState: WebhookState = {
  webhooks: [],
  selectedWebhook: null,
  selectedWebhooks: [],

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

export const useWebhookStore = create<WebhookStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setWebhook: (webhook) =>
        set((state: WebhookState) => {
          state.webhooks = webhook
        }),

      addItem: (item) =>
        set((state: WebhookState) => {
          state.webhooks.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: WebhookState) => {
          const index = state.webhooks.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.webhooks[index] = { ...state.webhooks[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: WebhookState) => {
          state.webhooks = state.webhooks.filter((item) => item.id !== id)
          state.selectedWebhooks = state.selectedWebhooks.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: WebhookState) => {
          state.selectedWebhook = item
        }),

      setCurrentPage: (page) =>
        set((state: WebhookState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: WebhookState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: WebhookState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: WebhookState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: WebhookState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: WebhookState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedWebhooks: (ids) =>
        set((state: WebhookState) => {
          state.selectedWebhooks = ids
        }),

      selectWebhook: (id) =>
        set((state: WebhookState) => {
          if (!state.selectedWebhooks.includes(id)) {
            state.selectedWebhooks.push(id)
          }
        }),

      deselectWebhook: (id) =>
        set((state: WebhookState) => {
          state.selectedWebhooks = state.selectedWebhooks.filter((selectedId) => selectedId !== id)
        }),

      selectAllWebhooks: () =>
        set((state: WebhookState) => {
          state.selectedWebhooks = state.webhooks.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: WebhookState) => {
          state.selectedWebhooks = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: WebhookState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: WebhookState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: WebhookState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: WebhookState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: WebhookState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: WebhookState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: WebhookState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: WebhookState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: WebhookState) => {
          state.selectedRows = rows
          state.selectedWebhooks = rows
        }),

      reset: () =>
        set((state: WebhookState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "webhook-store",
    },
  ),
)
