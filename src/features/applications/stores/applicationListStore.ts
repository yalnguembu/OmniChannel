import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import type { SearchApplicationRequest, SearchApplicationResponse } from "@/shared/api"

export interface ApplicationListState {
    // UI State
    filters: Partial<SearchApplicationRequest>
    viewMode: "grid" | "list"
    pageSize: number
    currentPage: number

    // Modal State
    showCreateModal: boolean
    showEditModal: boolean
    showDetailsModal: boolean
    showDeleteModal: boolean
    selectedItem: SearchApplicationResponse | null
}

export interface ApplicationListActions {
    setFilters: (filters: Partial<SearchApplicationRequest>) => void
    clearFilters: () => void
    setViewMode: (mode: "grid" | "list") => void
    setPageSize: (size: number) => void
    setCurrentPage: (page: number) => void

    // Modal Actions
    setShowCreateModal: (show: boolean) => void
    setShowEditModal: (show: boolean) => void
    setShowDetailsModal: (show: boolean) => void
    setShowDeleteModal: (show: boolean) => void
    setSelectedItem: (item: SearchApplicationResponse | null) => void

    reset: () => void
}

export type ApplicationListStore = ApplicationListState & ApplicationListActions

const initialState: ApplicationListState = {
    filters: {},
    viewMode: "grid",
    pageSize: 10,
    currentPage: 1,
    showCreateModal: false,
    showEditModal: false,
    showDetailsModal: false,
    showDeleteModal: false,
    selectedItem: null,
}

export const useApplicationListStore = create<ApplicationListStore>()(
    devtools(
        persist(
            immer((set) => ({
                ...initialState,

                setFilters: (filters) =>
                    set((state) => {
                        state.filters = { ...state.filters, ...filters }
                        state.currentPage = 1
                    }),

                clearFilters: () =>
                    set((state) => {
                        state.filters = {}
                        state.currentPage = 1
                    }),

                setViewMode: (mode) =>
                    set((state) => {
                        state.viewMode = mode
                    }),

                setPageSize: (size) =>
                    set((state) => {
                        state.pageSize = size
                        state.currentPage = 1
                    }),

                setCurrentPage: (page) =>
                    set((state) => {
                        state.currentPage = page
                    }),

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
                setSelectedItem: (item) =>
                    set((state) => {
                        state.selectedItem = item
                    }),

                reset: () => set(initialState),
            })),
            {
                name: "application-list-store",
                partialize: (state) => ({
                    filters: state.filters,
                    viewMode: state.viewMode,
                    pageSize: state.pageSize,
                }),
            }
        ),
        { name: "application-list-store" }
    )
)
