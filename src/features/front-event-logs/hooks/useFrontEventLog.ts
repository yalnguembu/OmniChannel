import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useFrontEventLogStore } from "../stores/frontEventLogStore"
import { SortDirection } from "@/shared/enums/data-grid"
import { postApiFrontEventLogSearchMutation, getApiFrontEventLogByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const frontEventLogQueryKeys = {
  all: ["frontEventLog"] as const,
  lists: () => [...frontEventLogQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...frontEventLogQueryKeys.lists(), { filters }] as const,
  details: () => [...frontEventLogQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...frontEventLogQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...frontEventLogQueryKeys.all, "dropdown", { params }] as const,
}

export const useFrontEventLog = () => {
  const { t } = useTranslation()
  const store = useFrontEventLogStore()

  const searchFrontEventLogsMutation = useMutation({
    ...postApiFrontEventLogSearchMutation({
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
        store.setFrontEventLog(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("frontEventLogs.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchFrontEventLogs = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchFrontEventLogsMutation.mutate({ body: searchParams })
  }

  const getFrontEventLogQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiFrontEventLogByIdOptions({ path: { id } }),
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
    searchFrontEventLogs()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchFrontEventLogs()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchFrontEventLogs()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchFrontEventLogs()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchFrontEventLogs()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchFrontEventLogs()
  }
  const refreshData = () => {
    searchFrontEventLogs()
  }

  return {
    ...store,
    getFrontEventLogQuery,
    searchFrontEventLogs,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    hasData: store.frontEventLogs.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchFrontEventLogsMutation.isPending || store.isLoading,
    isError: searchFrontEventLogsMutation.isError,
    error: searchFrontEventLogsMutation.error || store.error,
  }
}
