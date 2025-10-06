import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useSmsmailTemplateStore } from "../stores/smsMailTemplateStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiSmsmailTemplateSearchMutation,
  getApiSmsmailTemplateDropdownOptions,
  postApiSmsmailTemplateMutation,
  putApiSmsmailTemplateMutation,
  deleteApiSmsmailTemplateByIdMutation,
  getApiSmsmailTemplateByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const smsmailTemplateQueryKeys = {
  all: ["smsmailTemplate"] as const,
  lists: () => [...smsmailTemplateQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...smsmailTemplateQueryKeys.lists(), { filters }] as const,
  details: () => [...smsmailTemplateQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...smsmailTemplateQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...smsmailTemplateQueryKeys.all, "dropdown", { params }] as const,
}

export const useSmsmailTemplate = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useSmsmailTemplateStore()

  const searchSmsmailTemplatesMutation = useMutation({
    ...postApiSmsmailTemplateSearchMutation({
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
        store.setSmsmailTemplate(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("smsmailTemplates.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchSmsmailTemplates = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchSmsmailTemplatesMutation.mutate({ body: searchParams })
  }

  const getSmsmailTemplateQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiSmsmailTemplateByIdOptions({ path: { id } }),
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
    ...getApiSmsmailTemplateDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createSmsmailTemplateMutation = useMutation({
    ...postApiSmsmailTemplateMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("smsmailTemplates.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: smsmailTemplateQueryKeys.lists() })
      searchSmsmailTemplates()
    },
    onError: (error) => {
      const message = error.message || t("smsmailTemplates.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateSmsmailTemplate = (data: any) => {
    createSmsmailTemplateMutation.mutate({ body: data })
  }

  const updateSmsmailTemplateMutation = useMutation({
    ...putApiSmsmailTemplateMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("smsmailTemplates.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: smsmailTemplateQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("smsmailTemplates.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateSmsmailTemplate = (data: any) => {
    updateSmsmailTemplateMutation.mutate({ body: data })
  }

  const deleteSmsmailTemplateMutation = useMutation({
    ...deleteApiSmsmailTemplateByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("smsmailTemplates.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: smsmailTemplateQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("smsmailTemplates.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteSmsmailTemplate = (id: string) => {
    deleteSmsmailTemplateMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiSmsmailTemplateByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("smsmailTemplates.bulk.deleteReason") },
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
        toast.success(t("smsmailTemplates.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: smsmailTemplateQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("smsmailTemplates.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("smsmailTemplates.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteSmsmailTemplate = (id: string) => {
    onDeleteSmsmailTemplate(id)
  }

  const search = () => {
    searchSmsmailTemplates()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchSmsmailTemplates()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchSmsmailTemplates()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchSmsmailTemplates()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchSmsmailTemplates()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchSmsmailTemplates()
  }
  const refreshData = () => {
    searchSmsmailTemplates()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchSmsmailTemplatesMutation,
    createMutation: createSmsmailTemplateMutation,
    updateMutation: updateSmsmailTemplateMutation,
    deleteMutation: deleteSmsmailTemplateMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getSmsmailTemplateQuery,
    searchSmsmailTemplates,
    onCreateSmsmailTemplate,
    onUpdateSmsmailTemplate,
    onDeleteSmsmailTemplate,
    search,
    changePage,
    changePageSize,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteSmsmailTemplate,
    hasData: store.smsmailTemplates.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchSmsmailTemplatesMutation.isPending || store.isLoading,
    isError: searchSmsmailTemplatesMutation.isError,
    error: searchSmsmailTemplatesMutation.error || store.error,
  }
}
