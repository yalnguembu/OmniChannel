import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useAuditLogStore } from "../stores/auditLogStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiAuditLogSearchMutation,
  getApiAuditLogDropdownOptions,
  postApiAuditLogMutation,
  putApiAuditLogMutation,
  deleteApiAuditLogByIdMutation,
  getApiAuditLogByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const auditLogQueryKeys = {
  all: ["auditLog"] as const,
  lists: () => [...auditLogQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...auditLogQueryKeys.lists(), { filters }] as const,
  details: () => [...auditLogQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...auditLogQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...auditLogQueryKeys.all, "dropdown", { params }] as const,
}

export const useAuditLog = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useAuditLogStore()

  const searchAuditLogsMutation = useMutation({
    ...postApiAuditLogSearchMutation({
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
        store.setAuditLog(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("auditLogs.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchAuditLogs = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchAuditLogsMutation.mutate({ body: searchParams })
  }

  const getAuditLogQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiAuditLogByIdOptions({ path: { id } }),
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
    ...getApiAuditLogDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createAuditLogMutation = useMutation({
    ...postApiAuditLogMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("auditLogs.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: auditLogQueryKeys.lists() })
      searchAuditLogs()
    },
    onError: (error) => {
      const message = error.message || t("auditLogs.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateAuditLog = (data: any) => {
    createAuditLogMutation.mutate({ body: data })
  }

  const updateAuditLogMutation = useMutation({
    ...putApiAuditLogMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("auditLogs.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: auditLogQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("auditLogs.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateAuditLog = (data: any) => {
    updateAuditLogMutation.mutate({ body: data })
  }

  const deleteAuditLogMutation = useMutation({
    ...deleteApiAuditLogByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("auditLogs.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: auditLogQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("auditLogs.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteAuditLog = (id: string) => {
    deleteAuditLogMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiAuditLogByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("auditLogs.bulk.deleteReason") },
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
        toast.success(t("auditLogs.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: auditLogQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("auditLogs.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("auditLogs.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteAuditLog = (id: string) => {
    onDeleteAuditLog(id)
  }

  const search = () => {
    searchAuditLogs()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchAuditLogs()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchAuditLogs()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchAuditLogs()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchAuditLogs()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchAuditLogs()
  }
  const refreshData = () => {
    searchAuditLogs()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchAuditLogsMutation,
    createMutation: createAuditLogMutation,
    updateMutation: updateAuditLogMutation,
    deleteMutation: deleteAuditLogMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getAuditLogQuery,
    searchAuditLogs,
    onCreateAuditLog,
    onUpdateAuditLog,
    onDeleteAuditLog,
    search,
    changePage,
    changePageSize,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteAuditLog,
    hasData: store.auditLogs.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchAuditLogsMutation.isPending || store.isLoading,
    isError: searchAuditLogsMutation.isError,
    error: searchAuditLogsMutation.error || store.error,
  }
}
