import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { usePaymentMethodStore } from "../stores/paymentMethodStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiPaymentMethodSearchMutation,
  getApiPaymentMethodDropdownOptions,
  postApiPaymentMethodMutation,
  putApiPaymentMethodMutation,
  deleteApiPaymentMethodByIdMutation,
  getApiPaymentMethodByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const paymentMethodQueryKeys = {
  // all: ['paymentMethod'] as const,
  // lists: () => [...paymentMethodQueryKeys.all, 'list'] as const,
  // list: (filters: Record<string, any>) => [...paymentMethodQueryKeys.lists(), { filters }] as const,
  // details: () => [...paymentMethodQueryKeys.all, 'detail'] as const,
  // detail: (id: string) => [...paymentMethodQueryKeys.details(), id] as const,
  // dropdown: (params?: Record<string, any>) => [...paymentMethodQueryKeys.all, 'dropdown', { params }] as const,
}

export const usePaymentMethod = () => {
  const { t } = useTranslation()
  const store = usePaymentMethodStore()

  const searchPaymentMethodsMutation = useMutation({
    ...postApiPaymentMethodSearchMutation({
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
        store.setPaymentMethod(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("paymentMethods.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchPaymentMethods = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchPaymentMethodsMutation.mutate({ body: searchParams })
  }

  const getPaymentMethodQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiPaymentMethodByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  // const getPaymentMethodById= () =>

  const dropdownQuery = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiPaymentMethodDropdownOptions(),
      staleTime: 10 * 60 * 1000,
    })

  const createPaymentMethodMutation = useMutation({
    ...postApiPaymentMethodMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("paymentMethods.messages.create.success"))
      // queryClient.invalidateQueries({ queryKey: paymentMethodQueryKeys.lists() })
      searchPaymentMethods()
    },
    onError: (error) => {
      const message = error.message || t("paymentMethods.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreatePaymentMethod = (data: any) => {
    createPaymentMethodMutation.mutate({ body: data })
  }

  const updatePaymentMethodMutation = useMutation({
    ...putApiPaymentMethodMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("paymentMethods.messages.update.success"))
      // queryClient.invalidateQueries({ queryKey: paymentMethodQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("paymentMethods.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdatePaymentMethod = (data: any) => {
    updatePaymentMethodMutation.mutate({ body: data })
  }

  const deletePaymentMethodMutation = useMutation({
    ...deleteApiPaymentMethodByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("paymentMethods.messages.delete.success"))
      // queryClient.invalidateQueries({ queryKey: paymentMethodQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("paymentMethods.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeletePaymentMethod = (id: string) => {
    deletePaymentMethodMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiPaymentMethodByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("paymentMethods.bulk.deleteReason") },
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
        toast.success(t("paymentMethods.messages.delete.success", { count: successCount }))
        // queryClient.invalidateQueries({ queryKey: paymentMethodQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("paymentMethods.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("paymentMethods.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deletePaymentMethod = (id: string) => {
    onDeletePaymentMethod(id)
  }

  const search = () => {
    searchPaymentMethods()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchPaymentMethods()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchPaymentMethods()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchPaymentMethods()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchPaymentMethods()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchPaymentMethods()
  }
  const refreshData = () => {
    searchPaymentMethods()
  }

  return {
    ...store,
    searchMutation: searchPaymentMethodsMutation,
    createMutation: createPaymentMethodMutation,
    updateMutation: updatePaymentMethodMutation,
    deleteMutation: deletePaymentMethodMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getPaymentMethodQuery,
    searchPaymentMethods,
    onCreatePaymentMethod,
    onUpdatePaymentMethod,
    onDeletePaymentMethod,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    deletePaymentMethod,
    hasData: store.paymentMethods.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchPaymentMethodsMutation.isPending || store.isLoading,
    isError: searchPaymentMethodsMutation.isError,
    error: searchPaymentMethodsMutation.error || store.error,
  }
}
