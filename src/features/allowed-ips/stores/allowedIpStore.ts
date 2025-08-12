import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchAllowedIpRequest, zSearchAllowedIpResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchAllowedIpRequest = z.infer<typeof zSearchAllowedIpRequest>
type SearchAllowedIpResponse = z.infer<typeof zSearchAllowedIpResponse>

export interface AllowedIpFilters extends Omit<SearchAllowedIpRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface AllowedIpState {
  allowedIps: SearchAllowedIpResponse[]
  selectedAllowedIp: SearchAllowedIpResponse | null
  selectedAllowedIps: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: AllowedIpFilters
  // You can add additional allowedIp state properties here if needed
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

export interface AllowedIpActions {
  // Data Actions
  setAllowedIp: (allowedIp: SearchAllowedIpResponse[]) => void
  addItem: (item: SearchAllowedIpResponse) => void
  updateItem: (id: string, item: Partial<SearchAllowedIpResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchAllowedIpResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<AllowedIpFilters>) => void
  clearFilters: () => void

  setSelectedAllowedIps: (ids: string[]) => void
  selectAllowedIp: (id: string) => void
  deselectAllowedIp: (id: string) => void
  selectAllAllowedIps: () => void
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

export type AllowedIpStore = AllowedIpState & AllowedIpActions

const initialState: AllowedIpState = {
  allowedIps: [],
  selectedAllowedIp: null,
  selectedAllowedIps: [],

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

export const useAllowedIpStore = create<AllowedIpStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setAllowedIp: (allowedIp) =>
        set((state: AllowedIpState) => {
          state.allowedIps = allowedIp
        }),

      addItem: (item) =>
        set((state: AllowedIpState) => {
          state.allowedIps.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: AllowedIpState) => {
          const index = state.allowedIps.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.allowedIps[index] = { ...state.allowedIps[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: AllowedIpState) => {
          state.allowedIps = state.allowedIps.filter((item) => item.id !== id)
          state.selectedAllowedIps = state.selectedAllowedIps.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: AllowedIpState) => {
          state.selectedAllowedIp = item
        }),

      setCurrentPage: (page) =>
        set((state: AllowedIpState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: AllowedIpState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: AllowedIpState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: AllowedIpState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: AllowedIpState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: AllowedIpState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedAllowedIps: (ids) =>
        set((state: AllowedIpState) => {
          state.selectedAllowedIps = ids
        }),

      selectAllowedIp: (id) =>
        set((state: AllowedIpState) => {
          if (!state.selectedAllowedIps.includes(id)) {
            state.selectedAllowedIps.push(id)
          }
        }),

      deselectAllowedIp: (id) =>
        set((state: AllowedIpState) => {
          state.selectedAllowedIps = state.selectedAllowedIps.filter((selectedId) => selectedId !== id)
        }),

      selectAllAllowedIps: () =>
        set((state: AllowedIpState) => {
          state.selectedAllowedIps = state.allowedIps.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: AllowedIpState) => {
          state.selectedAllowedIps = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: AllowedIpState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: AllowedIpState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: AllowedIpState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: AllowedIpState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: AllowedIpState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: AllowedIpState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: AllowedIpState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: AllowedIpState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: AllowedIpState) => {
          state.selectedRows = rows
          state.selectedAllowedIps = rows
        }),

      reset: () =>
        set((state: AllowedIpState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "allowedIp-store",
    },
  ),
)
