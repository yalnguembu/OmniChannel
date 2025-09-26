import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useApplicationStore } from "../stores/applicationStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiApplicationSearchMutation,
  getApiApplicationDropdownOptions,
  postApiApplicationMutation,
  putApiApplicationMutation,
  deleteApiApplicationByIdMutation,
  getApiApplicationByIdOptions,
  getApiApplicationGetApiKeyByIdOptions,
  patchApiApplicationRenegereApiSecretByIdMutation,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateApplicationRequest, UpdateApplicationRequest } from "@/shared"

export const applicationQueryKeys = {
  all: ["application"] as const,
  lists: () => [...applicationQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...applicationQueryKeys.lists(), { filters }] as const,
  details: () => [...applicationQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...applicationQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...applicationQueryKeys.all, "dropdown", { params }] as const,
}

export const useApplication = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useApplicationStore()

  const searchApplicationsMutation = useMutation({
    ...postApiApplicationSearchMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        const items = Array.isArray(data.data) ? data.data : []
        store.setApplication(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
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

  const searchApplications = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchApplicationsMutation.mutate({ body: searchParams })
  }

  const searchApplicationsByCompany = (companyId: string) => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      companyId,
    }
    searchApplicationsMutation.mutate({ body: searchParams })
  }

  const getApplicationQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiApplicationByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const getApplicationKeysById = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiApplicationGetApiKeyByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })

  const regenerateApplicationSecretsMutation = useMutation({
    ...patchApiApplicationRenegereApiSecretByIdMutation(),
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

  const regenerateApplicationSecretsMutationById = (id: string) => {
    regenerateApplicationSecretsMutation.mutate({ path: { id } })
  }

  const dropdownQuery = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiApplicationDropdownOptions(),
      staleTime: 10 * 60 * 1000,
    })

  const createApplicationMutation = useMutation({
    ...postApiApplicationMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("applications.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.lists() })
      searchApplications()
    },
    onError: (error) => {
      const message = error.message || t("applications.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateApplication = (data: CreateApplicationRequest) => {
    createApplicationMutation.mutate({ body: data })
  }

  const updateApplicationMutation = useMutation({
    ...putApiApplicationMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("applications.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("applications.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateApplication = (data: UpdateApplicationRequest) => {
    updateApplicationMutation.mutate({ body: data })
  }

  const deleteApplicationMutation = useMutation({
    ...deleteApiApplicationByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("applications.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("applications.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteApplication = (id: string) => {
    deleteApplicationMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiApplicationByIdMutation().mutationFn?.({
            path: { id },
            query: { deletionReason: t("applications.bulk.deleteReason") },
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
        toast.success(t("applications.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: applicationQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("applications.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("applications.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteApplication = (id: string) => {
    onDeleteApplication(id)
  }

  const search = () => {
    searchApplications()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchApplications()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchApplications()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchApplications()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchApplications()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchApplications()
  }
  const refreshData = () => {
    searchApplications()
  }

  return {
    ...store,
    searchMutation: searchApplicationsMutation,
    createMutation: createApplicationMutation,
    updateMutation: updateApplicationMutation,
    deleteMutation: deleteApplicationMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getApplicationQuery,
    searchApplicationsByCompany,
    searchApplications,
    onCreateApplication,
    onUpdateApplication,
    onDeleteApplication,
    search,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    deleteApplication,
    hasData: store.applications.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchApplicationsMutation.isPending || store.isLoading,
    isError: searchApplicationsMutation.isError,
    error: searchApplicationsMutation.error || store.error,
    getApplicationKeysById,
    regenerateApplicationSecretsMutationById,
  }
}
