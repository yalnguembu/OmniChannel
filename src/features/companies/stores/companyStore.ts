import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchCompanyRequest, zSearchCompanyResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

type SearchCompanyRequest = z.infer<typeof zSearchCompanyRequest>
type SearchCompanyResponse = z.infer<typeof zSearchCompanyResponse>

export interface CompanyFilters extends Omit<SearchCompanyRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {}

export interface CompanyState {
  companies: SearchCompanyResponse[]
  selectedCompany: SearchCompanyResponse | null
  selectedCompanys: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  sortBy: string | null
  sortDirection: SortDirection | null
  filters: CompanyFilters
  isLoading: boolean
  isSearching: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  viewMode: "grid" | "list"
  isFilterCollapsed: boolean
  selectedRows: string[]
}

export interface CompanyActions {
  setCompany: (company: SearchCompanyResponse[]) => void
  addItem: (item: SearchCompanyResponse) => void
  updateItem: (id: string, item: Partial<SearchCompanyResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchCompanyResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<CompanyFilters>) => void
  clearFilters: () => void

  setSelectedCompanys: (ids: string[]) => void
  selectCompany: (id: string) => void
  deselectCompany: (id: string) => void
  selectAllCompanys: () => void
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

export type CompanyStore = CompanyState & CompanyActions

const initialState: CompanyState = {
  companies: [],
  selectedCompany: null,
  selectedCompanys: [],

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

export const useCompanyStore = create<CompanyStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setCompany: (company) =>
        set((state: CompanyState) => {
          state.companies = company
        }),

      addItem: (item) =>
        set((state: CompanyState) => {
          state.companies.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: CompanyState) => {
          const index = state.companies.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.companies[index] = { ...state.companies[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: CompanyState) => {
          state.companies = state.companies.filter((item) => item.id !== id)
          state.selectedCompanys = state.selectedCompanys.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: CompanyState) => {
          state.selectedCompany = item
        }),

      setCurrentPage: (page) =>
        set((state: CompanyState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: CompanyState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: CompanyState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: CompanyState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: CompanyState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: CompanyState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedCompanys: (ids) =>
        set((state: CompanyState) => {
          state.selectedCompanys = ids
        }),

      selectCompany: (id) =>
        set((state: CompanyState) => {
          if (!state.selectedCompanys.includes(id)) {
            state.selectedCompanys.push(id)
          }
        }),

      deselectCompany: (id) =>
        set((state: CompanyState) => {
          state.selectedCompanys = state.selectedCompanys.filter((selectedId) => selectedId !== id)
        }),

      selectAllCompanys: () =>
        set((state: CompanyState) => {
          state.selectedCompanys = state.companies.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: CompanyState) => {
          state.selectedCompanys = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: CompanyState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: CompanyState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: CompanyState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: CompanyState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: CompanyState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: CompanyState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: CompanyState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: CompanyState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: CompanyState) => {
          state.selectedRows = rows
          state.selectedCompanys = rows
        }),

      reset: () =>
        set((state: CompanyState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "company-store",
    },
  ),
)
