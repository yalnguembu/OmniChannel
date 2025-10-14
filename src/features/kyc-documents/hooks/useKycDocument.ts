import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useKycDocumentStore } from "../stores/kycDocumentStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiKycDocumentSearchMutation,
  getApiKycDocumentDropdownOptions,
  postApiKycDocumentMutation,
  putApiKycDocumentMutation,
  deleteApiKycDocumentByIdMutation,
  getApiKycDocumentByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const kycDocumentQueryKeys = {
  all: ["kycDocument"] as const,
  lists: () => [...kycDocumentQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...kycDocumentQueryKeys.lists(), { filters }] as const,
  details: () => [...kycDocumentQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...kycDocumentQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...kycDocumentQueryKeys.all, "dropdown", { params }] as const,
}

export const useKycDocument = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useKycDocumentStore()

  const searchKycDocumentsMutation = useMutation({
    ...postApiKycDocumentSearchMutation({
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
        store.setKycDocument(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("kycDocuments.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchKycDocuments = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchKycDocumentsMutation.mutate({ body: searchParams })
  }

  const getKycDocumentQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiKycDocumentByIdOptions({ path: { id } }),
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
    ...getApiKycDocumentDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createKycDocumentMutation = useMutation({
    ...postApiKycDocumentMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("kycDocuments.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: kycDocumentQueryKeys.lists() })
      searchKycDocuments()
    },
    onError: (error) => {
      const message = error.message || t("kycDocuments.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateKycDocument = (data: any) => {
    createKycDocumentMutation.mutate({ body: data })
  }

  const updateKycDocumentMutation = useMutation({
    ...putApiKycDocumentMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("kycDocuments.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: kycDocumentQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("kycDocuments.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateKycDocument = (data: any) => {
    updateKycDocumentMutation.mutate({ body: data })
  }

  const deleteKycDocumentMutation = useMutation({
    ...deleteApiKycDocumentByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("kycDocuments.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: kycDocumentQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("kycDocuments.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteKycDocument = (id: string) => {
    deleteKycDocumentMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiKycDocumentByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("kycDocuments.bulk.deleteReason") },
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
        toast.success(t("kycDocuments.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: kycDocumentQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("kycDocuments.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("kycDocuments.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteKycDocument = (id: string) => {
    onDeleteKycDocument(id)
  }

  const search = () => {
    searchKycDocuments()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchKycDocuments()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchKycDocuments()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchKycDocuments()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchKycDocuments()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchKycDocuments()
  }
  const refreshData = () => {
    searchKycDocuments()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchKycDocumentsMutation,
    createMutation: createKycDocumentMutation,
    updateMutation: updateKycDocumentMutation,
    deleteMutation: deleteKycDocumentMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getKycDocumentQuery,
    searchKycDocuments,
    onCreateKycDocument,
    onUpdateKycDocument,
    onDeleteKycDocument,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteKycDocument,
    hasData: store.kycDocuments.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchKycDocumentsMutation.isPending || store.isLoading,
    isError: searchKycDocumentsMutation.isError,
    error: searchKycDocumentsMutation.error || store.error,
  }
}
