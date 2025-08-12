import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchKycDocumentRequest, zSearchKycDocumentResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchKycDocumentRequest = z.infer<typeof zSearchKycDocumentRequest>
type SearchKycDocumentResponse = z.infer<typeof zSearchKycDocumentResponse>

export interface KycDocumentFilters extends Omit<SearchKycDocumentRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface KycDocumentState {
  kycDocuments: SearchKycDocumentResponse[]
  selectedKycDocument: SearchKycDocumentResponse | null
  selectedKycDocuments: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: KycDocumentFilters
  // You can add additional kycDocument state properties here if needed
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

export interface KycDocumentActions {
  // Data Actions
  setKycDocument: (kycDocument: SearchKycDocumentResponse[]) => void
  addItem: (item: SearchKycDocumentResponse) => void
  updateItem: (id: string, item: Partial<SearchKycDocumentResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchKycDocumentResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<KycDocumentFilters>) => void
  clearFilters: () => void

  setSelectedKycDocuments: (ids: string[]) => void
  selectKycDocument: (id: string) => void
  deselectKycDocument: (id: string) => void
  selectAllKycDocuments: () => void
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

export type KycDocumentStore = KycDocumentState & KycDocumentActions

const initialState: KycDocumentState = {
  kycDocuments: [],
  selectedKycDocument: null,
  selectedKycDocuments: [],

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

export const useKycDocumentStore = create<KycDocumentStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setKycDocument: (kycDocument) =>
        set((state: KycDocumentState) => {
          state.kycDocuments = kycDocument
        }),

      addItem: (item) =>
        set((state: KycDocumentState) => {
          state.kycDocuments.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: KycDocumentState) => {
          const index = state.kycDocuments.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.kycDocuments[index] = { ...state.kycDocuments[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: KycDocumentState) => {
          state.kycDocuments = state.kycDocuments.filter((item) => item.id !== id)
          state.selectedKycDocuments = state.selectedKycDocuments.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: KycDocumentState) => {
          state.selectedKycDocument = item
        }),

      setCurrentPage: (page) =>
        set((state: KycDocumentState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: KycDocumentState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: KycDocumentState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: KycDocumentState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: KycDocumentState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: KycDocumentState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedKycDocuments: (ids) =>
        set((state: KycDocumentState) => {
          state.selectedKycDocuments = ids
        }),

      selectKycDocument: (id) =>
        set((state: KycDocumentState) => {
          if (!state.selectedKycDocuments.includes(id)) {
            state.selectedKycDocuments.push(id)
          }
        }),

      deselectKycDocument: (id) =>
        set((state: KycDocumentState) => {
          state.selectedKycDocuments = state.selectedKycDocuments.filter((selectedId) => selectedId !== id)
        }),

      selectAllKycDocuments: () =>
        set((state: KycDocumentState) => {
          state.selectedKycDocuments = state.kycDocuments.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: KycDocumentState) => {
          state.selectedKycDocuments = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: KycDocumentState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: KycDocumentState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: KycDocumentState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: KycDocumentState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: KycDocumentState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: KycDocumentState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: KycDocumentState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: KycDocumentState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: KycDocumentState) => {
          state.selectedRows = rows
          state.selectedKycDocuments = rows
        }),

      reset: () =>
        set((state: KycDocumentState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "kycDocument-store",
    },
  ),
)
