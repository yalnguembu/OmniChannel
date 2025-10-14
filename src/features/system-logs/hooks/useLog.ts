import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useLogStore } from "../stores/logStore"
import { SortDirection } from "@/shared/enums/data-grid"
import { postApiLogSearchMutation, getApiLogByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const logQueryKeys = {
  all: ["log"] as const,
  lists: () => [...logQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...logQueryKeys.lists(), { filters }] as const,
  details: () => [...logQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...logQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...logQueryKeys.all, "dropdown", { params }] as const,
}

export const useLog = () => {
  const { t } = useTranslation()
  const store = useLogStore()

  const searchLogsMutation = useMutation({
    ...postApiLogSearchMutation({
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
        store.setLog(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("logs.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchLogs = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchLogsMutation.mutate({ body: searchParams })
  }

  const getLogQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiLogByIdOptions({ path: { id } }),
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
    searchLogs()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchLogs()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchLogs()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchLogs()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchLogs()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchLogs()
  }
  const refreshData = () => {
    searchLogs()
  }

  return {
    ...store,
    getLogQuery,
    searchLogsMutation,
    searchLogs,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    hasData: store.logs.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchLogsMutation.isPending || store.isLoading,
    isError: searchLogsMutation.isError,
    error: searchLogsMutation.error || store.error,
  }
}
