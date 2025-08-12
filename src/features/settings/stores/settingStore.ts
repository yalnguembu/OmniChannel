import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchSettingRequest, zSearchSettingResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchSettingRequest = z.infer<typeof zSearchSettingRequest>
type SearchSettingResponse = z.infer<typeof zSearchSettingResponse>

export interface SettingFilters extends Omit<SearchSettingRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface SettingState {
  settings: SearchSettingResponse[]
  selectedSetting: SearchSettingResponse | null
  selectedSettings: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: SettingFilters
  // You can add additional setting state properties here if needed
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

export interface SettingActions {
  // Data Actions
  setSetting: (setting: SearchSettingResponse[]) => void
  addItem: (item: SearchSettingResponse) => void
  updateItem: (id: string, item: Partial<SearchSettingResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchSettingResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<SettingFilters>) => void
  clearFilters: () => void

  setSelectedSettings: (ids: string[]) => void
  selectSetting: (id: string) => void
  deselectSetting: (id: string) => void
  selectAllSettings: () => void
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

export type SettingStore = SettingState & SettingActions

const initialState: SettingState = {
  settings: [],
  selectedSetting: null,
  selectedSettings: [],

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

export const useSettingStore = create<SettingStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setSetting: (setting) =>
        set((state: SettingState) => {
          state.settings = setting
        }),

      addItem: (item) =>
        set((state: SettingState) => {
          state.settings.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: SettingState) => {
          const index = state.settings.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.settings[index] = { ...state.settings[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: SettingState) => {
          state.settings = state.settings.filter((item) => item.id !== id)
          state.selectedSettings = state.selectedSettings.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: SettingState) => {
          state.selectedSetting = item
        }),

      setCurrentPage: (page) =>
        set((state: SettingState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: SettingState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: SettingState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: SettingState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: SettingState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: SettingState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedSettings: (ids) =>
        set((state: SettingState) => {
          state.selectedSettings = ids
        }),

      selectSetting: (id) =>
        set((state: SettingState) => {
          if (!state.selectedSettings.includes(id)) {
            state.selectedSettings.push(id)
          }
        }),

      deselectSetting: (id) =>
        set((state: SettingState) => {
          state.selectedSettings = state.selectedSettings.filter((selectedId) => selectedId !== id)
        }),

      selectAllSettings: () =>
        set((state: SettingState) => {
          state.selectedSettings = state.settings.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: SettingState) => {
          state.selectedSettings = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: SettingState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: SettingState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: SettingState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: SettingState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: SettingState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: SettingState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: SettingState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: SettingState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: SettingState) => {
          state.selectedRows = rows
          state.selectedSettings = rows
        }),

      reset: () =>
        set((state: SettingState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "setting-store",
    },
  ),
)
