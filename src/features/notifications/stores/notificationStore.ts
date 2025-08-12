import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchNotificationRequest, zSearchNotificationResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchNotificationRequest = z.infer<typeof zSearchNotificationRequest>
type SearchNotificationResponse = z.infer<typeof zSearchNotificationResponse>

export interface NotificationFilters extends Omit<SearchNotificationRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface NotificationState {
  notifications: SearchNotificationResponse[]
  selectedNotification: SearchNotificationResponse | null
  selectedNotifications: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: NotificationFilters
  // You can add additional notification state properties here if needed
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

export interface NotificationActions {
  // Data Actions
  setNotification: (notification: SearchNotificationResponse[]) => void
  addItem: (item: SearchNotificationResponse) => void
  updateItem: (id: string, item: Partial<SearchNotificationResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchNotificationResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<NotificationFilters>) => void
  clearFilters: () => void

  setSelectedNotifications: (ids: string[]) => void
  selectNotification: (id: string) => void
  deselectNotification: (id: string) => void
  selectAllNotifications: () => void
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

export type NotificationStore = NotificationState & NotificationActions

const initialState: NotificationState = {
  notifications: [],
  selectedNotification: null,
  selectedNotifications: [],

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

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setNotification: (notification) =>
        set((state: NotificationState) => {
          state.notifications = notification
        }),

      addItem: (item) =>
        set((state: NotificationState) => {
          state.notifications.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: NotificationState) => {
          const index = state.notifications.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.notifications[index] = { ...state.notifications[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: NotificationState) => {
          state.notifications = state.notifications.filter((item) => item.id !== id)
          state.selectedNotifications = state.selectedNotifications.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: NotificationState) => {
          state.selectedNotification = item
        }),

      setCurrentPage: (page) =>
        set((state: NotificationState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: NotificationState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: NotificationState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: NotificationState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: NotificationState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: NotificationState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedNotifications: (ids) =>
        set((state: NotificationState) => {
          state.selectedNotifications = ids
        }),

      selectNotification: (id) =>
        set((state: NotificationState) => {
          if (!state.selectedNotifications.includes(id)) {
            state.selectedNotifications.push(id)
          }
        }),

      deselectNotification: (id) =>
        set((state: NotificationState) => {
          state.selectedNotifications = state.selectedNotifications.filter((selectedId) => selectedId !== id)
        }),

      selectAllNotifications: () =>
        set((state: NotificationState) => {
          state.selectedNotifications = state.notifications.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: NotificationState) => {
          state.selectedNotifications = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: NotificationState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: NotificationState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: NotificationState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: NotificationState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: NotificationState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: NotificationState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: NotificationState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: NotificationState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: NotificationState) => {
          state.selectedRows = rows
          state.selectedNotifications = rows
        }),

      reset: () =>
        set((state: NotificationState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "notification-store",
    },
  ),
)
