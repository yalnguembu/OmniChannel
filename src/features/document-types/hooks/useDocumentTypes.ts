import { useEffect, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useDocumentTypeStore } from "../stores/documentTypeStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiDocumentsTypeSearchMutation,
  getApiDocumentsTypeDropdownOptions,
  postApiDocumentsTypeMutation,
  putApiDocumentsTypeMutation,
  deleteApiDocumentsTypeByIdMutation,
  getApiDocumentsTypeByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const documentsTypeQueryKeys = {
  all: ["documentsType"] as const,
  lists: () => [...documentsTypeQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...documentsTypeQueryKeys.lists(), { filters }] as const,
  details: () => [...documentsTypeQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...documentsTypeQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...documentsTypeQueryKeys.all, "dropdown", { params }] as const,
}

export const useDocumentsType = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useDocumentTypeStore()
  const hasInitialized = useRef(false)

  const searchDocumentsTypesMutation = useMutation({
    ...postApiDocumentsTypeSearchMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data) ? data.data : []
        store.setDocumentsType(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("documentsTypes.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchDocumentsTypes = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchDocumentsTypesMutation.mutate({ body: searchParams })
  }

  const getDocumentsTypeQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiDocumentsTypeByIdOptions({ path: { id } }),
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
    ...getApiDocumentsTypeDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      setTimeout(() => {
        searchDocumentsTypes()
      }, 0)
    }
  }, [])

  const createDocumentsTypeMutation = useMutation({
    ...postApiDocumentsTypeMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("documentsTypes.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: documentsTypeQueryKeys.lists() })
      searchDocumentsTypes()
    },
    onError: (error) => {
      const message = error.message || t("documentsTypes.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateDocumentsType = (data: any) => {
    createDocumentsTypeMutation.mutate({ body: data })
  }

  const updateDocumentsTypeMutation = useMutation({
    ...putApiDocumentsTypeMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("documentsTypes.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: documentsTypeQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("documentsTypes.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateDocumentsType = (data: any) => {
    updateDocumentsTypeMutation.mutate({ body: data })
  }

  const deleteDocumentsTypeMutation = useMutation({
    ...deleteApiDocumentsTypeByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("documentsTypes.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: documentsTypeQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("documentsTypes.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteDocumentsType = (id: string) => {
    deleteDocumentsTypeMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiDocumentsTypeByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("documentsTypes.bulk.deleteReason") },
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
        toast.success(t("documentsTypes.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: documentsTypeQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("documentsTypes.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("documentsTypes.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteDocumentsType = (id: string) => {
    onDeleteDocumentsType(id)
  }

  const search = () => {
    searchDocumentsTypes()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchDocumentsTypes()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchDocumentsTypes()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchDocumentsTypes()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchDocumentsTypes()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchDocumentsTypes()
  }
  const refreshData = () => {
    searchDocumentsTypes()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchDocumentsTypesMutation,
    createMutation: createDocumentsTypeMutation,
    updateMutation: updateDocumentsTypeMutation,
    deleteMutation: deleteDocumentsTypeMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getDocumentsTypeQuery,
    searchDocumentsTypes,
    onCreateDocumentsType,
    onUpdateDocumentsType,
    onDeleteDocumentsType,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteDocumentsType,
    hasData: store.documentsTypes.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchDocumentsTypesMutation.isPending || store.isLoading,
    isError: searchDocumentsTypesMutation.isError,
    error: searchDocumentsTypesMutation.error || store.error,
  }
}
