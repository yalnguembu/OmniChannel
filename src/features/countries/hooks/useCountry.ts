import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useCountryStore } from "../stores/countryStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiCountrySearchMutation,
  getApiCountryDropdownOptions,
  postApiCountryMutation,
  putApiCountryMutation,
  deleteApiCountryByIdMutation,
  getApiCountryByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const countryQueryKeys = {
  all: ["country"] as const,
  lists: () => [...countryQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...countryQueryKeys.lists(), { filters }] as const,
  details: () => [...countryQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...countryQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...countryQueryKeys.all, "dropdown", { params }] as const,
}

export const useCountry = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useCountryStore()

  const searchCountrysMutation = useMutation({
    ...postApiCountrySearchMutation({
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
        store.setCountry(items)
        const total = data.data.totalCount || 0
        const totalPages = data.data.totalPages || 0
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("countries.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchCountries = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchCountrysMutation.mutate({ body: searchParams })
  }

  const getCountryQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiCountryByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const getDropdownQuery = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiCountryDropdownOptions(),
      staleTime: 10 * 60 * 1000,
    })

  const createCountryMutation = useMutation({
    ...postApiCountryMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("countries.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: countryQueryKeys.lists() })
      searchCountries()
    },
    onError: (error) => {
      const message = error.message || t("countries.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateCountry = (data: any) => {
    createCountryMutation.mutate({ body: data })
  }

  const updateCountryMutation = useMutation({
    ...putApiCountryMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("countries.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: countryQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("countries.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateCountry = (data: any) => {
    updateCountryMutation.mutate({ body: data })
  }

  const deleteCountryMutation = useMutation({
    ...deleteApiCountryByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("countries.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: countryQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("countries.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteCountry = (id: string) => {
    deleteCountryMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiCountryByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("countries.bulk.deleteReason") },
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
        toast.success(t("countries.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: countryQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("countries.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("countries.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })
  const deleteCountry = (id: string) => {
    onDeleteCountry(id)
  }
  const search = () => {
    searchCountries()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchCountries()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchCountries()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchCountries()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchCountries()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchCountries()
  }
  const refreshData = () => {
    searchCountries()
  }

  return {
    ...store,
    searchMutation: searchCountrysMutation,
    createMutation: createCountryMutation,
    updateMutation: updateCountryMutation,
    deleteMutation: deleteCountryMutation,
    bulkDeleteMutation,
    getDropdownQuery,
    getCountryQuery,
    searchCountries,
    onCreateCountry,
    onUpdateCountry,
    onDeleteCountry,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    deleteCountry,
    hasData: store.countrys.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchCountrysMutation.isPending || store.isLoading,
    isError: searchCountrysMutation.isError,
    error: searchCountrysMutation.error || store.error,
  }
}
