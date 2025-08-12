import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useWebhookLogStore } from "../stores/webhookLogStore"
import { SortDirection } from "@/shared/enums/data-grid"
import { postApiWebhookLogSearchMutation, getApiWebhookLogByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const webhookLogQueryKeys = {
  all: ["webhookLog"] as const,
  lists: () => [...webhookLogQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...webhookLogQueryKeys.lists(), { filters }] as const,
  details: () => [...webhookLogQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...webhookLogQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...webhookLogQueryKeys.all, "dropdown", { params }] as const,
}

export const useWebhookLog = () => {
  const { t } = useTranslation()
  const store = useWebhookLogStore()

  const searchWebhookLogsMutation = useMutation({
    ...postApiWebhookLogSearchMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data) ? data.data : []
        store.setWebhookLog(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("webhookLog.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchWebhookLogs = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchWebhookLogsMutation.mutate({ body: searchParams })
  }

  const getWebhookLogQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiWebhookLogByIdOptions({ path: { id } }),
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
    searchWebhookLogs()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchWebhookLogs()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchWebhookLogs()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchWebhookLogs()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchWebhookLogs()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchWebhookLogs()
  }
  const refreshData = () => {
    searchWebhookLogs()
  }

  return {
    ...store,
    getWebhookLogQuery,
    searchWebhookLogs,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    hasData: store.webhookLogs.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchWebhookLogsMutation.isPending || store.isLoading,
    isError: searchWebhookLogsMutation.isError,
    error: searchWebhookLogsMutation.error || store.error,
  }
}
