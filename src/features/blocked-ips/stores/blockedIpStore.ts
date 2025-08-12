import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchBlockedIpRequest, zSearchBlockedIpResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"
import { BlockedIpDto } from "@/shared"

// Types
type SearchBlockedIpRequest = z.infer<typeof zSearchBlockedIpRequest>
type SearchBlockedIpResponse = z.infer<typeof zSearchBlockedIpResponse>

export interface BlockedIpFilters extends Omit<SearchBlockedIpRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface BlockedIpState {
  blockedIps: SearchBlockedIpResponse[]
  blockedIp?: BlockedIpDto
  selectedBlockedIp: SearchBlockedIpResponse | null
  selectedBlockedIps: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: BlockedIpFilters
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

export interface BlockedIpActions {
  // Data Actions
  setBlockedIps: (blockedIps: SearchBlockedIpResponse[]) => void
  setBlockedIp: (blockedIp: BlockedIpDto) => void
  addItem: (item: SearchBlockedIpResponse) => void
  updateItem: (id: string, item: Partial<SearchBlockedIpResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchBlockedIpResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<BlockedIpFilters>) => void
  clearFilters: () => void

  setSelectedBlockedIps: (ids: string[]) => void
  selectBlockedIp: (id: string) => void
  deselectBlockedIp: (id: string) => void
  selectAllBlockedIps: () => void
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

export type BlockedIpStore = BlockedIpState & BlockedIpActions

const initialState: BlockedIpState = {
  blockedIps: [],
  blockedIp: undefined,
  selectedBlockedIp: null,
  selectedBlockedIps: [],

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

export const useBlockedIpStore = create<BlockedIpStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setBlockedIps: (blockedIps) =>
        set((state: BlockedIpState) => {
          state.blockedIps = blockedIps
        }),

      setBlockedIp: (blockedIp) =>
        set((state: BlockedIpState) => {
          state.blockedIp = blockedIp
        }),

      addItem: (item) =>
        set((state: BlockedIpState) => {
          state.blockedIps.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: BlockedIpState) => {
          const index = state.blockedIps.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.blockedIps[index] = { ...state.blockedIps[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: BlockedIpState) => {
          state.blockedIps = state.blockedIps.filter((item) => item.id !== id)
          state.selectedBlockedIps = state.selectedBlockedIps.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: BlockedIpState) => {
          state.selectedBlockedIp = item
        }),

      setCurrentPage: (page) =>
        set((state: BlockedIpState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: BlockedIpState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: BlockedIpState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: BlockedIpState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: BlockedIpState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: BlockedIpState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedBlockedIps: (ids) =>
        set((state: BlockedIpState) => {
          state.selectedBlockedIps = ids
        }),

      selectBlockedIp: (id) =>
        set((state: BlockedIpState) => {
          if (!state.selectedBlockedIps.includes(id)) {
            state.selectedBlockedIps.push(id)
          }
        }),

      deselectBlockedIp: (id) =>
        set((state: BlockedIpState) => {
          state.selectedBlockedIps = state.selectedBlockedIps.filter((selectedId) => selectedId !== id)
        }),

      selectAllBlockedIps: () =>
        set((state: BlockedIpState) => {
          state.selectedBlockedIps = state.blockedIps.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: BlockedIpState) => {
          state.selectedBlockedIps = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: BlockedIpState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: BlockedIpState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: BlockedIpState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: BlockedIpState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: BlockedIpState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: BlockedIpState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: BlockedIpState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: BlockedIpState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: BlockedIpState) => {
          state.selectedRows = rows
          state.selectedBlockedIps = rows
        }),

      reset: () =>
        set((state: BlockedIpState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "blockedIp-store",
    },
  ),
)
