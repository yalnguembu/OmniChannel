import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { SortDirection } from "@/shared/enums/data-grid"
import { z } from "zod"
import { zSearchClientSegmentRequest } from "@/shared/api/zod.gen"
import { SearchClientSegmentResponse } from "@/shared/api/types.gen"

type SearchClientSegmentRequest = z.infer<typeof zSearchClientSegmentRequest>
export interface ClientSegmentFilters extends Omit<SearchClientSegmentRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> { }

interface ClientSegmentListState {
    viewMode: "grid" | "list"
    isFilterCollapsed: boolean

    selectedRows: string[]

    currentPage: number
    pageSize: number
    sortBy: string | null
    sortDirection: SortDirection | null
    filters: ClientSegmentFilters

    showCreateModal: boolean
    showEditModal: boolean
    showDetailsModal: boolean
    showDeleteModal: boolean
    selectedItemId: string | null
}

interface ClientSegmentListActions {
    setViewMode: (mode: "grid" | "list") => void
    toggleFilter: () => void

    setSelectedRows: (rows: string[]) => void
    clearSelection: () => void

    setCurrentPage: (page: number) => void
    setPageSize: (size: number) => void
    setSorting: (sortBy: string | null, direction: SortDirection | null) => void
    setFilters: (filters: Partial<ClientSegmentFilters>) => void
    clearFilters: () => void
    reset: () => void

    setShowCreateModal: (show: boolean) => void
    setShowEditModal: (show: boolean) => void
    setShowDetailsModal: (show: boolean) => void
    setShowDeleteModal: (show: boolean) => void
    setSelectedItemId: (id: string | null) => void
}

const initialState: ClientSegmentListState = {
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

export const useClientSegmentListStore = create<ClientSegmentListState & ClientSegmentListActions>()(
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
        { name: "clientSegment-list-store" }
    )
)
