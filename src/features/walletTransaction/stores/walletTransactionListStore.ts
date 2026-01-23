import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { SortDirection } from "@/shared/enums/data-grid"
import { z } from "zod"
import { zSearchWalletTransactionRequest } from "@/shared/api/zod.gen"
import { SearchWalletTransactionResponse } from "@/shared/api/types.gen"

type SearchWalletTransactionRequest = z.infer<typeof zSearchWalletTransactionRequest>
export interface WalletTransactionFilters extends Omit<SearchWalletTransactionRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> { }

interface WalletTransactionListState {
    viewMode: "grid" | "list"
    isFilterCollapsed: boolean

    selectedRows: string[]

    currentPage: number
    pageSize: number
    sortBy: string | null
    sortDirection: SortDirection | null
    filters: WalletTransactionFilters

}

interface WalletTransactionListActions {
    setViewMode: (mode: "grid" | "list") => void
    toggleFilter: () => void

    setSelectedRows: (rows: string[]) => void
    clearSelection: () => void

    setCurrentPage: (page: number) => void
    setPageSize: (size: number) => void
    setSorting: (sortBy: string | null, direction: SortDirection | null) => void
    setFilters: (filters: Partial<WalletTransactionFilters>) => void
    clearFilters: () => void
    reset: () => void

}

const initialState: WalletTransactionListState = {
    viewMode: "list",
    isFilterCollapsed: false,
    selectedRows: [],
    currentPage: 1,
    pageSize: 10,
    sortBy: "createdAt",
    sortDirection: SortDirection.DESC,
    filters: {},

}

export const useWalletTransactionListStore = create<WalletTransactionListState & WalletTransactionListActions>()(
    devtools(
        immer((set) => ({
            ...initialState,

            setViewMode: (mode) =>
                set((state) => {
                    state.viewMode = mode
                }),
            toggleFilter: () =>
                set((state) => {
                    state.isFilterCollapsed = !state.isFilterCollapsed
                }),

            setSelectedRows: (rows) =>
                set((state) => {
                    state.selectedRows = rows
                }),
            clearSelection: () =>
                set((state) => {
                    state.selectedRows = []
                }),

            setCurrentPage: (page) =>
                set((state) => {
                    state.currentPage = page
                }),
            setPageSize: (size) =>
                set((state) => {
                    state.pageSize = size
                    state.currentPage = 1
                }),
            setSorting: (sortBy, direction) =>
                set((state) => {
                    state.sortBy = sortBy
                    state.sortDirection = direction
                }),
            setFilters: (newFilters) =>
                set((state) => {
                    state.filters = { ...state.filters, ...newFilters }
                    state.currentPage = 1
                }),
            clearFilters: () =>
                set((state) => {
                    state.filters = {}
                    state.currentPage = 1
                }),
            reset: () => set(initialState),

        })),
        { name: "walletTransaction-list-store" }
    )
)
