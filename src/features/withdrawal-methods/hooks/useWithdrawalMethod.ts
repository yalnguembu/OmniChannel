import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useWithdrawalMethodStore } from "../stores/withdrawalMethodStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiWithdrawalMethodSearchMutation,
  getApiWithdrawalMethodDropdownOptions,
  postApiWithdrawalMethodMutation,
  putApiWithdrawalMethodMutation,
  deleteApiWithdrawalMethodByIdMutation,
  getApiWithdrawalMethodByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const withdrawalMethodQueryKeys = {
  all: ["withdrawalMethod"] as const,
  lists: () => [...withdrawalMethodQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...withdrawalMethodQueryKeys.lists(), { filters }] as const,
  details: () => [...withdrawalMethodQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...withdrawalMethodQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...withdrawalMethodQueryKeys.all, "dropdown", { params }] as const,
}

export const useWithdrawalMethod = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useWithdrawalMethodStore()

  const searchWithdrawalMethodsMutation = useMutation({
    ...postApiWithdrawalMethodSearchMutation({
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
        store.setWithdrawalMethod(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("withdrawalMethod.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchWithdrawalMethods = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchWithdrawalMethodsMutation.mutate({ body: searchParams })
  }

  const getWithdrawalMethodQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiWithdrawalMethodByIdOptions({ path: { id } }),
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
    ...getApiWithdrawalMethodDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createWithdrawalMethodMutation = useMutation({
    ...postApiWithdrawalMethodMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("withdrawalMethod.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: withdrawalMethodQueryKeys.lists() })
      searchWithdrawalMethods()
    },
    onError: (error) => {
      const message = error.message || t("withdrawalMethod.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateWithdrawalMethod = (data: any) => {
    createWithdrawalMethodMutation.mutate({ body: data })
  }

  const updateWithdrawalMethodMutation = useMutation({
    ...putApiWithdrawalMethodMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("withdrawalMethod.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: withdrawalMethodQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("withdrawalMethod.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateWithdrawalMethod = (data: any) => {
    updateWithdrawalMethodMutation.mutate({ body: data })
  }

  const deleteWithdrawalMethodMutation = useMutation({
    ...deleteApiWithdrawalMethodByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("withdrawalMethod.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: withdrawalMethodQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("withdrawalMethod.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteWithdrawalMethod = (id: string) => {
    deleteWithdrawalMethodMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiWithdrawalMethodByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("withdrawalMethod.bulk.deleteReason") },
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
        toast.success(t("withdrawalMethod.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: withdrawalMethodQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("withdrawalMethod.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("withdrawalMethod.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteWithdrawalMethod = (id: string) => {
    onDeleteWithdrawalMethod(id)
  }

  const search = () => {
    searchWithdrawalMethods()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchWithdrawalMethods()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchWithdrawalMethods()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchWithdrawalMethods()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchWithdrawalMethods()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchWithdrawalMethods()
  }
  const refreshData = () => {
    searchWithdrawalMethods()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchWithdrawalMethodsMutation,
    createMutation: createWithdrawalMethodMutation,
    updateMutation: updateWithdrawalMethodMutation,
    deleteMutation: deleteWithdrawalMethodMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getWithdrawalMethodQuery,
    searchWithdrawalMethods,
    onCreateWithdrawalMethod,
    onUpdateWithdrawalMethod,
    onDeleteWithdrawalMethod,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteWithdrawalMethod,
    hasData: store.withdrawalMethods.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchWithdrawalMethodsMutation.isPending || store.isLoading,
    isError: searchWithdrawalMethodsMutation.isError,
    error: searchWithdrawalMethodsMutation.error || store.error,
  }
}
