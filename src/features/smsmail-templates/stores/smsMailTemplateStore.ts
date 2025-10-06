import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchSmsmailTemplateRequest, zSearchSmsmailTemplateResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchSmsmailTemplateRequest = z.infer<typeof zSearchSmsmailTemplateRequest>
type SearchSmsmailTemplateResponse = z.infer<typeof zSearchSmsmailTemplateResponse>

export interface SmsmailTemplateFilters extends Omit<SearchSmsmailTemplateRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface SmsmailTemplateState {
  smsmailTemplates: SearchSmsmailTemplateResponse[]
  selectedSmsmailTemplate: SearchSmsmailTemplateResponse | null
  selectedSmsmailTemplates: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: SmsmailTemplateFilters
  // You can add additional smsmailTemplate state properties here if needed
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

export interface SmsmailTemplateActions {
  // Data Actions
  setSmsmailTemplate: (smsmailTemplate: SearchSmsmailTemplateResponse[]) => void
  addItem: (item: SearchSmsmailTemplateResponse) => void
  updateItem: (id: string, item: Partial<SearchSmsmailTemplateResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchSmsmailTemplateResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<SmsmailTemplateFilters>) => void
  clearFilters: () => void

  setSelectedSmsmailTemplates: (ids: string[]) => void
  selectSmsmailTemplate: (id: string) => void
  deselectSmsmailTemplate: (id: string) => void
  selectAllSmsmailTemplates: () => void
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

export type SmsmailTemplateStore = SmsmailTemplateState & SmsmailTemplateActions

const initialState: SmsmailTemplateState = {
  smsmailTemplates: [],
  selectedSmsmailTemplate: null,
  selectedSmsmailTemplates: [],

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

export const useSmsmailTemplateStore = create<SmsmailTemplateStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setSmsmailTemplate: (smsmailTemplate) =>
        set((state: SmsmailTemplateState) => {
          state.smsmailTemplates = smsmailTemplate
        }),

      addItem: (item) =>
        set((state: SmsmailTemplateState) => {
          state.smsmailTemplates.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: SmsmailTemplateState) => {
          const index = state.smsmailTemplates.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.smsmailTemplates[index] = { ...state.smsmailTemplates[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: SmsmailTemplateState) => {
          state.smsmailTemplates = state.smsmailTemplates.filter((item) => item.id !== id)
          state.selectedSmsmailTemplates = state.selectedSmsmailTemplates.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: SmsmailTemplateState) => {
          state.selectedSmsmailTemplate = item
        }),

      setCurrentPage: (page) =>
        set((state: SmsmailTemplateState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: SmsmailTemplateState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: SmsmailTemplateState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: SmsmailTemplateState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: SmsmailTemplateState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: SmsmailTemplateState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedSmsmailTemplates: (ids) =>
        set((state: SmsmailTemplateState) => {
          state.selectedSmsmailTemplates = ids
        }),

      selectSmsmailTemplate: (id) =>
        set((state: SmsmailTemplateState) => {
          if (!state.selectedSmsmailTemplates.includes(id)) {
            state.selectedSmsmailTemplates.push(id)
          }
        }),

      deselectSmsmailTemplate: (id) =>
        set((state: SmsmailTemplateState) => {
          state.selectedSmsmailTemplates = state.selectedSmsmailTemplates.filter((selectedId) => selectedId !== id)
        }),

      selectAllSmsmailTemplates: () =>
        set((state: SmsmailTemplateState) => {
          state.selectedSmsmailTemplates = state.smsmailTemplates.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: SmsmailTemplateState) => {
          state.selectedSmsmailTemplates = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: SmsmailTemplateState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: SmsmailTemplateState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: SmsmailTemplateState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: SmsmailTemplateState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: SmsmailTemplateState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: SmsmailTemplateState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: SmsmailTemplateState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: SmsmailTemplateState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: SmsmailTemplateState) => {
          state.selectedRows = rows
          state.selectedSmsmailTemplates = rows
        }),

      reset: () =>
        set((state: SmsmailTemplateState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "smsmailTemplate-store",
    },
  ),
)
