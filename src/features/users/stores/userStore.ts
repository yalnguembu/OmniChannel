import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchUserRequest, zSearchUserResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchUserRequest = z.infer<typeof zSearchUserRequest>
type SearchUserResponse = z.infer<typeof zSearchUserResponse>

export interface UserFilters extends Omit<SearchUserRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface UserState {
  users: SearchUserResponse[]
  selectedUser: SearchUserResponse | null
  selectedUsers: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: UserFilters
  // You can add additional user state properties here if needed
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

export interface UserActions {
  // Data Actions
  setUser: (user: SearchUserResponse[]) => void
  addItem: (item: SearchUserResponse) => void
  updateItem: (id: string, item: Partial<SearchUserResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchUserResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<UserFilters>) => void
  clearFilters: () => void

  setSelectedUsers: (ids: string[]) => void
  selectUser: (id: string) => void
  deselectUser: (id: string) => void
  selectAllUsers: () => void
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

export type UserStore = UserState & UserActions

const initialState: UserState = {
  users: [],
  selectedUser: null,
  selectedUsers: [],

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

export const useUserStore = create<UserStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setUser: (user) =>
        set((state: UserState) => {
          state.users = user
        }),

      addItem: (item) =>
        set((state: UserState) => {
          state.users.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: UserState) => {
          const index = state.users.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.users[index] = { ...state.users[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: UserState) => {
          state.users = state.users.filter((item) => item.id !== id)
          state.selectedUsers = state.selectedUsers.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: UserState) => {
          state.selectedUser = item
        }),

      setCurrentPage: (page) =>
        set((state: UserState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: UserState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: UserState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: UserState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: UserState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: UserState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedUsers: (ids) =>
        set((state: UserState) => {
          state.selectedUsers = ids
        }),

      selectUser: (id) =>
        set((state: UserState) => {
          if (!state.selectedUsers.includes(id)) {
            state.selectedUsers.push(id)
          }
        }),

      deselectUser: (id) =>
        set((state: UserState) => {
          state.selectedUsers = state.selectedUsers.filter((selectedId) => selectedId !== id)
        }),

      selectAllUsers: () =>
        set((state: UserState) => {
          state.selectedUsers = state.users.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: UserState) => {
          state.selectedUsers = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: UserState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: UserState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: UserState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: UserState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: UserState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: UserState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: UserState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: UserState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: UserState) => {
          state.selectedRows = rows
          state.selectedUsers = rows
        }),

      reset: () =>
        set((state: UserState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "user-store",
    },
  ),
)
