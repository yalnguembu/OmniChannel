import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useWebhookStore } from "../stores/webhookStore"
import { SortDirection } from "@/shared/enums/data-grid"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import type { UseFormSetError } from "react-hook-form"
import type { CreateWebhookRequest, UpdateWebhookRequest } from "@/shared/api/types.gen"
import {
  postApiWebhookSearchMutation,
  getApiWebhookDropdownOptions,
  postApiWebhookMutation,
  putApiWebhookMutation,
  deleteApiWebhookByIdMutation,
  getApiWebhookByIdOptions,
  getApiWebhookByIdQueryKey,
  getApiWebhookDetailByIdQueryKey,
  getApiWebhookDropdownQueryKey,
  postApiWebhookLogSearchQueryKey,
  postApiWebhookSearchQueryKey,
  getApiWebhookGetWebhookSecretByIdOptions,
  patchApiWebhookRenegereWebhookSecretByIdMutation,
} from "@/shared/api/@tanstack/react-query.gen"
import { SearchWebhookResponseIPagedListFujiPayApiResponse } from "@/shared/api/types.gen"

const getWebhookSearchQueryKey = (cacheKey: string) => ["webhook", "search", cacheKey]

const isSuccessResponse = (response: any): boolean => {
  return response?.success === true
}

const isValidSearchResponse = (data: any): data is SearchWebhookResponseIPagedListFujiPayApiResponse => {
  return data !== null && typeof data === "object" && typeof data.success === "boolean" && Array.isArray(data.data)
}

export const useWebhook = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useWebhookStore()

  const { createQueryErrorConfig, mapValidationErrorsToForm } = useErrorHandling()

  const searchWebhooksMutation = useMutation({
    ...postApiWebhookSearchMutation({
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
    onSuccess: (data, variables) => {
      if (isSuccessResponse(data) && data?.data) {
        const items = Array.isArray(data.data.items) ? data.data.items : []
        store.setWebhook(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)

        const cacheKey = JSON.stringify(variables.body)
        queryClient.setQueryData<SearchWebhookResponseIPagedListFujiPayApiResponse>(getWebhookSearchQueryKey(cacheKey), data as SearchWebhookResponseIPagedListFujiPayApiResponse)
      }
    },
    onError: () =>
      createErrorHandler({
        toastMessage: t("webhooks.messages.search.error"),
        storeError: (message) => store.setError(message),
      }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchWebhooks = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }

    const cacheKey = JSON.stringify(searchParams)

    const cachedData = queryClient.getQueryData<SearchWebhookResponseIPagedListFujiPayApiResponse>(getWebhookSearchQueryKey(cacheKey))

    if (isValidSearchResponse(cachedData) && cachedData.success === true) {
      store.setLoading(true)
      setTimeout(() => {
        if (cachedData.data) {
          const items = Array.isArray(cachedData.data) ? cachedData.data : []
          store.setWebhook(items)
          const total = (cachedData.metadata?.totalItems || items.length) as number
          const totalPages = data.data.totalPages || 0
          store.setPaginationData(total, totalPages)
        }
        store.setLoading(false)
      }, 0)

      setTimeout(() => {
        searchWebhooksMutation.mutate({ body: searchParams })
      }, 100)
    } else {
      searchWebhooksMutation.mutate({ body: searchParams })
    }
  }

  const getWebhookQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiWebhookByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      select: (data) => {
        if (data.success === true && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
      ...createQueryErrorConfig({
        toastMessage: t("webhooks.messages.fetch.error"),
        storeError: (message) => store.setError(message),
      }),
    })

  const dropdownQuery = useQuery({
    ...getApiWebhookDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...createQueryErrorConfig({
      toastMessage: t("webhooks.messages.dropdown.error"),
      showToast: false,
    }),
  })

  const getApiWebhookGetWebhookSecretById = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiWebhookGetWebhookSecretByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })

  const regenerateWebhookSecretByIdMutation = useMutation({
    ...patchApiWebhookRenegereWebhookSecretByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onError: (error) => {
      const message = error.message || t("applications.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const regenerateWebhookSecretById = (id: string) => {
    regenerateWebhookSecretByIdMutation.mutate({ path: { id } })
  }

  const createWebhookMutation = useMutation({
    ...postApiWebhookMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("webhooks.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: getApiWebhookDropdownQueryKey() })
      queryClient.invalidateQueries({ queryKey: postApiWebhookSearchQueryKey() })
      queryClient.invalidateQueries({ queryKey: ["webhook", "search"] })
      searchWebhooks()
    },
    onError: () =>
      createErrorHandler({
        toastMessage: t("webhooks.messages.create.error"),
        storeError: (message) => store.setError(message),
      }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateWebhook = (data: any) => {
    createWebhookMutation.mutate({ body: data })
  }

  const updateWebhookMutation = useMutation({
    ...putApiWebhookMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("webhooks.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: postApiWebhookSearchQueryKey() })
      queryClient.invalidateQueries({ queryKey: ["webhook", "search"] })

      if (result.success === true && variables.body?.id) {
        const id = variables.body.id
        queryClient.invalidateQueries({ queryKey: getApiWebhookByIdQueryKey({ path: { id } }) })
        queryClient.invalidateQueries({ queryKey: getApiWebhookDetailByIdQueryKey({ path: { id } }) })
        store.updateItem(id, variables.body)
      }

      queryClient.invalidateQueries({ queryKey: getApiWebhookDropdownQueryKey() })
    },
    onError: () =>
      createErrorHandler({
        toastMessage: t("webhooks.messages.update.error"),
        storeError: (message) => store.setError(message),
      }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateWebhook = (data: any) => {
    updateWebhookMutation.mutate({ body: data })
  }

  // Helper functions with validation
  const createWebhookWithValidation = (data: CreateWebhookRequest, setError: UseFormSetError<CreateWebhookRequest>, onSuccess?: () => void) => {
    createWebhookMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toast.success(t("webhooks.messages.create.success"))
          queryClient.invalidateQueries({ queryKey: getApiWebhookDropdownQueryKey() })
          queryClient.invalidateQueries({ queryKey: postApiWebhookSearchQueryKey() })
          queryClient.invalidateQueries({ queryKey: ["webhook", "search"] })
          searchWebhooks()
          onSuccess?.()
        },
        onError: (error: any) => {
          const mapped = mapValidationErrorsToForm(error, setError)
          if (!mapped) {
            const message = error.message || t("webhooks.messages.create.error")
            store.setError(message)
            toast.error(message)
          }
        },
      },
    )
  }

  const updateWebhookWithValidation = (data: UpdateWebhookRequest, setError: UseFormSetError<UpdateWebhookRequest>, onSuccess?: () => void) => {
    updateWebhookMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toast.success(t("webhooks.messages.update.success"))
          queryClient.invalidateQueries({ queryKey: postApiWebhookSearchQueryKey() })
          queryClient.invalidateQueries({ queryKey: ["webhook", "search"] })
          if (data.id) {
            queryClient.invalidateQueries({ queryKey: getApiWebhookByIdQueryKey({ path: { id: data.id } }) })
            queryClient.invalidateQueries({ queryKey: getApiWebhookDetailByIdQueryKey({ path: { id: data.id } }) })
          }
          queryClient.invalidateQueries({ queryKey: getApiWebhookDropdownQueryKey() })
          onSuccess?.()
        },
        onError: (error: any) => {
          const mapped = mapValidationErrorsToForm(error, setError)
          if (!mapped) {
            const message = error.message || t("webhooks.messages.update.error")
            store.setError(message)
            toast.error(message)
          }
        },
      },
    )
  }

  const deleteWebhookMutation = useMutation({
    ...deleteApiWebhookByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("webhooks.messages.delete.success"))

      queryClient.invalidateQueries({ queryKey: postApiWebhookSearchQueryKey() })
      queryClient.invalidateQueries({ queryKey: ["webhook", "search"] })

      if (variables.path?.id) {
        const id = variables.path.id
        queryClient.removeQueries({ queryKey: getApiWebhookByIdQueryKey({ path: { id } }) })
        queryClient.removeQueries({ queryKey: getApiWebhookDetailByIdQueryKey({ path: { id } }) })
        queryClient.invalidateQueries({ queryKey: postApiWebhookLogSearchQueryKey() })
        store.removeItem(id)
      }

      queryClient.invalidateQueries({ queryKey: getApiWebhookDropdownQueryKey() })
    },
    onError: () =>
      createErrorHandler({
        toastMessage: t("webhooks.messages.delete.error"),
        storeError: (message) => store.setError(message),
      }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteWebhook = (id: string) => {
    deleteWebhookMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiWebhookByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("webhooks.bulk.deleteReason") },
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
        toast.success(t("webhooks.messages.delete.success", { count: successCount }))

        queryClient.invalidateQueries({ queryKey: postApiWebhookSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["webhook", "search"] })

        variables.forEach((id: string) => {
          queryClient.removeQueries({ queryKey: getApiWebhookByIdQueryKey({ path: { id } }) })
          queryClient.removeQueries({ queryKey: getApiWebhookDetailByIdQueryKey({ path: { id } }) })
          store.removeItem(id)
        })

        queryClient.invalidateQueries({ queryKey: postApiWebhookLogSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: getApiWebhookDropdownQueryKey() })
        store.clearSelection()
      }

      if (failureCount > 0) {
        toast.error(t("webhooks.bulk.partialError", { count: failureCount }))
      }
    },
    onError: createErrorHandler({
      toastMessage: t("webhooks.bulk.deleteError"),
      storeError: (message) => store.setError(message),
    }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteWebhook = (id: string) => {
    onDeleteWebhook(id)
  }

  const search = () => {
    searchWebhooks()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchWebhooks()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchWebhooks()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchWebhooks()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchWebhooks()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchWebhooks()
  }
  const refreshData = () => {
    searchWebhooks()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchWebhooksMutation,
    createMutation: createWebhookMutation,
    updateMutation: updateWebhookMutation,
    deleteMutation: deleteWebhookMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getWebhookQuery,
    searchWebhooks,
    onCreateWebhook,
    onUpdateWebhook,
    onDeleteWebhook,
    createWebhookWithValidation,
    updateWebhookWithValidation,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteWebhook,
    hasData: store.webhooks.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchWebhooksMutation.isPending || store.isLoading,
    isError: searchWebhooksMutation.isError,
    error: searchWebhooksMutation.error || store.error,
    getApiWebhookGetWebhookSecretById,
    regenerateWebhookSecretById,
  }
}
