import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchUserDeviceRequest, zSearchUserDeviceResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchUserDeviceRequest = z.infer<typeof zSearchUserDeviceRequest>
type SearchUserDeviceResponse = z.infer<typeof zSearchUserDeviceResponse>

export interface UserDeviceFilters extends Omit<SearchUserDeviceRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface UserDeviceState {
  userDevices: SearchUserDeviceResponse[]
  selectedUserDevice: SearchUserDeviceResponse | null
  selectedUserDevices: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: UserDeviceFilters
  // You can add additional userDevice state properties here if needed
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

export interface UserDeviceActions {
  // Data Actions
  setUserDevice: (userDevice: SearchUserDeviceResponse[]) => void
  addItem: (item: SearchUserDeviceResponse) => void
  updateItem: (id: string, item: Partial<SearchUserDeviceResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchUserDeviceResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<UserDeviceFilters>) => void
  clearFilters: () => void

  setSelectedUserDevices: (ids: string[]) => void
  selectUserDevice: (id: string) => void
  deselectUserDevice: (id: string) => void
  selectAllUserDevices: () => void
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

export type UserDeviceStore = UserDeviceState & UserDeviceActions

const initialState: UserDeviceState = {
  userDevices: [],
  selectedUserDevice: null,
  selectedUserDevices: [],

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

export const useUserDeviceStore = create<UserDeviceStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setUserDevice: (userDevice) =>
        set((state: UserDeviceState) => {
          state.userDevices = userDevice
        }),

      addItem: (item) =>
        set((state: UserDeviceState) => {
          state.userDevices.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: UserDeviceState) => {
          const index = state.userDevices.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.userDevices[index] = { ...state.userDevices[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: UserDeviceState) => {
          state.userDevices = state.userDevices.filter((item) => item.id !== id)
          state.selectedUserDevices = state.selectedUserDevices.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: UserDeviceState) => {
          state.selectedUserDevice = item
        }),

      setCurrentPage: (page) =>
        set((state: UserDeviceState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: UserDeviceState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: UserDeviceState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: UserDeviceState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: UserDeviceState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: UserDeviceState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedUserDevices: (ids) =>
        set((state: UserDeviceState) => {
          state.selectedUserDevices = ids
        }),

      selectUserDevice: (id) =>
        set((state: UserDeviceState) => {
          if (!state.selectedUserDevices.includes(id)) {
            state.selectedUserDevices.push(id)
          }
        }),

      deselectUserDevice: (id) =>
        set((state: UserDeviceState) => {
          state.selectedUserDevices = state.selectedUserDevices.filter((selectedId) => selectedId !== id)
        }),

      selectAllUserDevices: () =>
        set((state: UserDeviceState) => {
          state.selectedUserDevices = state.userDevices.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: UserDeviceState) => {
          state.selectedUserDevices = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: UserDeviceState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: UserDeviceState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: UserDeviceState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: UserDeviceState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: UserDeviceState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: UserDeviceState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: UserDeviceState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: UserDeviceState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: UserDeviceState) => {
          state.selectedRows = rows
          state.selectedUserDevices = rows
        }),

      reset: () =>
        set((state: UserDeviceState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "userDevice-store",
    },
  ),
)
