import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useNotificationStore } from "../stores/notificationStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiNotificationSearchMutation,
  getApiNotificationDropdownOptions,
  postApiNotificationMutation,
  putApiNotificationMutation,
  deleteApiNotificationByIdMutation,
  getApiNotificationByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const notificationQueryKeys = {
  all: ["notification"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...notificationQueryKeys.lists(), { filters }] as const,
  details: () => [...notificationQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...notificationQueryKeys.all, "dropdown", { params }] as const,
}

export const useNotification = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useNotificationStore()

  const searchNotificationsMutation = useMutation({
    ...postApiNotificationSearchMutation({
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
        store.setNotification(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("notification.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchNotifications = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchNotificationsMutation.mutate({ body: searchParams })
  }

  const getNotificationQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiNotificationByIdOptions({ path: { id } }),
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
    ...getApiNotificationDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createNotificationMutation = useMutation({
    ...postApiNotificationMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("notification.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.lists() })
      searchNotifications()
    },
    onError: (error) => {
      const message = error.message || t("notification.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateNotification = (data: any) => {
    createNotificationMutation.mutate({ body: data })
  }

  const updateNotificationMutation = useMutation({
    ...putApiNotificationMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("notification.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("notification.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateNotification = (data: any) => {
    updateNotificationMutation.mutate({ body: data })
  }

  const deleteNotificationMutation = useMutation({
    ...deleteApiNotificationByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("notification.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("notification.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteNotification = (id: string) => {
    deleteNotificationMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiNotificationByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("notification.bulk.deleteReason") },
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
        toast.success(t("notification.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("notification.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("notification.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteNotification = (id: string) => {
    onDeleteNotification(id)
  }

  const search = () => {
    searchNotifications()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchNotifications()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchNotifications()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchNotifications()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchNotifications()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchNotifications()
  }
  const refreshData = () => {
    searchNotifications()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchNotificationsMutation,
    createMutation: createNotificationMutation,
    updateMutation: updateNotificationMutation,
    deleteMutation: deleteNotificationMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getNotificationQuery,
    searchNotifications,
    onCreateNotification,
    onUpdateNotification,
    onDeleteNotification,
    search,
    changePage,
    changePageSize,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteNotification,
    hasData: store.notifications.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchNotificationsMutation.isPending || store.isLoading,
    isError: searchNotificationsMutation.isError,
    error: searchNotificationsMutation.error || store.error,
  }
}
