import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchCurrencyRequest, zSearchCurrencyResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchCurrencyRequest = z.infer<typeof zSearchCurrencyRequest>
type SearchCurrencyResponse = z.infer<typeof zSearchCurrencyResponse>

export interface CurrencyFilters extends Omit<SearchCurrencyRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface CurrencyState {
  currencys: SearchCurrencyResponse[]
  selectedCurrency: SearchCurrencyResponse | null
  selectedCurrencys: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: CurrencyFilters
  // You can add additional currency state properties here if needed
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

export interface CurrencyActions {
  // Data Actions
  setCurrency: (currency: SearchCurrencyResponse[]) => void
  addItem: (item: SearchCurrencyResponse) => void
  updateItem: (id: string, item: Partial<SearchCurrencyResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchCurrencyResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<CurrencyFilters>) => void
  clearFilters: () => void

  setSelectedCurrencys: (ids: string[]) => void
  selectCurrency: (id: string) => void
  deselectCurrency: (id: string) => void
  selectAllCurrencys: () => void
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

export type CurrencyStore = CurrencyState & CurrencyActions

const initialState: CurrencyState = {
  currencys: [],
  selectedCurrency: null,
  selectedCurrencys: [],

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

export const useCurrencyStore = create<CurrencyStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setCurrency: (currency) =>
        set((state: CurrencyState) => {
          state.currencys = currency
        }),

      addItem: (item) =>
        set((state: CurrencyState) => {
          state.currencys.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: CurrencyState) => {
          const index = state.currencys.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.currencys[index] = { ...state.currencys[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: CurrencyState) => {
          state.currencys = state.currencys.filter((item) => item.id !== id)
          state.selectedCurrencys = state.selectedCurrencys.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: CurrencyState) => {
          state.selectedCurrency = item
        }),

      setCurrentPage: (page) =>
        set((state: CurrencyState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: CurrencyState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: CurrencyState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: CurrencyState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: CurrencyState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: CurrencyState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedCurrencys: (ids) =>
        set((state: CurrencyState) => {
          state.selectedCurrencys = ids
        }),

      selectCurrency: (id) =>
        set((state: CurrencyState) => {
          if (!state.selectedCurrencys.includes(id)) {
            state.selectedCurrencys.push(id)
          }
        }),

      deselectCurrency: (id) =>
        set((state: CurrencyState) => {
          state.selectedCurrencys = state.selectedCurrencys.filter((selectedId) => selectedId !== id)
        }),

      selectAllCurrencys: () =>
        set((state: CurrencyState) => {
          state.selectedCurrencys = state.currencys.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: CurrencyState) => {
          state.selectedCurrencys = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: CurrencyState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: CurrencyState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: CurrencyState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: CurrencyState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: CurrencyState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: CurrencyState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: CurrencyState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: CurrencyState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: CurrencyState) => {
          state.selectedRows = rows
          state.selectedCurrencys = rows
        }),

      reset: () =>
        set((state: CurrencyState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "currency-store",
    },
  ),
)
