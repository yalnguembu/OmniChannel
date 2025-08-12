import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useUserStore } from "../stores/userStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiUserSearchMutation,
  getApiUserDropdownOptions,
  postApiUserCompanyUsersMutation,
  putApiUserMutation,
  deleteApiUserByIdMutation,
  getApiUserByIdOptions,
  postApiUserSystemUsersMutation,
} from "@/shared/api/@tanstack/react-query.gen"

export const userQueryKeys = {
  all: ["user"] as const,
  lists: () => [...userQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...userQueryKeys.lists(), { filters }] as const,
  details: () => [...userQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...userQueryKeys.all, "dropdown", { params }] as const,
}

export const useUser = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useUserStore()

  const searchUsersMutation = useMutation({
    ...postApiUserSearchMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data) ? data.data : []
        store.setUser(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("users.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchUsers = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchUsersMutation.mutate({ body: searchParams })
  }

  const getUserQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiUserByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const dropdownQuery = useQuery({
    ...getApiUserDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createSystemUserMutation = useMutation({
    ...postApiUserSystemUsersMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("users.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
      searchUsers()
    },
    onError: (error) => {
      const message = error.message || t("users.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateSystemUser = (data: any) => {
    createSystemUserMutation.mutate({
      body: {
        ...data,
        forcePasswordChange: true,
      },
    })
  }

  const createCompanyUserMutation = useMutation({
    ...postApiUserCompanyUsersMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("users.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
      searchUsers()
    },
    onError: (error) => {
      const message = error.message || t("users.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateCompanyUser = (data: any) => {
    createCompanyUserMutation.mutate({
      body: {
        ...data,
        forcePasswordChange: true,
      },
    })
  }

  const updateUserMutation = useMutation({
    ...putApiUserMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("users.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("users.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateUser = (data: any) => {
    updateUserMutation.mutate({ body: data })
  }

  const deleteUserMutation = useMutation({
    ...deleteApiUserByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("users.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("users.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteUser = (id: string) => {
    deleteUserMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiUserByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("users.bulk.deleteReason") },
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
        toast.success(t("users.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("users.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("users.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteUser = (id: string) => {
    onDeleteUser(id)
  }

  const search = () => {
    searchUsers()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchUsers()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchUsers()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchUsers()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchUsers()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchUsers()
  }
  const refreshData = () => {
    searchUsers()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchUsersMutation,
    createSystemMutation: createSystemUserMutation,
    createCompanyMutation: createCompanyUserMutation,
    updateMutation: updateUserMutation,
    deleteMutation: deleteUserMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getUserQuery,
    searchUsers,
    onCreateSystemUser: onCreateSystemUser,
    onCreateCompanyUser: onCreateCompanyUser,
    onUpdateUser,
    onDeleteUser,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteUser,
    hasData: store.users.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchUsersMutation.isPending || store.isLoading,
    isError: searchUsersMutation.isError,
    error: searchUsersMutation.error || store.error,
  }
}
