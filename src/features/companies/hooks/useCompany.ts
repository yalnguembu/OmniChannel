import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useCompanyStore } from "../stores/companyStore"
import { SortDirection } from "@/shared/enums/data-grid"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
  postApiCompanySearchMutation,
  getApiCompanyDropdownOptions,
  postApiCompanyMutation,
  putApiCompanyMutation,
  deleteApiCompanyByIdMutation,
  getApiCompanyByIdOptions,
  getApiCompanyByIdQueryKey,
  getApiCompanyDetailByIdQueryKey,
  getApiCompanyDropdownQueryKey,
  postApiCompanySearchQueryKey,
  getApiCompanyGetAllStatusOptions,
  getApiCompanyGetAllTypeOptions,
  // postApiDailyMetricSearchMutation,
} from "@/shared/api/@tanstack/react-query.gen"
import { SearchCompanyResponseIPagedListFujiPayApiResponse, CreateCompanyRequest, UpdateCompanyRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

const getCompanySearchQueryKey = (cacheKey: string) => ["company", "search", cacheKey]

const isSuccessResponse = (response: any): boolean => {
  return response?.success === true
}

const isValidSearchResponse = (data: any): data is SearchCompanyResponseIPagedListFujiPayApiResponse => {
  return data !== null && typeof data === "object" && typeof data.success === "boolean" && Array.isArray(data.data)
}

export const useCompany = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useCompanyStore()

  const { createQueryErrorConfig, mapValidationErrorsToForm } = useErrorHandling()

  const searchCompanysMutation = useMutation({
    ...postApiCompanySearchMutation({
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
        store.setCompany(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)

        const cacheKey = JSON.stringify(variables.body)
        queryClient.setQueryData<SearchCompanyResponseIPagedListFujiPayApiResponse>(getCompanySearchQueryKey(cacheKey), data as SearchCompanyResponseIPagedListFujiPayApiResponse)
      }
    },
    onError: () =>
      createErrorHandler({
        toastMessage: t("companies.messages.search.error"),
        storeError: (message) => store.setError(message),
      }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchCompanys = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }

    const cacheKey = JSON.stringify(searchParams)

    const cachedData = queryClient.getQueryData<SearchCompanyResponseIPagedListFujiPayApiResponse>(getCompanySearchQueryKey(cacheKey))

    if (isValidSearchResponse(cachedData) && cachedData.success === true) {
      store.setLoading(true)
      setTimeout(() => {
        if (cachedData.data) {
          const items = Array.isArray(cachedData.data) ? cachedData.data : []
          store.setCompany(items)
          const total = (cachedData.metadata?.totalItems || items.length) as number
          const totalPages = data.data.totalPages || 0
          store.setPaginationData(total, totalPages)
        }
        store.setLoading(false)
      }, 0)

      setTimeout(() => {
        searchCompanysMutation.mutate({ body: searchParams })
      }, 100)
    } else {
      searchCompanysMutation.mutate({ body: searchParams })
    }
  }

  const getCompanyQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiCompanyByIdOptions({ path: { id } }),
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
        toastMessage: t("companies.messages.fetch.error"),
        storeError: (message) => store.setError(message),
      }),
    })

  const getAllCompanyStatusQuery = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiCompanyGetAllStatusOptions(),
    })

  const getAllCompanyTypesQuery = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiCompanyGetAllTypeOptions(),
    })

  const dropdownQuery = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiCompanyDropdownOptions(),
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: "always",
      refetchOnWindowFocus: false,
      ...createQueryErrorConfig({
        toastMessage: t("companies.messages.dropdown.error"),
        showToast: false,
      }),
    })

  const createCompanyMutation = useMutation({
    ...postApiCompanyMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("companies.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: getApiCompanyDropdownQueryKey() })
      queryClient.invalidateQueries({ queryKey: postApiCompanySearchQueryKey() })
      queryClient.invalidateQueries({ queryKey: ["company", "search"] })
      searchCompanys()
    },
    onError: () =>
      createErrorHandler({
        toastMessage: t("companies.messages.create.error"),
        storeError: (message) => store.setError(message),
      }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateCompany = (data: any) => {
    createCompanyMutation.mutate({ body: data })
  }

  const updateCompanyMutation = useMutation({
    ...putApiCompanyMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("companies.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: postApiCompanySearchQueryKey() })
      queryClient.invalidateQueries({ queryKey: ["company", "search"] })

      if (result.success === true && variables.body?.id) {
        const id = variables.body.id
        queryClient.invalidateQueries({ queryKey: getApiCompanyByIdQueryKey({ path: { id } }) })
        queryClient.invalidateQueries({ queryKey: getApiCompanyDetailByIdQueryKey({ path: { id } }) })
        store.updateItem(id, variables.body)
      }

      queryClient.invalidateQueries({ queryKey: getApiCompanyDropdownQueryKey() })
    },
    onError: () =>
      createErrorHandler({
        toastMessage: t("companies.messages.update.error"),
        storeError: (message) => store.setError(message),
      }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateCompany = (data: any) => {
    updateCompanyMutation.mutate({ body: data })
  }

  // Helper function for creating company with form validation
  const createCompanyWithValidation = (data: CreateCompanyRequest, setError: UseFormSetError<CreateCompanyRequest>, onSuccess?: () => void) => {
    createCompanyMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toast.success(t("companies.messages.create.success"))
          queryClient.invalidateQueries({ queryKey: getApiCompanyDropdownQueryKey() })
          queryClient.invalidateQueries({ queryKey: postApiCompanySearchQueryKey() })
          queryClient.invalidateQueries({ queryKey: ["company", "search"] })
          searchCompanys()
          onSuccess?.()
        },
        onError: (error: any) => {
          // Try to map validation errors to form fields
          const mapped = mapValidationErrorsToForm(error, setError)

          // If no validation errors were mapped, show the error via toast
          if (!mapped) {
            const message = error.message || t("companies.messages.create.error")
            store.setError(message)
            toast.error(message)
          }
        },
      },
    )
  }

  // Helper function for updating company with form validation
  const updateCompanyWithValidation = (data: UpdateCompanyRequest, setError: UseFormSetError<UpdateCompanyRequest>, onSuccess?: () => void) => {
    updateCompanyMutation.mutate(
      { body: data },
      {
        onSuccess: (result, variables) => {
          toast.success(t("companies.messages.update.success"))
          queryClient.invalidateQueries({ queryKey: postApiCompanySearchQueryKey() })
          queryClient.invalidateQueries({ queryKey: ["company", "search"] })

          if (result.success === true && variables.body?.id) {
            const id = variables.body.id
            queryClient.invalidateQueries({ queryKey: getApiCompanyByIdQueryKey({ path: { id } }) })
            queryClient.invalidateQueries({ queryKey: getApiCompanyDetailByIdQueryKey({ path: { id } }) })
            store.updateItem(id, variables.body)
          }

          queryClient.invalidateQueries({ queryKey: getApiCompanyDropdownQueryKey() })
          onSuccess?.()
        },
        onError: (error: any) => {
          // Try to map validation errors to form fields
          const mapped = mapValidationErrorsToForm(error, setError)

          // If no validation errors were mapped, show the error via toast
          if (!mapped) {
            const message = error.message || t("companies.messages.update.error")
            store.setError(message)
            toast.error(message)
          }
        },
      },
    )
  }

  const deleteCompanyMutation = useMutation({
    ...deleteApiCompanyByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("companies.messages.delete.success"))

      queryClient.invalidateQueries({ queryKey: postApiCompanySearchQueryKey() })
      queryClient.invalidateQueries({ queryKey: ["company", "search"] })

      if (variables.path?.id) {
        const id = variables.path.id
        queryClient.removeQueries({ queryKey: getApiCompanyByIdQueryKey({ path: { id } }) })
        queryClient.removeQueries({ queryKey: getApiCompanyDetailByIdQueryKey({ path: { id } }) })
        store.removeItem(id)
      }

      queryClient.invalidateQueries({ queryKey: getApiCompanyDropdownQueryKey() })
    },
    onError: () =>
      createErrorHandler({
        toastMessage: t("companies.messages.delete.error"),
        storeError: (message) => store.setError(message),
      }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteCompany = (id: string) => {
    deleteCompanyMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiCompanyByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("companies.bulk.deleteReason") },
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
        toast.success(t("companies.messages.delete.success", { count: successCount }))

        queryClient.invalidateQueries({ queryKey: postApiCompanySearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["company", "search"] })

        variables.forEach((id: string) => {
          queryClient.removeQueries({ queryKey: getApiCompanyByIdQueryKey({ path: { id } }) })
          queryClient.removeQueries({ queryKey: getApiCompanyDetailByIdQueryKey({ path: { id } }) })
          store.removeItem(id)
        })

        queryClient.invalidateQueries({ queryKey: getApiCompanyDropdownQueryKey() })
        store.clearSelection()
      }

      if (failureCount > 0) {
        toast.error(t("companies.bulk.partialError", { count: failureCount }))
      }
    },
    onError: () =>
      createErrorHandler({
        toastMessage: t("companies.bulk.deleteError"),
        storeError: (message) => store.setError(message),
      }),
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteCompany = (id: string) => {
    onDeleteCompany(id)
  }

  const search = () => {
    searchCompanys()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchCompanys()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchCompanys()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchCompanys()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchCompanys()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchCompanys()
  }
  const refreshData = () => {
    searchCompanys()
  }

  const enableDropdownQuery = () => {
    dropdownQuery()
  }

  // const getMetricsByCompanyId = (id: string) => {}
  //  useQuery({
  // ...getApiDailyMetricByIdOptions({
  //   path:{},
  //   params:{}
  // }),
  // staleTime: 10 * 60 * 1000,
  // gcTime: 30 * 60 * 1000,
  // refetchOnMount: 'always',
  // refetchOnWindowFocus: false,
  // ...createQueryErrorConfig({
  //   toastMessage: t('company.messages.dropdown.error'),
  //   showToast: false
  // }),
  // })

  return {
    ...store,
    searchMutation: searchCompanysMutation,
    createMutation: createCompanyMutation,
    updateMutation: updateCompanyMutation,
    deleteMutation: deleteCompanyMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getCompanyQuery,
    getAllCompanyStatusQuery,
    getAllCompanyTypesQuery,
    searchCompanys,
    onCreateCompany,
    onUpdateCompany,
    onDeleteCompany,
    createCompanyWithValidation,
    updateCompanyWithValidation,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteCompany,
    hasData: store.companies.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchCompanysMutation.isPending || store.isLoading,
    isError: searchCompanysMutation.isError,
    error: searchCompanysMutation.error || store.error,
  }
}
