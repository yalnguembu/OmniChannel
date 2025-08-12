import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { z } from "zod"
import { zSearchUserProfileRequest, zSearchUserProfileResponse } from "@/shared/api/zod.gen"
import { SortDirection } from "@/shared/enums/data-grid"

// Types
type SearchUserProfileRequest = z.infer<typeof zSearchUserProfileRequest>
type SearchUserProfileResponse = z.infer<typeof zSearchUserProfileResponse>

export interface UserProfileFilters extends Omit<SearchUserProfileRequest, "pageNumber" | "pageSize" | "sortBy" | "sortDirection"> {
  // Additional filter properties if needed
}

export interface UserProfileState {
  userProfiles: SearchUserProfileResponse[]
  selectedUserProfile: SearchUserProfileResponse | null
  selectedUserProfiles: string[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number

  sortBy: string | null
  sortDirection: SortDirection | null

  filters: UserProfileFilters
  // You can add additional userProfile state properties here if needed
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

export interface UserProfileActions {
  // Data Actions
  setUserProfile: (userProfile: SearchUserProfileResponse[]) => void
  addItem: (item: SearchUserProfileResponse) => void
  updateItem: (id: string, item: Partial<SearchUserProfileResponse>) => void
  removeItem: (id: string) => void
  setSelectedItem: (item: SearchUserProfileResponse | null) => void

  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setPaginationData: (total: number, totalPages: number) => void

  setSorting: (sortBy: string | null, direction: SortDirection | null) => void

  setFilters: (filters: Partial<UserProfileFilters>) => void
  clearFilters: () => void

  setSelectedUserProfiles: (ids: string[]) => void
  selectUserProfile: (id: string) => void
  deselectUserProfile: (id: string) => void
  selectAllUserProfiles: () => void
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

export type UserProfileStore = UserProfileState & UserProfileActions

const initialState: UserProfileState = {
  userProfiles: [],
  selectedUserProfile: null,
  selectedUserProfiles: [],

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

export const useUserProfileStore = create<UserProfileStore>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setUserProfile: (userProfile) =>
        set((state: UserProfileState) => {
          state.userProfiles = userProfile
        }),

      addItem: (item) =>
        set((state: UserProfileState) => {
          state.userProfiles.unshift(item)
          state.totalItems += 1
        }),

      updateItem: (id, updates) =>
        set((state: UserProfileState) => {
          const index = state.userProfiles.findIndex((item) => item.id === id)
          if (index !== -1) {
            state.userProfiles[index] = { ...state.userProfiles[index], ...updates }
          }
        }),

      removeItem: (id) =>
        set((state: UserProfileState) => {
          state.userProfiles = state.userProfiles.filter((item) => item.id !== id)
          state.selectedUserProfiles = state.selectedUserProfiles.filter((selectedId) => selectedId !== id)
          state.selectedRows = state.selectedRows.filter((selectedId) => selectedId !== id)
          state.totalItems -= 1
        }),

      setSelectedItem: (item) =>
        set((state: UserProfileState) => {
          state.selectedUserProfile = item
        }),

      setCurrentPage: (page) =>
        set((state: UserProfileState) => {
          state.currentPage = page
        }),

      setPageSize: (size) =>
        set((state: UserProfileState) => {
          state.pageSize = size
          state.currentPage = 1 // Reset to first page
        }),

      setPaginationData: (total, totalPages) =>
        set((state: UserProfileState) => {
          state.totalItems = total
          state.totalPages = totalPages
        }),

      setSorting: (sortBy, direction) =>
        set((state: UserProfileState) => {
          state.sortBy = sortBy
          state.sortDirection = direction
        }),

      setFilters: (newFilters) =>
        set((state: UserProfileState) => {
          state.filters = { ...state.filters, ...newFilters }
          state.currentPage = 1 // Reset to first page when filtering
        }),

      clearFilters: () =>
        set((state: UserProfileState) => {
          state.filters = {}
          state.currentPage = 1
        }),

      setSelectedUserProfiles: (ids) =>
        set((state: UserProfileState) => {
          state.selectedUserProfiles = ids
        }),

      selectUserProfile: (id) =>
        set((state: UserProfileState) => {
          if (!state.selectedUserProfiles.includes(id)) {
            state.selectedUserProfiles.push(id)
          }
        }),

      deselectUserProfile: (id) =>
        set((state: UserProfileState) => {
          state.selectedUserProfiles = state.selectedUserProfiles.filter((selectedId) => selectedId !== id)
        }),

      selectAllUserProfiles: () =>
        set((state: UserProfileState) => {
          state.selectedUserProfiles = state.userProfiles.map((item) => item.id).filter((id): id is string => Boolean(id))
        }),

      clearSelection: () =>
        set((state: UserProfileState) => {
          state.selectedUserProfiles = []
          state.selectedRows = []
        }),

      setLoading: (loading) =>
        set((state: UserProfileState) => {
          state.isLoading = loading
        }),

      setSearching: (searching) =>
        set((state: UserProfileState) => {
          state.isSearching = searching
        }),

      setCreating: (creating) =>
        set((state: UserProfileState) => {
          state.isCreating = creating
        }),

      setUpdating: (updating) =>
        set((state: UserProfileState) => {
          state.isUpdating = updating
        }),

      setDeleting: (deleting) =>
        set((state: UserProfileState) => {
          state.isDeleting = deleting
        }),

      setError: (error) =>
        set((state: UserProfileState) => {
          state.error = error
        }),

      setViewMode: (mode) =>
        set((state: UserProfileState) => {
          state.viewMode = mode
        }),

      toggleFilter: () =>
        set((state: UserProfileState) => {
          state.isFilterCollapsed = !state.isFilterCollapsed
        }),

      setSelectedRows: (rows) =>
        set((state: UserProfileState) => {
          state.selectedRows = rows
          state.selectedUserProfiles = rows
        }),

      reset: () =>
        set((state: UserProfileState) => {
          Object.assign(state, initialState)
        }),
    })),
    {
      name: "userProfile-store",
    },
  ),
)
