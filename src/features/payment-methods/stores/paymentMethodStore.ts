import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchPaymentMethodRequest, zSearchPaymentMethodResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchPaymentMethodRequest = z.infer<typeof zSearchPaymentMethodRequest>
type SearchPaymentMethodResponse = z.infer<typeof zSearchPaymentMethodResponse>

export interface PaymentMethodFilters extends Omit<SearchPaymentMethodRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface PaymentMethodState {
  paymentMethods: SearchPaymentMethodResponse[]
  selectedPaymentMethod: SearchPaymentMethodResponse | null
  selectedPaymentMethods: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: PaymentMethodFilters
  // You can add additional paymentMethod state properties here if needed
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

export interface PaymentMethodActions {
  // Data Actions
  setPaymentMethod: (paymentMethod: SearchPaymentMethodResponse[]) => void
  addItem: (item: SearchPaymentMethodResponse) => void
  updateItem: (id: string, item: Partial<SearchPaymentMethodResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchPaymentMethodResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<PaymentMethodFilters>) => void
  clearFilters: () => void

  setSelectedPaymentMethods: (ids: string[]) => void
  selectPaymentMethod: (id: string) => void
  deselectPaymentMethod: (id: string) => void
  selectAllPaymentMethods: () => void
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

export type PaymentMethodStore = PaymentMethodState & PaymentMethodActions

const initialState: PaymentMethodState = {
  paymentMethods: [],
  selectedPaymentMethod: null,
  selectedPaymentMethods: [],

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

export const usePaymentMethodStore = create<PaymentMethodStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setPaymentMethod: (paymentMethod) =>
        set((state: PaymentMethodState) => {
          state.paymentMethods = paymentMethod
        }),

      addItem: (item) =>
        set((state: PaymentMethodState) => {
          state.paymentMethods.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: PaymentMethodState) => {
          const index = state.paymentMethods.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.paymentMethods[index] = { ...state.paymentMethods[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: PaymentMethodState) => {
          state.paymentMethods = state.paymentMethods.filter((item) => item.id !== id)
          state.selectedPaymentMethods = state.selectedPaymentMethods.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: PaymentMethodState) => {
          state.selectedPaymentMethod = item
        }),

      setCurrentPage: (page) =>
        set((state: PaymentMethodState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: PaymentMethodState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: PaymentMethodState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: PaymentMethodState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: PaymentMethodState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: PaymentMethodState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedPaymentMethods: (ids) =>
        set((state: PaymentMethodState) => {
          state.selectedPaymentMethods = ids
        }),

      selectPaymentMethod: (id) =>
        set((state: PaymentMethodState) => {
          if (!state.selectedPaymentMethods.includes(id)) {
            state.selectedPaymentMethods.push(id)
          }
        }),

      deselectPaymentMethod: (id) =>
        set((state: PaymentMethodState) => {
          state.selectedPaymentMethods = state.selectedPaymentMethods.filter((selectedId) => selectedId !== id)
        }),

      selectAllPaymentMethods: () =>
        set((state: PaymentMethodState) => {
          state.selectedPaymentMethods = state.paymentMethods.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: PaymentMethodState) => {
          state.selectedPaymentMethods = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: PaymentMethodState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: PaymentMethodState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: PaymentMethodState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: PaymentMethodState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: PaymentMethodState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: PaymentMethodState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: PaymentMethodState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: PaymentMethodState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: PaymentMethodState) => {
          state.selectedRows = rows
          state.selectedPaymentMethods = rows
        }),

      reset: () =>
        set((state: PaymentMethodState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "paymentMethod-store",
    },
  ),
)
