import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useUserDeviceStore } from "../stores/userDeviceStore"
import { SortDirection } from "@/shared/enums/data-grid"
import { postApiUserDeviceSearchMutation, getApiUserDeviceByIdOptions } from "@/shared/api/@tanstack/react-query.gen"

export const userDeviceQueryKeys = {
  all: ["userDevice"] as const,
  lists: () => [...userDeviceQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...userDeviceQueryKeys.lists(), { filters }] as const,
  details: () => [...userDeviceQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...userDeviceQueryKeys.details(), id] as const,
  dropdown: (params?: Record<string, any>) => [...userDeviceQueryKeys.all, "dropdown", { params }] as const,
}

export const useUserDevice = () => {
  const { t } = useTranslation()
  const store = useUserDeviceStore()

  const searchUserDevicesMutation = useMutation({
    ...postApiUserDeviceSearchMutation({
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
        store.setUserDevice(items)
        const total = (data.metadata?.totalItems || items.length) as number
        const totalPages = Math.ceil(total / store.pageSize)
        store.setPaginationData(total, totalPages)
      }
    },
    onError: (error) => {
      const message = error.message || t("userDevices.messages.search.error")
      store.setError(message)
      toast.error(message)
    },
    onSettled: () => {
      store.setLoading(false)
    },
  })

  const searchUserDevices = () => {
    const searchParams = {
      pageNumber: store.currentPage,
      pageSize: store.pageSize,
      sortBy: store.sortBy || undefined,
      sortDirection: store.sortDirection || undefined,
      ...store.filters,
    }
    searchUserDevicesMutation.mutate({ body: searchParams })
  }

  const getUserDeviceQuery = (id: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiUserDeviceByIdOptions({ path: { id } }),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          store.setSelectedItem(data.data)
        }
        return data
      },
    })

  const search = () => {
    searchUserDevices()
  }
  const changePage = (page: number) => {
    store.setCurrentPage(page)
    searchUserDevices()
  }
  const changePageSize = (size: number) => {
    store.setPageSize(size)
    searchUserDevices()
  }
  const changeSort = (sortBy: string | null, direction: SortDirection | null) => {
    store.setSorting(sortBy, direction)
    searchUserDevices()
  }
  const applyFilters = (filters: Partial<typeof store.filters>) => {
    store.setFilters(filters)
    searchUserDevices()
  }
  const clearFilters = () => {
    store.clearFilters()
    searchUserDevices()
  }
  const refreshData = () => {
    searchUserDevices()
  }

  return {
    ...store,
    getUserDeviceQuery,
    searchUserDevices,
    search,
    changePage,
    changePageSize,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
    hasData: store.userDevices.length > 0,
    hasSelection: store.selectedRows.length > 0,
    isLoading: searchUserDevicesMutation.isPending || store.isLoading,
    isError: searchUserDevicesMutation.isError,
    error: searchUserDevicesMutation.error || store.error,
  }
}
