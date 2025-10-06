import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useFeeTypeStore } from "../stores/feeTypeStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiFeeTypeSearchMutation,
  getApiFeeTypeDropdownOptions,
  postApiFeeTypeMutation,
  putApiFeeTypeMutation,
  deleteApiFeeTypeByIdMutation,
  getApiFeeTypeByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const feeTypeQueryKeys = {
  all: ["feeType"] as const,
  lists: () => [...feeTypeQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...feeTypeQueryKeys.lists(), { filters }] as const,
  details: () => [...feeTypeQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...feeTypeQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...feeTypeQueryKeys.all, "dropdown", { params }] as const,
}

export const useFeeType = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useFeeTypeStore()

  const searchFeeTypesMutation = useMutation({
    ...postApiFeeTypeSearchMutation({
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
        store.setFeeType(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("feeTypes.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchFeeTypes = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchFeeTypesMutation.mutate({ body: searchParams })
  }

  const getFeeTypeQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiFeeTypeByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const dropdownQuery = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiFeeTypeDropdownOptions(),
      staleTime: 10 * 60 * 1000,
    })

  const createFeeTypeMutation = useMutation({
    ...postApiFeeTypeMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("feeTypes.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: feeTypeQueryKeys.lists() })
      searchFeeTypes()
    },
    onError: (error) => {
      const message = error.message || t("feeTypes.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateFeeType = (data: any) => {
    createFeeTypeMutation.mutate({ body: data })
  }

  const updateFeeTypeMutation = useMutation({
    ...putApiFeeTypeMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("feeTypes.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: feeTypeQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("feeTypes.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateFeeType = (data: any) => {
    updateFeeTypeMutation.mutate({ body: data })
  }

  const deleteFeeTypeMutation = useMutation({
    ...deleteApiFeeTypeByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("feeTypes.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: feeTypeQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("feeTypes.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteFeeType = (id: string) => {
    deleteFeeTypeMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiFeeTypeByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("feeTypes.bulk.deleteReason") },
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
        toast.success(t("feeTypes.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: feeTypeQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("feeTypes.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("feeTypes.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteFeeType = (id: string) => {
    onDeleteFeeType(id)
  }

  const search = () => {
    searchFeeTypes()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchFeeTypes()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchFeeTypes()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchFeeTypes()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchFeeTypes()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchFeeTypes()
  }
  const refreshData = () => {
    searchFeeTypes()
  }

  return {
    ...store,
    searchMutation: searchFeeTypesMutation,
    createMutation: createFeeTypeMutation,
    updateMutation: updateFeeTypeMutation,
    deleteMutation: deleteFeeTypeMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getFeeTypeQuery,
    searchFeeTypes,
    onCreateFeeType,
    onUpdateFeeType,
    onDeleteFeeType,
    search,
    changePage,
    changePageSize,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    deleteFeeType,
    hasData: store.feeTypes.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchFeeTypesMutation.isPending || store.isLoading,
    isError: searchFeeTypesMutation.isError,
    error: searchFeeTypesMutation.error || store.error,
  }
}
