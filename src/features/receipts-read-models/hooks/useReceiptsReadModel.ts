import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useReceiptsReadModelStore } from "../stores/receiptsReadModelStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiReceiptsReadModelSearchMutation,
  getApiReceiptsReadModelDropdownOptions,
  deleteApiReceiptsReadModelByIdMutation,
  getApiReceiptsReadModelByIdOptions,
  getApiReceiptsReadModelGetAllStatusOptions,
  getApiCompanyDropdownOptions,
  getApiApplicationDropdownOptions,
  postApiReceiptsReadModelExportExcelMutation,
  putApiReceiptsReadModelChangePaymentStatusByIdNewStatutMutation,
  getApiReceiptsReadModelGetAllPaymentEventsByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"
import { endOfDay, startOfDay } from "@/shared/lib/date"

export const receiptsReadModelQueryKeys = {
  all: ["receiptsReadModel"] as const,
  lists: () => [...receiptsReadModelQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...receiptsReadModelQueryKeys.lists(), { filters }] as const,
  details: () => [...receiptsReadModelQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...receiptsReadModelQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...receiptsReadModelQueryKeys.all, "dropdown", { params }] as const,
}

export const useReceiptsReadModel = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useReceiptsReadModelStore()

  const searchReceiptsReadModelsMutation = useMutation({
    ...postApiReceiptsReadModelSearchMutation({}),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data.items) ? data.data.items : []
        store.setReceiptsReadModel(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("receiptsReadModels.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const changePageSizehangePaymentStatusById = useMutation({
    ...putApiReceiptsReadModelChangePaymentStatusByIdNewStatutMutation({}),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        toast.error(t("receiptsReadModels.changeStatus.success"))
      }
    },
    onError: (error) => {
      const message = error.message || t("receiptsReadModels.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const exportExcelReceiptsReadModelsMutation = useMutation({
    ...postApiReceiptsReadModelExportExcelMutation({}),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data) {
        const filename = `ReceiptsReadModel-${new Date().toISOString()}.xlsx`
        const url = window.URL.createObjectURL(data as unknown as Blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", filename)
        document.body.appendChild(link)
        link.click()
        link.remove()

        window.URL.revokeObjectURL(url)
        toast.success(t("receiptsReadModels.messages.export.success"))
      }
    },
    onError: (error) => {
      const message = error.message || t("receiptsReadModels.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const performExport = (overrideFilters?: Partial<typeof store.filters>) => {
    const currentState = useReceiptsReadModelStore.getState()
    const filters = overrideFilters !== undefined ? { ...currentState.filters, ...overrideFilters } : currentState.filters

    const searchParams = {
      pageNumber: currentState.currentPage,
      pageSize: currentState.pageSize,
      sortBy: currentState.sortBy || undefined,
      sortDirection: currentState.sortDirection || undefined,
      ...filters,
      paymentMethodCode: filters?.paymentMethodCode === "ALL" ? "" : filters?.paymentMethodCode,
      createdFrom: filters.createdFrom ? filters.createdFrom : filters.customerIpAddress?.split("_")[0] || startOfDay(new Date()).toISOString(),
      createdTo: filters.createdTo ? filters.createdTo : filters.customerIpAddress?.split("_")[1] || endOfDay(new Date()).toISOString(),
      customerIpAddress: "",
    }
    exportExcelReceiptsReadModelsMutation.mutate({ body: searchParams, responseType: "blob" })
  }

  const performSearch = (overrideFilters?: Partial<typeof store.filters>) => {
    const currentState = useReceiptsReadModelStore.getState()
    const filters = overrideFilters !== undefined ? { ...currentState.filters, ...overrideFilters } : currentState.filters

    const searchParams = {
      pageNumber: currentState.currentPage,
      pageSize: currentState.pageSize,
      sortBy: currentState.sortBy || undefined,
      sortDirection: currentState.sortDirection || undefined,
      ...filters,
      paymentMethodCode: filters?.paymentMethodCode === "ALL" ? "" : filters?.paymentMethodCode,
      createdFrom: filters.createdFrom ? filters.createdFrom : filters.customerIpAddress?.split("_")[0] || startOfDay(new Date()).toISOString(),
      createdTo: filters.createdTo ? filters.createdTo : filters.customerIpAddress?.split("_")[1] || endOfDay(new Date()).toISOString(),
      customerIpAddress: "",
    }

    searchReceiptsReadModelsMutation.mutate({ body: searchParams })
  }

  const searchReceiptsReadModels = (searchParams?: Partial<typeof store.filters>) => {
    performSearch(searchParams)
  }

  const getReceiptsReadModelQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiReceiptsReadModelByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const getReceiptsReadModelGetAllPaymentEventsById = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiReceiptsReadModelGetAllPaymentEventsByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const getApiReceiptsReadModelGetAllStatus = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiReceiptsReadModelGetAllStatusOptions(),
      staleTime: 5 * 60 * 1000,
    })

  const dropdownQuery = useQuery({
    ...getApiReceiptsReadModelDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const companyDropdownQuery = useQuery({
    ...getApiCompanyDropdownOptions(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const applicationDropdownQuery = useQuery({
    ...getApiApplicationDropdownOptions(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const deleteReceiptsReadModelMutation = useMutation({
    ...deleteApiReceiptsReadModelByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("receiptsReadModels.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: receiptsReadModelQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("receiptsReadModels.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteReceiptsReadModel = (id: string) => {
    deleteReceiptsReadModelMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiReceiptsReadModelByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("receiptsReadModels.bulk.deleteReason") },
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
        toast.success(t("receiptsReadModels.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: receiptsReadModelQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("receiptsReadModels.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("receiptsReadModels.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteReceiptsReadModel = (id: string) => {
    onDeleteReceiptsReadModel(id)
  }

  const search = () => {
    performSearch()
  }

  const changePage = (page: number) => {
    store.setCurrentPage(page)
    performSearch()
  }

  const changePageSize = (size: number) => {
    store.setPageSize(size)
    store.setCurrentPage(1)
    performSearch()
  }

  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    performSearch()
  }

  const applyFilters = (filters: Partial<typeof store.filters>) => {
    const enhancedFilters = {
      phoneNumberEncrypted: undefined,
      searchTerm: undefined,
      ids: undefined,
      currency: undefined,
      customerEmail: undefined,
      customerName: undefined,
      customerIpAddress: undefined,
      internalReference: undefined,
      externalReference: undefined,
      providerInitialReference: undefined,
      providerFinalReference: undefined,
      status: undefined,
      applicationName: undefined,
      companyName: undefined,
      paymentMethodName: undefined,
      paymentMethodCode: undefined,
      providerMessage: undefined,
      applicationId: undefined,
      companyId: undefined,
      ...filters,
      createdFrom: filters.createdFrom ? filters.createdFrom : filters.customerIpAddress?.split("_")[0] || startOfDay(new Date()).toISOString(),
      createdTo: filters.createdTo ? filters.createdTo : filters.customerIpAddress?.split("_")[1] || endOfDay(new Date()).toISOString(),
    }
    store.setFilters(enhancedFilters)
    performSearch(enhancedFilters)
  }

  const clearFilters = () => {
    store.clearFilters()
    performSearch()
  }

  const refreshData = () => {
    performSearch()
  }

  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchReceiptsReadModelsMutation,
    deleteMutation: deleteReceiptsReadModelMutation,
    bulkDeleteMutation,
    dropdownQuery,
    companyDropdownQuery,
    applicationDropdownQuery,
    getReceiptsReadModelQuery,
    searchReceiptsReadModels,
    onDeleteReceiptsReadModel,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteReceiptsReadModel,
    hasData: store.receiptsReadModels.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchReceiptsReadModelsMutation.isPending || store.isLoading,
    isError: searchReceiptsReadModelsMutation.isError,
    error: searchReceiptsReadModelsMutation.error || store.error,
    getApiReceiptsReadModelGetAllStatus,
    performExport,
    changePageSizehangePaymentStatusById,
    getReceiptsReadModelGetAllPaymentEventsById,
  }
}
