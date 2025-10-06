import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useFeeConfigurationStore } from "../stores/feeConfigurationStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiFeeConfigurationSearchMutation,
  getApiFeeConfigurationDropdownOptions,
  postApiFeeConfigurationMutation,
  putApiFeeConfigurationMutation,
  deleteApiFeeConfigurationByIdMutation,
  getApiFeeConfigurationByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import type { UseFormSetError } from "react-hook-form"
import type { CreateFeeConfigurationRequest, UpdateFeeConfigurationRequest } from "@/shared/api/types.gen"

export const feeConfigurationQueryKeys = {
  all: ["feeConfiguration"] as const,
  lists: () => [...feeConfigurationQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...feeConfigurationQueryKeys.lists(), { filters }] as const,
  details: () => [...feeConfigurationQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...feeConfigurationQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...feeConfigurationQueryKeys.all, "dropdown", { params }] as const,
}

export const useFeeConfiguration = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useFeeConfigurationStore()
  const { mapValidationErrorsToForm } = useErrorHandling()

  const searchFeeConfigurationsMutation = useMutation({
    ...postApiFeeConfigurationSearchMutation({
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
        store.setFeeConfiguration(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("feeConfigurations.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchFeeConfigurations = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchFeeConfigurationsMutation.mutate({ body: searchParams })
  }

  const getFeeConfigurationQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiFeeConfigurationByIdOptions({ path: { id } }),
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
    ...getApiFeeConfigurationDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createFeeConfigurationMutation = useMutation({
    ...postApiFeeConfigurationMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("feeConfigurations.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: feeConfigurationQueryKeys.lists() })
      searchFeeConfigurations()
    },
    onError: (error) => {
      const message = error.message || t("feeConfigurations.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateFeeConfiguration = (data: any) => {
    createFeeConfigurationMutation.mutate({ body: data })
  }

  const updateFeeConfigurationMutation = useMutation({
    ...putApiFeeConfigurationMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("feeConfigurations.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: feeConfigurationQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("feeConfigurations.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateFeeConfiguration = (data: any) => {
    updateFeeConfigurationMutation.mutate({ body: data })
  }

  // Helper functions with validation
  const createFeeConfigurationWithValidation = (data: CreateFeeConfigurationRequest, setError: UseFormSetError<CreateFeeConfigurationRequest>, onSuccess?: () => void) => {
    createFeeConfigurationMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toast.success(t("feeConfigurations.messages.create.success"))
          queryClient.invalidateQueries({ queryKey: feeConfigurationQueryKeys.lists() })
          searchFeeConfigurations()
          onSuccess?.()
        },
        onError: (error: any) => {
          const mapped = mapValidationErrorsToForm(error, setError)
          if (!mapped) {
            const message = error.message || t("feeConfigurations.messages.create.error")
            store.setError(message)
            toast.error(message)
          }
        },
      },
    )
  }

  const updateFeeConfigurationWithValidation = (data: UpdateFeeConfigurationRequest, setError: UseFormSetError<UpdateFeeConfigurationRequest>, onSuccess?: () => void) => {
    updateFeeConfigurationMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toast.success(t("feeConfigurations.messages.update.success"))
          queryClient.invalidateQueries({ queryKey: feeConfigurationQueryKeys.lists() })
          onSuccess?.()
        },
        onError: (error: any) => {
          const mapped = mapValidationErrorsToForm(error, setError)
          if (!mapped) {
            const message = error.message || t("feeConfigurations.messages.update.error")
            store.setError(message)
            toast.error(message)
          }
        },
      },
    )
  }

  const deleteFeeConfigurationMutation = useMutation({
    ...deleteApiFeeConfigurationByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("feeConfigurations.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: feeConfigurationQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("feeConfigurations.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteFeeConfiguration = (id: string) => {
    deleteFeeConfigurationMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiFeeConfigurationByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("feeConfigurations.bulk.deleteReason") },
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
        toast.success(t("feeConfigurations.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: feeConfigurationQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("feeConfigurations.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("feeConfigurations.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteFeeConfiguration = (id: string) => {
    onDeleteFeeConfiguration(id)
  }

  const search = () => {
    searchFeeConfigurations()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchFeeConfigurations()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchFeeConfigurations()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchFeeConfigurations()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchFeeConfigurations()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchFeeConfigurations()
  }
  const refreshData = () => {
    searchFeeConfigurations()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchFeeConfigurationsMutation,
    createMutation: createFeeConfigurationMutation,
    updateMutation: updateFeeConfigurationMutation,
    deleteMutation: deleteFeeConfigurationMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getFeeConfigurationQuery,
    searchFeeConfigurations,
    onCreateFeeConfiguration,
    onUpdateFeeConfiguration,
    onDeleteFeeConfiguration,
    createFeeConfigurationWithValidation,
    updateFeeConfigurationWithValidation,
    search,
    changePage,
    changePageSize,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteFeeConfiguration,
    hasData: store.feeConfigurations.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchFeeConfigurationsMutation.isPending || store.isLoading,
    isError: searchFeeConfigurationsMutation.isError,
    error: searchFeeConfigurationsMutation.error || store.error,
  }
}
