import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useBalancesReadModelStore } from "../stores/balancesReadModelStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiBalancesReadModelSearchMutation,
  getApiBalancesReadModelDropdownOptions,
  postApiBalancesReadModelMutation,
  putApiBalancesReadModelMutation,
  deleteApiBalancesReadModelByIdMutation,
  getApiBalancesReadModelByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const balancesReadModelQueryKeys = {
  all: ["balancesReadModel"] as const,
  lists: () => [...balancesReadModelQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...balancesReadModelQueryKeys.lists(), { filters }] as const,
  details: () => [...balancesReadModelQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...balancesReadModelQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...balancesReadModelQueryKeys.all, "dropdown", { params }] as const,
}

export const useBalancesReadModel = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useBalancesReadModelStore()

  const searchBalancesReadModelsMutation = useMutation({
    ...postApiBalancesReadModelSearchMutation({
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
        store.setBalancesReadModel(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("balancesReadModels.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchBalancesReadModels = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchBalancesReadModelsMutation.mutate({ body: searchParams })
  }

  const getBalancesReadModelQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiBalancesReadModelByIdOptions({ path: { id } }),
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
    ...getApiBalancesReadModelDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createBalancesReadModelMutation = useMutation({
    ...postApiBalancesReadModelMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("balancesReadModels.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: balancesReadModelQueryKeys.lists() })
      searchBalancesReadModels()
    },
    onError: (error) => {
      const message = error.message || t("balancesReadModels.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateBalancesReadModel = (data: any) => {
    createBalancesReadModelMutation.mutate({ body: data })
  }

  const updateBalancesReadModelMutation = useMutation({
    ...putApiBalancesReadModelMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("balancesReadModels.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: balancesReadModelQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("balancesReadModels.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateBalancesReadModel = (data: any) => {
    updateBalancesReadModelMutation.mutate({ body: data })
  }

  const deleteBalancesReadModelMutation = useMutation({
    ...deleteApiBalancesReadModelByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("balancesReadModels.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: balancesReadModelQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("balancesReadModels.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteBalancesReadModel = (id: string) => {
    deleteBalancesReadModelMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiBalancesReadModelByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("balancesReadModels.bulk.deleteReason") },
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
        toast.success(t("balancesReadModels.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: balancesReadModelQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("balancesReadModels.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("balancesReadModels.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteBalancesReadModel = (id: string) => {
    onDeleteBalancesReadModel(id)
  }

  const search = () => {
    searchBalancesReadModels()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchBalancesReadModels()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchBalancesReadModels()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchBalancesReadModels()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchBalancesReadModels()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchBalancesReadModels()
  }
  const refreshData = () => {
    searchBalancesReadModels()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchBalancesReadModelsMutation,
    createMutation: createBalancesReadModelMutation,
    updateMutation: updateBalancesReadModelMutation,
    deleteMutation: deleteBalancesReadModelMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getBalancesReadModelQuery,
    searchBalancesReadModels,
    onCreateBalancesReadModel,
    onUpdateBalancesReadModel,
    onDeleteBalancesReadModel,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteBalancesReadModel,
    hasData: store.balancesReadModels.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchBalancesReadModelsMutation.isPending || store.isLoading,
    isError: searchBalancesReadModelsMutation.isError,
    error: searchBalancesReadModelsMutation.error || store.error,
  }
}
