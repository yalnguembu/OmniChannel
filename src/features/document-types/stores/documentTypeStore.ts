import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchDocumentsTypeRequest, zSearchDocumentsTypeResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchDocumentsTypeRequest = z.infer<typeof zSearchDocumentsTypeRequest>
type SearchDocumentsTypeResponse = z.infer<typeof zSearchDocumentsTypeResponse>

export interface DocumentsTypeFilters extends Omit<SearchDocumentsTypeRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface DocumentsTypeState {
  documentsTypes: SearchDocumentsTypeResponse[]
  selectedDocumentsType: SearchDocumentsTypeResponse | null
  selectedDocumentsTypes: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: DocumentsTypeFilters
  // You can add additional documentsType state properties here if needed
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

export interface DocumentsTypeActions {
  // Data Actions
  setDocumentsType: (documentsType: SearchDocumentsTypeResponse[]) => void
  addItem: (item: SearchDocumentsTypeResponse) => void
  updateItem: (id: string, item: Partial<SearchDocumentsTypeResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchDocumentsTypeResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<DocumentsTypeFilters>) => void
  clearFilters: () => void

  setSelectedDocumentsTypes: (ids: string[]) => void
  selectDocumentsType: (id: string) => void
  deselectDocumentsType: (id: string) => void
  selectAllDocumentsTypes: () => void
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

export type DocumentsTypeStore = DocumentsTypeState & DocumentsTypeActions

const initialState: DocumentsTypeState = {
  documentsTypes: [],
  selectedDocumentsType: null,
  selectedDocumentsTypes: [],

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

export const useDocumentTypeStore = create<DocumentsTypeStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setDocumentsType: (documentsType) =>
        set((state: DocumentsTypeState) => {
          state.documentsTypes = documentsType
        }),

      addItem: (item) =>
        set((state: DocumentsTypeState) => {
          state.documentsTypes.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: DocumentsTypeState) => {
          const index = state.documentsTypes.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.documentsTypes[index] = { ...state.documentsTypes[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: DocumentsTypeState) => {
          state.documentsTypes = state.documentsTypes.filter((item) => item.id !== id)
          state.selectedDocumentsTypes = state.selectedDocumentsTypes.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: DocumentsTypeState) => {
          state.selectedDocumentsType = item
        }),

      setCurrentPage: (page) =>
        set((state: DocumentsTypeState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: DocumentsTypeState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: DocumentsTypeState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: DocumentsTypeState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: DocumentsTypeState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: DocumentsTypeState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedDocumentsTypes: (ids) =>
        set((state: DocumentsTypeState) => {
          state.selectedDocumentsTypes = ids
        }),

      selectDocumentsType: (id) =>
        set((state: DocumentsTypeState) => {
          if (!state.selectedDocumentsTypes.includes(id)) {
            state.selectedDocumentsTypes.push(id)
          }
        }),

      deselectDocumentsType: (id) =>
        set((state: DocumentsTypeState) => {
          state.selectedDocumentsTypes = state.selectedDocumentsTypes.filter((selectedId) => selectedId !== id)
        }),

      selectAllDocumentsTypes: () =>
        set((state: DocumentsTypeState) => {
          state.selectedDocumentsTypes = state.documentsTypes.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: DocumentsTypeState) => {
          state.selectedDocumentsTypes = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: DocumentsTypeState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: DocumentsTypeState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: DocumentsTypeState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: DocumentsTypeState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: DocumentsTypeState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: DocumentsTypeState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: DocumentsTypeState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: DocumentsTypeState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: DocumentsTypeState) => {
          state.selectedRows = rows
          state.selectedDocumentsTypes = rows
        }),

      reset: () =>
        set((state: DocumentsTypeState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "documentsType-store",
    },
  ),
)
