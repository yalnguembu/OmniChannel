import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useSettingStore } from "../stores/settingStore"
import { SortDirection } from "@/shared/enums/data-grid"
import {
  postApiSettingSearchMutation,
  getApiSettingDropdownOptions,
  postApiSettingMutation,
  putApiSettingMutation,
  deleteApiSettingByIdMutation,
  getApiSettingByIdOptions,
} from "@/shared/api/@tanstack/react-query.gen"

export const settingQueryKeys = {
  all: ["setting"] as const,
  lists: () => [...settingQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...settingQueryKeys.lists(), { filters }] as const,
  details: () => [...settingQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...settingQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...settingQueryKeys.all, "dropdown", { params }] as const,
}

export const useSetting = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const store = useSettingStore()

  const searchSettingsMutation = useMutation({
    ...postApiSettingSearchMutation({
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
        store.setSetting(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("settings.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchSettings = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchSettingsMutation.mutate({ body: searchParams })
  }

  const getSettingQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiSettingByIdOptions({ path: { id } }),
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
    ...getApiSettingDropdownOptions(),
    enabled: false,
    staleTime: 10 * 60 * 1000,
  })

  const createSettingMutation = useMutation({
    ...postApiSettingMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: () => {
      toast.success(t("settings.messages.create.success"))
      queryClient.invalidateQueries({ queryKey: settingQueryKeys.lists() })
      searchSettings()
    },
    onError: (error) => {
      const message = error.message || t("settings.messages.create.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onCreateSetting = (data: any) => {
    createSettingMutation.mutate({ body: data })
  }

  const updateSettingMutation = useMutation({
    ...putApiSettingMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (result, variables) => {
      toast.success(t("settings.messages.update.success"))
      queryClient.invalidateQueries({ queryKey: settingQueryKeys.lists() })
      if (result.success && variables.body?.id) {
        store.updateItem(variables.body.id, variables.body)
      }
    },
    onError: (error) => {
      const message = error.message || t("settings.messages.update.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onUpdateSetting = (data: any) => {
    updateSettingMutation.mutate({ body: data })
  }

  const deleteSettingMutation = useMutation({
    ...deleteApiSettingByIdMutation(),
    onMutate: () => {
      store.setLoading(true)
      store.setError(null)
    },
    onSuccess: (_, variables) => {
      toast.success(t("settings.messages.delete.success"))
      queryClient.invalidateQueries({ queryKey: settingQueryKeys.lists() })
      if (variables.path?.id) {
        store.removeItem(variables.path.id)
      }
    },
    onError: (error) => {
      const message = error.message || t("settings.messages.delete.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const onDeleteSetting = (id: string) => {
    deleteSettingMutation.mutate({ path: { id } })
  }

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) =>
          deleteApiSettingByIdMutation().mutationFn!({
            path: { id },
            query: { deletionReason: t("settings.bulk.deleteReason") },
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
        toast.success(t("settings.messages.delete.success", { count: successCount }))
        queryClient.invalidateQueries({ queryKey: settingQueryKeys.lists() })
        variables.forEach((id: string) => store.removeItem(id))
        store.clearSelection()
      }
      if (failureCount > 0) {
        toast.error(t("settings.bulk.partialError", { count: failureCount }))
      }
    },
    onError: (error) => {
      const message = error.message || t("settings.bulk.deleteError")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const deleteSetting = (id: string) => {
    onDeleteSetting(id)
  }

  const search = () => {
    searchSettings()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchSettings()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    console.log(size)

    // searchSettings()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchSettings()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchSettings()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchSettings()
  }
  const refreshData = () => {
    searchSettings()
  }
  const enableDropdownQuery = () => {
    dropdownQuery.refetch()
  }

  return {
    ...store,
    searchMutation: searchSettingsMutation,
    createMutation: createSettingMutation,
    updateMutation: updateSettingMutation,
    deleteMutation: deleteSettingMutation,
    bulkDeleteMutation,
    dropdownQuery,
    getSettingQuery,
    searchSettings,
    onCreateSetting,
    onUpdateSetting,
    onDeleteSetting,
    search,
    changePage,
    changePageSize,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    enableDropdownQuery,
    deleteSetting,
    hasData: store.settings.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchSettingsMutation.isPending || store.isLoading,
    isError: searchSettingsMutation.isError,
    error: searchSettingsMutation.error || store.error,
  }
}
