import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useBlockedIpStore } from "../stores/blockedIpStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiBlockedIpSearchMutation,
  getApiBlockedIpDropdownOptions,
  postApiBlockedIpMutation,
  putApiBlockedIpMutation,
  deleteApiBlockedIpByIdMutation,
  getApiBlockedIpByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const blockedIpQueryKeys = {
  all: ["blockedIp"] as const,
  lists: () => [...blockedIpQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...blockedIpQueryKeys.lists(), { filters }] as const,
  details: () => [...blockedIpQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...blockedIpQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...blockedIpQueryKeys.all, "dropdown", { params }] as const,
}

export const useBlockedIp = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useBlockedIpStore()

  const searchBlockedIpsMutation = useMutation({
    ...postApiBlockedIpSearchMutation({
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
        store.setBlockedIps(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("blockedIp.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchBlockedIps = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchBlockedIpsMutation.mutate({ body: searchParams })
  }

  const getBlockedIpQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiBlockedIpByIdOptions({ path: { id } }),
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
    ...getApiBlockedIpDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createBlockedIpMutation = useMutation({
    ...postApiBlockedIpMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("blockedIp.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: blockedIpQueryKeys.lists() })
      searchBlockedIps()
    },
    onError: (error) => {
      const message = error.message || t("blockedIp.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateBlockedIp = (data: any) => {
    createBlockedIpMutation.mutate({ body: data })
  }

  const updateBlockedIpMutation = useMutation({
    ...putApiBlockedIpMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("blockedIp.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: blockedIpQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("blockedIp.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateBlockedIp = (data: any) => {
    updateBlockedIpMutation.mutate({ body: data })
  }

  const deleteBlockedIpMutation = useMutation({
    ...deleteApiBlockedIpByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("blockedIp.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: blockedIpQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("blockedIp.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteBlockedIp = (id: string) => {
    deleteBlockedIpMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiBlockedIpByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("blockedIp.bulk.deleteReason") },
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
        toast.success(t("blockedIp.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: blockedIpQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("blockedIp.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("blockedIp.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteBlockedIp = (id: string) => {
    onDeleteBlockedIp(id)
  }

  const search = () => {
    searchBlockedIps()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchBlockedIps()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchBlockedIps()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchBlockedIps()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchBlockedIps()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchBlockedIps()
  }
  const refreshData = () => {
    searchBlockedIps()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchBlockedIpsMutation,
    createMutation: createBlockedIpMutation,
    updateMutation: updateBlockedIpMutation,
    deleteMutation: deleteBlockedIpMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getBlockedIpQuery,
    searchBlockedIps,
    onCreateBlockedIp,
    onUpdateBlockedIp,
    onDeleteBlockedIp,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteBlockedIp,
    hasData: store.blockedIps.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchBlockedIpsMutation.isPending || store.isLoading,
    isError: searchBlockedIpsMutation.isError,
    error: searchBlockedIpsMutation.error || store.error,
  }
}
