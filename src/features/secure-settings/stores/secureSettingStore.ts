import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchSecureSettingRequest, zSearchSecureSettingResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchSecureSettingRequest = z.infer<typeof zSearchSecureSettingRequest>
type SearchSecureSettingResponse = z.infer<typeof zSearchSecureSettingResponse>

export interface SecureSettingFilters extends Omit<SearchSecureSettingRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface SecureSettingState {
  secureSettings: SearchSecureSettingResponse[]
  selectedSecureSetting: SearchSecureSettingResponse | null
  selectedSecureSettings: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: SecureSettingFilters
  // You can add additional secureSetting state properties here if needed
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

export interface SecureSettingActions {
  // Data Actions
  setSecureSetting: (secureSetting: SearchSecureSettingResponse[]) => void
  addItem: (item: SearchSecureSettingResponse) => void
  updateItem: (id: string, item: Partial<SearchSecureSettingResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchSecureSettingResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<SecureSettingFilters>) => void
  clearFilters: () => void

  setSelectedSecureSettings: (ids: string[]) => void
  selectSecureSetting: (id: string) => void
  deselectSecureSetting: (id: string) => void
  selectAllSecureSettings: () => void
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

export type SecureSettingStore = SecureSettingState & SecureSettingActions

const initialState: SecureSettingState = {
  secureSettings: [],
  selectedSecureSetting: null,
  selectedSecureSettings: [],

  currentPage: 1,
  pageSize: 1000,
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

export const useSecureSettingStore = create<SecureSettingStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setSecureSetting: (secureSetting) =>
        set((state: SecureSettingState) => {
          state.secureSettings = secureSetting
        }),

      addItem: (item) =>
        set((state: SecureSettingState) => {
          state.secureSettings.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: SecureSettingState) => {
          const index = state.secureSettings.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.secureSettings[index] = { ...state.secureSettings[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: SecureSettingState) => {
          state.secureSettings = state.secureSettings.filter((item) => item.id !== id)
          state.selectedSecureSettings = state.selectedSecureSettings.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: SecureSettingState) => {
          state.selectedSecureSetting = item
        }),

      setCurrentPage: (page) =>
        set((state: SecureSettingState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: SecureSettingState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: SecureSettingState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: SecureSettingState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: SecureSettingState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: SecureSettingState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedSecureSettings: (ids) =>
        set((state: SecureSettingState) => {
          state.selectedSecureSettings = ids
        }),

      selectSecureSetting: (id) =>
        set((state: SecureSettingState) => {
          if (!state.selectedSecureSettings.includes(id)) {
            state.selectedSecureSettings.push(id)
          }
        }),

      deselectSecureSetting: (id) =>
        set((state: SecureSettingState) => {
          state.selectedSecureSettings = state.selectedSecureSettings.filter((selectedId) => selectedId !== id)
        }),

      selectAllSecureSettings: () =>
        set((state: SecureSettingState) => {
          state.selectedSecureSettings = state.secureSettings.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: SecureSettingState) => {
          state.selectedSecureSettings = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: SecureSettingState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: SecureSettingState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: SecureSettingState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: SecureSettingState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: SecureSettingState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: SecureSettingState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: SecureSettingState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: SecureSettingState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: SecureSettingState) => {
          state.selectedRows = rows
          state.selectedSecureSettings = rows
        }),

      reset: () =>
        set((state: SecureSettingState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "secureSetting-store",
    },
  ),
)
