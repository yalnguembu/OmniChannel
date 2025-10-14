import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useVwTransactionsSummaryStore } from "../stores/vwTransactionsSummaryStore"
import { SortDirection } from "@/shared/enums/data-grid"
import { postApiVwTransactionsSummarySearchMutation, getApiVwTransactionsSummaryByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const vwTransactionsSummaryQueryKeys = {
  all: ["vwTransactionsSummary"] as const,
  lists: () => [...vwTransactionsSummaryQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...vwTransactionsSummaryQueryKeys.lists(), { filters }] as const,
  details: () => [...vwTransactionsSummaryQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...vwTransactionsSummaryQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...vwTransactionsSummaryQueryKeys.all, "dropdown", { params }] as const,
}

export const useVwTransactionsSummary = () => {
  const { t } = useTranslation()
  const store = useVwTransactionsSummaryStore()

  const searchVwTransactionsSummarysMutation = useMutation({
    ...postApiVwTransactionsSummarySearchMutation({
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
        store.setVwTransactionsSummary(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("vwTransactionsSummarys.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchVwTransactionsSummarys = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchVwTransactionsSummarysMutation.mutate({ body: searchParams })
  }

  const getVwTransactionsSummaryQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiVwTransactionsSummaryByIdOptions({ path: { id } }),
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
    searchVwTransactionsSummarys()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchVwTransactionsSummarys()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchVwTransactionsSummarys()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchVwTransactionsSummarys()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchVwTransactionsSummarys()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchVwTransactionsSummarys()
  }
  const refreshData = () => {
    searchVwTransactionsSummarys()
  }

  return {
    ...store,
    getVwTransactionsSummaryQuery,
    searchVwTransactionsSummarys,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    hasData: store.vwTransactionsSummarys.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchVwTransactionsSummarysMutation.isPending || store.isLoading,
    isError: searchVwTransactionsSummarysMutation.isError,
    error: searchVwTransactionsSummarysMutation.error || store.error,
  }
}
