import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useWithdrawalsReadModelStore } from "../stores/withdrawalsReadModelStore"
import { SortDirection } from "@/shared/enums/data-grid"
import { postApiWithdrawalsReadModelSearchMutation, getApiWithdrawalsReadModelByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const withdrawalsReadModelQueryKeys = {
  all: ["withdrawalsReadModel"] as const,
  lists: () => [...withdrawalsReadModelQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...withdrawalsReadModelQueryKeys.lists(), { filters }] as const,
  details: () => [...withdrawalsReadModelQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...withdrawalsReadModelQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...withdrawalsReadModelQueryKeys.all, "dropdown", { params }] as const,
}

export const useWithdrawalsReadModel = () => {
  const { t } = useTranslation()
  const store = useWithdrawalsReadModelStore()

  const searchWithdrawalsReadModelsMutation = useMutation({
    ...postApiWithdrawalsReadModelSearchMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data) ? data.data : []
        store.setWithdrawalsReadModel(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("withdrawalsReadModels.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchWithdrawalsReadModels = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchWithdrawalsReadModelsMutation.mutate({ body: searchParams })
  }

  const getWithdrawalsReadModelQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiWithdrawalsReadModelByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const search = () => {
    searchWithdrawalsReadModels()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchWithdrawalsReadModels()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchWithdrawalsReadModels()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchWithdrawalsReadModels()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchWithdrawalsReadModels()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchWithdrawalsReadModels()
  }
  const refreshData = () => {
    searchWithdrawalsReadModels()
  }

  return {
    ...store,
    getWithdrawalsReadModelQuery,
    searchWithdrawalsReadModels,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    hasData: store.withdrawalsReadModels.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchWithdrawalsReadModelsMutation.isPending || store.isLoading,
    isError: searchWithdrawalsReadModelsMutation.isError,
    error: searchWithdrawalsReadModelsMutation.error || store.error,
  }
}
