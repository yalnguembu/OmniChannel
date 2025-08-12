import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchCountryRequest, zSearchCountryResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchCountryRequest = z.infer<typeof zSearchCountryRequest>
type SearchCountryResponse = z.infer<typeof zSearchCountryResponse>

export interface CountryFilters extends Omit<SearchCountryRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface CountryState {
  countrys: SearchCountryResponse[]
  selectedCountry: SearchCountryResponse | null
  selectedCountrys: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: CountryFilters
  // You can add additional country state properties here if needed
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

export interface CountryActions {
  // Data Actions
  setCountry: (country: SearchCountryResponse[]) => void
  addItem: (item: SearchCountryResponse) => void
  updateItem: (id: string, item: Partial<SearchCountryResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchCountryResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<CountryFilters>) => void
  clearFilters: () => void

  setSelectedCountrys: (ids: string[]) => void
  selectCountry: (id: string) => void
  deselectCountry: (id: string) => void
  selectAllCountrys: () => void
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

export type CountryStore = CountryState & CountryActions

const initialState: CountryState = {
  countrys: [],
  selectedCountry: null,
  selectedCountrys: [],

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

export const useCountryStore = create<CountryStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setCountry: (country) =>
        set((state: CountryState) => {
          state.countrys = country
        }),

      addItem: (item) =>
        set((state: CountryState) => {
          state.countrys.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: CountryState) => {
          const index = state.countrys.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.countrys[index] = { ...state.countrys[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: CountryState) => {
          state.countrys = state.countrys.filter((item) => item.id !== id)
          state.selectedCountrys = state.selectedCountrys.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: CountryState) => {
          state.selectedCountry = item
        }),

      setCurrentPage: (page) =>
        set((state: CountryState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: CountryState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: CountryState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: CountryState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: CountryState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: CountryState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedCountrys: (ids) =>
        set((state: CountryState) => {
          state.selectedCountrys = ids
        }),

      selectCountry: (id) =>
        set((state: CountryState) => {
          if (!state.selectedCountrys.includes(id)) {
            state.selectedCountrys.push(id)
          }
        }),

      deselectCountry: (id) =>
        set((state: CountryState) => {
          state.selectedCountrys = state.selectedCountrys.filter((selectedId) => selectedId !== id)
        }),

      selectAllCountrys: () =>
        set((state: CountryState) => {
          state.selectedCountrys = state.countrys.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: CountryState) => {
          state.selectedCountrys = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: CountryState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: CountryState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: CountryState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: CountryState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: CountryState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: CountryState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: CountryState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: CountryState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: CountryState) => {
          state.selectedRows = rows
          state.selectedCountrys = rows
        }),

      reset: () =>
        set((state: CountryState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "country-store",
    },
  ),
)
