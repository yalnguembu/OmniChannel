import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useCurrencyStore } from "../stores/currencyStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiCurrencySearchMutation,
  getApiCurrencyDropdownOptions,
  postApiCurrencyMutation,
  putApiCurrencyMutation,
  deleteApiCurrencyByIdMutation,
  getApiCurrencyByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const currencyQueryKeys = {
  all: ["currency"] as const,
  lists: () => [...currencyQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...currencyQueryKeys.lists(), { filters }] as const,
  details: () => [...currencyQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...currencyQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...currencyQueryKeys.all, "dropdown", { params }] as const,
}

export const useCurrency = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useCurrencyStore()

  const searchCurrencysMutation = useMutation({
    ...postApiCurrencySearchMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data) ? data.data : []
        store.setCurrency(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("currencies.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchCurrencies = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchCurrencysMutation.mutate({ body: searchParams })
  }

  const getCurrencyQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiCurrencyByIdOptions({ path: { id } }),
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
      ...getApiCurrencyDropdownOptions(),
      staleTime: 10 * 60 * 1000,
    })

  const createCurrencyMutation = useMutation({
    ...postApiCurrencyMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("currencies.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: currencyQueryKeys.lists() })
      searchCurrencies()
    },
    onError: (error) => {
      const message = error.message || t("currencies.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateCurrency = (data: any) => {
    createCurrencyMutation.mutate({ body: data })
  }

  const updateCurrencyMutation = useMutation({
    ...putApiCurrencyMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("currencies.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: currencyQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("currencies.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateCurrency = (data: any) => {
    updateCurrencyMutation.mutate({ body: data })
  }

  const deleteCurrencyMutation = useMutation({
    ...deleteApiCurrencyByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("currencies.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: currencyQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("currencies.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteCurrency = (id: string) => {
    deleteCurrencyMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiCurrencyByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("currencies.bulk.deleteReason") },
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
        toast.success(t("currencies.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: currencyQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("currencies.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("currencies.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteCurrency = (id: string) => {
    onDeleteCurrency(id)
  }

  const search = () => {
    searchCurrencies()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchCurrencies()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchCurrencies()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchCurrencies()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchCurrencies()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchCurrencies()
  }
  const refreshData = () => {
    searchCurrencies()
  }

  return {
    ...store,
    searchMutation: searchCurrencysMutation,
    createMutation: createCurrencyMutation,
    updateMutation: updateCurrencyMutation,
    deleteMutation: deleteCurrencyMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getCurrencyQuery,
    searchCurrencies,
    onCreateCurrency,
    onUpdateCurrency,
    onDeleteCurrency,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    deleteCurrency,
    hasData: store.currencys.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchCurrencysMutation.isPending || store.isLoading,
    isError: searchCurrencysMutation.isError,
    error: searchCurrencysMutation.error || store.error,
  }
}
