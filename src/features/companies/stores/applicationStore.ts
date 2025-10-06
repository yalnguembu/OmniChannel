import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchApplicationRequest, zSearchApplicationResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchApplicationRequest = z.infer<typeof zSearchApplicationRequest>
type SearchApplicationResponse = z.infer<typeof zSearchApplicationResponse>

export interface ApplicationFilters extends Omit<SearchApplicationRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface ApplicationState {
  applications: SearchApplicationResponse[]
  selectedApplication: SearchApplicationResponse | null
  selectedApplications: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: ApplicationFilters
  // You can add additional application state properties here if needed
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

export interface ApplicationActions {
  // Data Actions
  setApplication: (application: SearchApplicationResponse[]) => void
  addItem: (item: SearchApplicationResponse) => void
  updateItem: (id: string, item: Partial<SearchApplicationResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchApplicationResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<ApplicationFilters>) => void
  clearFilters: () => void

  setSelectedApplications: (ids: string[]) => void
  selectApplication: (id: string) => void
  deselectApplication: (id: string) => void
  selectAllApplications: () => void
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

export type ApplicationStore = ApplicationState & ApplicationActions

const initialState: ApplicationState = {
  applications: [],
  selectedApplication: null,
  selectedApplications: [],

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

export const useApplicationStore = create<ApplicationStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setApplication: (application) =>
        set((state: ApplicationState) => {
          state.applications = application
        }),

      addItem: (item) =>
        set((state: ApplicationState) => {
          state.applications.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: ApplicationState) => {
          const index = state.applications.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.applications[index] = { ...state.applications[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: ApplicationState) => {
          state.applications = state.applications.filter((item) => item.id !== id)
          state.selectedApplications = state.selectedApplications.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: ApplicationState) => {
          state.selectedApplication = item
        }),

      setCurrentPage: (page) =>
        set((state: ApplicationState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: ApplicationState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: ApplicationState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: ApplicationState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: ApplicationState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: ApplicationState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedApplications: (ids) =>
        set((state: ApplicationState) => {
          state.selectedApplications = ids
        }),

      selectApplication: (id) =>
        set((state: ApplicationState) => {
          if (!state.selectedApplications.includes(id)) {
            state.selectedApplications.push(id)
          }
        }),

      deselectApplication: (id) =>
        set((state: ApplicationState) => {
          state.selectedApplications = state.selectedApplications.filter((selectedId) => selectedId !== id)
        }),

      selectAllApplications: () =>
        set((state: ApplicationState) => {
          state.selectedApplications = state.applications.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: ApplicationState) => {
          state.selectedApplications = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: ApplicationState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: ApplicationState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: ApplicationState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: ApplicationState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: ApplicationState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: ApplicationState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: ApplicationState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: ApplicationState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: ApplicationState) => {
          state.selectedRows = rows
          state.selectedApplications = rows
        }),

      reset: () =>
        set((state: ApplicationState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "application-store",
    },
  ),
)
