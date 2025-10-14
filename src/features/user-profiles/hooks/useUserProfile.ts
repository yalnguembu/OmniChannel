import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useUserProfileStore } from "../stores/userProfileStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiUserProfileSearchMutation,
  getApiUserProfileDropdownOptions,
  postApiUserProfileMutation,
  putApiUserProfileMutation,
  deleteApiUserProfileByIdMutation,
  getApiUserProfileByIdOptions,
  getApiUserProfilePermissionsAllOptions,
  getApiUserProfilePermissionsByProfileIdOptions,
  putApiUserProfilePermissionsByProfileIdMutation,
} from "@/shared/api/@tanstack/react-query.gen"

export const userProfileQueryKeys = {
  all: ["userProfile"] as const,
  lists: () => [...userProfileQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...userProfileQueryKeys.lists(), { filters }] as const,
  details: () => [...userProfileQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...userProfileQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...userProfileQueryKeys.all, "dropdown", { params }] as const,
}

export const useUserProfile = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useUserProfileStore()

  const searchUserProfilesMutation = useMutation({
    ...postApiUserProfileSearchMutation({
      body: {
        pageNumber: store.currentPage,
        pageSize: store.pageSize,
        sortBy: store.sortBy,
        sortDirection: store.sortDirection,
        ids: store.filters.ids,
        searchTerm: store.filters.searchTerm,
        createdFrom: store.filters.createdFrom || "",
        createdTo: store.filters.createdTo || "",
      },
    }),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data.items) ? data.data.items : []
        store.setUserProfile(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("userProfile.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchUserProfiles = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchUserProfilesMutation.mutate({ body: searchParams })
  }

  const getUserProfileQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiUserProfileByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const getPermissionsByUserProfileId = (profileId: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiUserProfilePermissionsByProfileIdOptions({ path: { profileId } }),
      enabled: !!profileId,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          // store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const getAllUserProfilePermissions = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiUserProfilePermissionsAllOptions(),
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          // store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const getDropdownQuery = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiUserProfileDropdownOptions(),
      staleTime: 10 * 60 * 1000,
    })

  const assignPermissionToUserProfileByProfileIdMutation = useMutation({
    ...putApiUserProfilePermissionsByProfileIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("userProfile.messages.assign.success"))
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.lists() })
      searchUserProfiles()
    },
    onError: (error) => {
      const message = error.message || t("userProfile.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const createUserProfileMutation = useMutation({
    ...postApiUserProfileMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("userProfile.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.lists() })
      searchUserProfiles()
    },
    onError: (error) => {
      const message = error.message || t("userProfile.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateUserProfile = (data: any) => {
    createUserProfileMutation.mutate({ body: data })
  }

  const updateUserProfileMutation = useMutation({
    ...putApiUserProfileMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("userProfile.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("userProfile.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateUserProfile = (data: any) => {
    updateUserProfileMutation.mutate({ body: data })
  }

  const deleteUserProfileMutation = useMutation({
    ...deleteApiUserProfileByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("userProfile.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("userProfile.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteUserProfile = (id: string) => {
    deleteUserProfileMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiUserProfileByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("userProfile.bulk.deleteReason") },
          }),
        ),
      )
      return results
    },
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (results, variables) => {
      const successCount = results.filter((r) => r.status === "fulfilled").length
      const failureCount = results.filter((r) => r.status === "rejected").length
      if (successCount > 0) {
        toast.success(t("userProfile.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("userProfile.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("userProfile.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteUserProfile = (id: string) => {
    onDeleteUserProfile(id)
  }

  const search = () => {
    searchUserProfiles()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchUserProfiles()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchUserProfiles()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchUserProfiles()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchUserProfiles()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchUserProfiles()
  }
  const refreshData = () => {
    searchUserProfiles()
  }

  return {
    ...store,
    getPermissionsByUserProfileId,
    getAllUserProfilePermissions,
    searchMutation: searchUserProfilesMutation,
    createMutation: createUserProfileMutation,
    updateMutation: updateUserProfileMutation,
    deleteMutation: deleteUserProfileMutation,
    assignMutation: assignPermissionToUserProfileByProfileIdMutation,
    bulkDeleteMutation,
    getDropdownQuery,
    getUserProfileQuery,
    searchUserProfiles,
    onCreateUserProfile,
    onUpdateUserProfile,
    onDeleteUserProfile,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    deleteUserProfile,
    hasData: store.userProfiles.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchUserProfilesMutation.isPending || store.isLoading,
    isError: searchUserProfilesMutation.isError,
    error: searchUserProfilesMutation.error || store.error,
  }
}
