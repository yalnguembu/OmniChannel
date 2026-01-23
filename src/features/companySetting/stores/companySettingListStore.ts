import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { SortDirection } from "@/shared/enums/data-grid"
import { z } from "zod"
import { zSearchCompanySettingRequest } from "@/shared/api/zod.gen"
import { SearchCompanySettingResponse } from "@/shared/api/types.gen"

type SearchCompanySettingRequest = z.infer<typeof zSearchCompanySettingRequest>
export interface CompanySettingFilters extends Omit<SearchCompanySettingRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> { }

interface CompanySettingListState {
    viewMode: "grid" | "list"
    isFilterCollapsed: boolean

    selectedRows: string[]

    currentPage: number
    pageSize: number
    sortBy: string | null
    sortDirection: SortDirection | null
    filters: CompanySettingFilters

    showCreateModal: boolean
    showEditModal: boolean
    showDetailsModal: boolean
    showDeleteModal: boolean
    selectedItemId: string | null
}

interface CompanySettingListActions {
    setViewMode: (mode: "grid" | "list") => void
    toggleFilter: () => void

    setSelectedRows: (rows: string[]) => void
    clearSelection: () => void

    setCurrentPage: (page: number) => void
    setPageSize: (size: number) => void
    setSorting: (sortBy: string | null, direction: SortDirection | null) => void
    setFilters: (filters: Partial<CompanySettingFilters>) => void
    clearFilters: () => void
    reset: () => void

    setShowCreateModal: (show: boolean) => void
    setShowEditModal: (show: boolean) => void
    setShowDetailsModal: (show: boolean) => void
    setShowDeleteModal: (show: boolean) => void
    setSelectedItemId: (id: string | null) => void
}

const initialState: CompanySettingListState = {
    viewMode: "list",
    isFilterCollapsed: false,
    selectedRows: [],
    currentPage: 1,
    pageSize: 10,
    sortBy: "createdAt",
    sortDirection: SortDirection.DESC,
    filters: {},

    showCreateModal: false,
    showEditModal: false,
    showDetailsModal: false,
    showDeleteModal: false,
    selectedItemId: null,
}

export const useCompanySettingListStore = create<CompanySettingListState & CompanySettingListActions>()(
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

            setShowCreateModal: (show) =>
                set((state) => {
                    state.showCreateModal = show
                }),
            setShowEditModal: (show) =>
                set((state) => {
                    state.showEditModal = show
                }),
            setShowDetailsModal: (show) =>
                set((state) => {
                    state.showDetailsModal = show
                }),
            setShowDeleteModal: (show) =>
                set((state) => {
                    state.showDeleteModal = show
                }),
            setSelectedItemId: (id) =>
                set((state) => {
                    state.selectedItemId = id
                }),
        })),
        { name: "companySetting-list-store" }
    )
)
