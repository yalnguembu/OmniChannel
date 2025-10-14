import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useCompanyAppLimitStore } from "../stores/companyAppLimitStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiCompanyAppLimitSearchMutation,
  getApiCompanyAppLimitDropdownOptions,
  postApiCompanyAppLimitMutation,
  putApiCompanyAppLimitMutation,
  deleteApiCompanyAppLimitByIdMutation,
  getApiCompanyAppLimitByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const companyAppLimitQueryKeys = {
  all: ["companyAppLimit"] as const,
  lists: () => [...companyAppLimitQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...companyAppLimitQueryKeys.lists(), { filters }] as const,
  details: () => [...companyAppLimitQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...companyAppLimitQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...companyAppLimitQueryKeys.all, "dropdown", { params }] as const,
}

export const useCompanyAppLimit = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useCompanyAppLimitStore()

  const searchCompanyAppLimitsMutation = useMutation({
    ...postApiCompanyAppLimitSearchMutation({
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
        store.setCompanyAppLimit(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("companyAppLimits.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchCompanyAppLimits = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchCompanyAppLimitsMutation.mutate({ body: searchParams })
  }

  const getCompanyAppLimitQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiCompanyAppLimitByIdOptions({ path: { id } }),
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
    ...getApiCompanyAppLimitDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createCompanyAppLimitMutation = useMutation({
    ...postApiCompanyAppLimitMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("companyAppLimits.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: companyAppLimitQueryKeys.lists() })
      searchCompanyAppLimits()
    },
    onError: (error) => {
      const message = error.message || t("companyAppLimits.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateCompanyAppLimit = (data: any) => {
    createCompanyAppLimitMutation.mutate({ body: data })
  }

  const updateCompanyAppLimitMutation = useMutation({
    ...putApiCompanyAppLimitMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("companyAppLimits.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: companyAppLimitQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("companyAppLimits.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateCompanyAppLimit = (data: any) => {
    updateCompanyAppLimitMutation.mutate({ body: data })
  }

  const deleteCompanyAppLimitMutation = useMutation({
    ...deleteApiCompanyAppLimitByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("companyAppLimits.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: companyAppLimitQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("companyAppLimits.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteCompanyAppLimit = (id: string) => {
    deleteCompanyAppLimitMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiCompanyAppLimitByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("companyAppLimits.bulk.deleteReason") },
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
        toast.success(t("companyAppLimits.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: companyAppLimitQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("companyAppLimits.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("companyAppLimits.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteCompanyAppLimit = (id: string) => {
    onDeleteCompanyAppLimit(id)
  }

  const search = () => {
    searchCompanyAppLimits()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchCompanyAppLimits()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchCompanyAppLimits()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchCompanyAppLimits()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchCompanyAppLimits()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchCompanyAppLimits()
  }
  const refreshData = () => {
    searchCompanyAppLimits()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchCompanyAppLimitsMutation,
    createMutation: createCompanyAppLimitMutation,
    updateMutation: updateCompanyAppLimitMutation,
    deleteMutation: deleteCompanyAppLimitMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getCompanyAppLimitQuery,
    searchCompanyAppLimits,
    onCreateCompanyAppLimit,
    onUpdateCompanyAppLimit,
    onDeleteCompanyAppLimit,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteCompanyAppLimit,
    hasData: store.companyAppLimits.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchCompanyAppLimitsMutation.isPending || store.isLoading,
    isError: searchCompanyAppLimitsMutation.isError,
    error: searchCompanyAppLimitsMutation.error || store.error,
  }
}
