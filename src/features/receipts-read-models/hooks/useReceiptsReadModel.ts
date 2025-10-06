import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useReceiptsReadModelStore } from "../stores/receiptsReadModelStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiReceiptsReadModelSearchMutation,
  getApiReceiptsReadModelDropdownOptions,
  deleteApiReceiptsReadModelByIdMutation,
  getApiReceiptsReadModelByIdOptions,
  getApiReceiptsReadModelGetAllStatusOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const receiptsReadModelQueryKeys = {
  all: ["receiptsReadModel"] as const,
  lists: () => [...receiptsReadModelQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...receiptsReadModelQueryKeys.lists(), { filters }] as const,
  details: () => [...receiptsReadModelQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...receiptsReadModelQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...receiptsReadModelQueryKeys.all, "dropdown", { params }] as const,
}

export const useReceiptsReadModel = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useReceiptsReadModelStore()

  const searchReceiptsReadModelsMutation = useMutation({
    ...postApiReceiptsReadModelSearchMutation({
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
        store.setReceiptsReadModel(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("receiptsReadModels.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchReceiptsReadModels = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchReceiptsReadModelsMutation.mutate({ body: searchParams })
  }

  const getReceiptsReadModelQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiReceiptsReadModelByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const getApiReceiptsReadModelGetAllStatus = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiReceiptsReadModelGetAllStatusOptions(),
      staleTime: 5 * 60 * 1000,
    })

  const dropdownQuery = useQuery({
    ...getApiReceiptsReadModelDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const deleteReceiptsReadModelMutation = useMutation({
    ...deleteApiReceiptsReadModelByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("receiptsReadModels.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: receiptsReadModelQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("receiptsReadModels.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteReceiptsReadModel = (id: string) => {
    deleteReceiptsReadModelMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiReceiptsReadModelByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("receiptsReadModels.bulk.deleteReason") },
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
        toast.success(t("receiptsReadModels.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: receiptsReadModelQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("receiptsReadModels.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("receiptsReadModels.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteReceiptsReadModel = (id: string) => {
    onDeleteReceiptsReadModel(id)
  }

  const search = () => {
    searchReceiptsReadModels()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchReceiptsReadModels()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchReceiptsReadModels()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchReceiptsReadModels()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchReceiptsReadModels()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchReceiptsReadModels()
  }
  const refreshData = () => {
    searchReceiptsReadModels()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchReceiptsReadModelsMutation,
    deleteMutation: deleteReceiptsReadModelMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getReceiptsReadModelQuery,
    searchReceiptsReadModels,
    onDeleteReceiptsReadModel,
    search,
    changePage,
    changePageSize,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteReceiptsReadModel,
    hasData: store.receiptsReadModels.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchReceiptsReadModelsMutation.isPending || store.isLoading,
    isError: searchReceiptsReadModelsMutation.isError,
    error: searchReceiptsReadModelsMutation.error || store.error,
    getApiReceiptsReadModelGetAllStatus,
  }
}
