import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useAllowedIpStore } from "../stores/allowedIpStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiAllowedIpSearchMutation,
  getApiAllowedIpDropdownOptions,
  postApiAllowedIpMutation,
  putApiAllowedIpMutation,
  deleteApiAllowedIpByIdMutation,
  getApiAllowedIpByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const allowedIpQueryKeys = {
  all: ["allowedIp"] as const,
  lists: () => [...allowedIpQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...allowedIpQueryKeys.lists(), { filters }] as const,
  details: () => [...allowedIpQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...allowedIpQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...allowedIpQueryKeys.all, "dropdown", { params }] as const,
}

export const useAllowedIp = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useAllowedIpStore()

  const searchAllowedIpsMutation = useMutation({
    ...postApiAllowedIpSearchMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data) ? data.data : []
        store.setAllowedIp(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("allowedIps.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchAllowedIps = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchAllowedIpsMutation.mutate({ body: searchParams })
  }

  const getAllowedIpQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiAllowedIpByIdOptions({ path: { id } }),
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
    ...getApiAllowedIpDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createAllowedIpMutation = useMutation({
    ...postApiAllowedIpMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("allowedIps.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: allowedIpQueryKeys.lists() })
      searchAllowedIps()
    },
    onError: (error) => {
      const message = error.message || t("allowedIps.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateAllowedIp = (data: any) => {
    createAllowedIpMutation.mutate({ body: data })
  }

  const updateAllowedIpMutation = useMutation({
    ...putApiAllowedIpMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("allowedIps.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: allowedIpQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("allowedIps.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateAllowedIp = (data: any) => {
    updateAllowedIpMutation.mutate({ body: data })
  }

  const deleteAllowedIpMutation = useMutation({
    ...deleteApiAllowedIpByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("allowedIps.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: allowedIpQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("allowedIps.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteAllowedIp = (id: string) => {
    deleteAllowedIpMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiAllowedIpByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("allowedIps.bulk.deleteReason") },
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
        toast.success(t("allowedIps.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: allowedIpQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("allowedIps.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("allowedIps.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteAllowedIp = (id: string) => {
    onDeleteAllowedIp(id)
  }

  const search = () => {
    searchAllowedIps()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchAllowedIps()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchAllowedIps()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchAllowedIps()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchAllowedIps()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchAllowedIps()
  }
  const refreshData = () => {
    searchAllowedIps()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchAllowedIpsMutation,
    createMutation: createAllowedIpMutation,
    updateMutation: updateAllowedIpMutation,
    deleteMutation: deleteAllowedIpMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getAllowedIpQuery,
    searchAllowedIps,
    onCreateAllowedIp,
    onUpdateAllowedIp,
    onDeleteAllowedIp,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteAllowedIp,
    hasData: store.allowedIps.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchAllowedIpsMutation.isPending || store.isLoading,
    isError: searchAllowedIpsMutation.isError,
    error: searchAllowedIpsMutation.error || store.error,
  }
}
