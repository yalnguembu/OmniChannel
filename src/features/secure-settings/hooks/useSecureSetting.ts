import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useSecureSettingStore } from "../stores/secureSettingStore"
import { SortDirection } from "@/shared/enums/data-grid"
import { postApiSecureSettingSearchMutation, postApiSecureSettingMutation, getApiSecureSettingGetBySystemeNameBySystemNameOptions } from "@/shared/api/@tanstack/react-query.gen"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import type { UseFormSetError } from "react-hook-form"
import type { SecureSettingRequest } from "@/shared/api/types.gen"

export const secureSettingQueryKeys = {
  all: ["secureSetting"] as const,
  lists: () => [...secureSettingQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...secureSettingQueryKeys.lists(), { filters }] as const,
  details: () => [...secureSettingQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...secureSettingQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...secureSettingQueryKeys.all, "dropdown", { params }] as const,
}

export const useSecureSetting = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useSecureSettingStore()
  const { mapValidationErrorsToForm } = useErrorHandling()

  const searchSecureSettingsMutation = useMutation({
    ...postApiSecureSettingSearchMutation({
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
        store.setSecureSetting(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("secureSettings.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchSecureSettings = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchSecureSettingsMutation.mutate({ body: searchParams })
  }

  const getSecureSettingBySystemNameQuery = (systemName: string) =>
    useQuery({
      ...getApiSecureSettingGetBySystemeNameBySystemNameOptions({ path: { systemName } }),
      staleTime: 5 * 60 * 1000,
    })

  const createSecureSettingMutation = useMutation({
    ...postApiSecureSettingMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("secureSettings.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: secureSettingQueryKeys.lists() })
      searchSecureSettings()
    },
    onError: (error) => {
      const message = error.message || t("secureSettings.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateSecureSetting = (data: any) => {
    createSecureSettingMutation.mutate({ body: data })
  }

  const updateSecureSettingMutation = useMutation({
    ...postApiSecureSettingMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("secureSettings.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: secureSettingQueryKeys.lists() })
      // if (result.success && variables.body?.id) {
      //   store.updateItem(variables.body.id, variables.body)
      // }
    },
    onError: (error) => {
      const message = error.message || t("secureSettings.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateSecureSetting = (data: any) => {
    updateSecureSettingMutation.mutate({ body: data })
  }

  // Helper functions with validation
  const createSecureSettingWithValidation = (data: SecureSettingRequest[], setError: UseFormSetError<any>, onSuccess?: () => void) => {
    createSecureSettingMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toast.success(t("secureSettings.messages.create.success"))
          queryClient.invalidateQueries({ queryKey: secureSettingQueryKeys.lists() })
          searchSecureSettings()
          onSuccess?.()
        },
        onError: (error: any) => {
          const mapped = mapValidationErrorsToForm(error, setError)
          if (!mapped) {
            const message = error.message || t("secureSettings.messages.create.error")
            store.setError(message)
            toast.error(message)
          }
        },
      },
    )
  }

  const updateSecureSettingWithValidation = (data: SecureSettingRequest[], setError: UseFormSetError<any>, onSuccess?: () => void) => {
    updateSecureSettingMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toast.success(t("secureSettings.messages.update.success"))
          queryClient.invalidateQueries({ queryKey: secureSettingQueryKeys.lists() })
          onSuccess?.()
        },
        onError: (error: any) => {
          const mapped = mapValidationErrorsToForm(error, setError)
          if (!mapped) {
            const message = error.message || t("secureSettings.messages.update.error")
            store.setError(message)
            toast.error(message)
          }
        },
      },
    )
  }

  const search = () => {
    searchSecureSettings()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchSecureSettings()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchSecureSettings()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchSecureSettings()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchSecureSettings()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchSecureSettings()
  }
  const refreshData = () => {
    searchSecureSettings()
  }

  return {
    ...store,
    searchMutation: searchSecureSettingsMutation,
    createMutation: createSecureSettingMutation,
    updateMutation: updateSecureSettingMutation,
    getSecureSettingBySystemNameQuery,
    searchSecureSettings,
    onCreateSecureSetting,
    onUpdateSecureSetting,
    createSecureSettingWithValidation,
    updateSecureSettingWithValidation,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    hasData: store.secureSettings.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchSecureSettingsMutation.isPending || store.isLoading,
    isError: searchSecureSettingsMutation.isError,
    error: searchSecureSettingsMutation.error || store.error,
  }
}
