import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useFundTransfersReadModelStore } from "../stores/fundTransfersReadModelStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiFundTransfersReadModelSearchMutation,
  getApiFundTransfersReadModelDropdownOptions,
  postApiFundTransfersReadModelMutation,
  putApiFundTransfersReadModelMutation,
  deleteApiFundTransfersReadModelByIdMutation,
  getApiFundTransfersReadModelByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const fundTransfersReadModelQueryKeys = {
  all: ["fundTransfersReadModel"] as const,
  lists: () => [...fundTransfersReadModelQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...fundTransfersReadModelQueryKeys.lists(), { filters }] as const,
  details: () => [...fundTransfersReadModelQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...fundTransfersReadModelQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...fundTransfersReadModelQueryKeys.all, "dropdown", { params }] as const,
}

export const useFundTransfersReadModel = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useFundTransfersReadModelStore()

  const searchFundTransfersReadModelsMutation = useMutation({
    ...postApiFundTransfersReadModelSearchMutation({
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
        const items = Array.isArray(data.data) ? data.data : []
        store.setFundTransfersReadModel(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("fundTransfersReadModels.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchFundTransfersReadModels = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchFundTransfersReadModelsMutation.mutate({ body: searchParams })
  }

  const getFundTransfersReadModelQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiFundTransfersReadModelByIdOptions({ path: { id } }),
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
    ...getApiFundTransfersReadModelDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })
  const createFundTransfersReadModelMutation = useMutation({
    ...postApiFundTransfersReadModelMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("fundTransfersReadModels.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: fundTransfersReadModelQueryKeys.lists() })
      searchFundTransfersReadModels()
    },
    onError: (error) => {
      const message = error.message || t("fundTransfersReadModels.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateFundTransfersReadModel = (data: any) => {
    createFundTransfersReadModelMutation.mutate({ body: data })
  }

  const updateFundTransfersReadModelMutation = useMutation({
    ...putApiFundTransfersReadModelMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("fundTransfersReadModels.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: fundTransfersReadModelQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("fundTransfersReadModels.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateFundTransfersReadModel = (data: any) => {
    updateFundTransfersReadModelMutation.mutate({ body: data })
  }

  const deleteFundTransfersReadModelMutation = useMutation({
    ...deleteApiFundTransfersReadModelByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("fundTransfersReadModels.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: fundTransfersReadModelQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("fundTransfersReadModels.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteFundTransfersReadModel = (id: string) => {
    deleteFundTransfersReadModelMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiFundTransfersReadModelByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("fundTransfersReadModels.bulk.deleteReason") },
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
        toast.success(t("fundTransfersReadModels.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: fundTransfersReadModelQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("fundTransfersReadModels.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("fundTransfersReadModels.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteFundTransfersReadModel = (id: string) => {
    onDeleteFundTransfersReadModel(id)
  }

  const search = () => {
    searchFundTransfersReadModels()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchFundTransfersReadModels()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchFundTransfersReadModels()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchFundTransfersReadModels()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchFundTransfersReadModels()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchFundTransfersReadModels()
  }
  const refreshData = () => {
    searchFundTransfersReadModels()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchFundTransfersReadModelsMutation,
    createMutation: createFundTransfersReadModelMutation,
    updateMutation: updateFundTransfersReadModelMutation,
    deleteMutation: deleteFundTransfersReadModelMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getFundTransfersReadModelQuery,
    searchFundTransfersReadModels,
    onCreateFundTransfersReadModel,
    onUpdateFundTransfersReadModel,
    onDeleteFundTransfersReadModel,
    search,
    changePage,
    changePageSize,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteFundTransfersReadModel,
    hasData: store.fundTransfersReadModels.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchFundTransfersReadModelsMutation.isPending || store.isLoading,
    isError: searchFundTransfersReadModelsMutation.isError,
    error: searchFundTransfersReadModelsMutation.error || store.error,
  }
}
