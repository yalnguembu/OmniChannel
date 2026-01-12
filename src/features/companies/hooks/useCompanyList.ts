import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useCompanyListStore } from "../stores/companyListStore"
import { postApiCompanySearchOptions } from "@/shared/api/@tanstack/react-query.gen"
import { useEffect } from "react"
import { toast } from "sonner"

export const useCompanyList = () => {
    const { t } = useTranslation()
    const store = useCompanyListStore()
    // Prepare request body
    const requestBody = {
        pageNumber: store.currentPage,
        pageSize: store.pageSize,
        sortBy: store.sortBy,
        sortDirection: store.sortDirection,
        ids: store.filters.ids,
        searchTerm: store.filters.searchTerm,
        createdFrom: store.filters.createdFrom || "",
        createdTo: store.filters.createdTo || "",
    }

    // Use Query for Search (instead of Mutation)
    const query = useQuery({
        ...postApiCompanySearchOptions({
            body: requestBody,
        }),
        // Keep previous data while fetching new page for smooth transition
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Handle errors (monitoring only, UI displays via isError state)
    useEffect(() => {
        if (query.isError) {
            toast.error(t("companies.messages.search.error"))
        }
    }, [query.isError, query.error, t])

    // Computed data
    const companies = query.data?.data?.items || []

    // Extract full pagination metadata
    // Based on user provided structure: 
    // { items, pageNumber, pageSize, totalCount, totalPages, startIndex, endIndex, hasPreviousPage, hasNextPage, isFirstPage, isLastPage, count, isEmpty }
    const paginationMetadata = query.data?.data ? {
        totalCount: query.data.data.totalCount ?? 0,
        totalPages: query.data.data.totalPages ?? 0,
        pageNumber: query.data.data.pageNumber ?? store.currentPage,
        pageSize: query.data.data.pageSize ?? store.pageSize,
        startIndex: query.data.data.startIndex,
        endIndex: query.data.data.endIndex,
        hasPreviousPage: query.data.data.hasPreviousPage,
        hasNextPage: query.data.data.hasNextPage,
        isFirstPage: query.data.data.isFirstPage,
        isLastPage: query.data.data.isLastPage
    } : undefined

    return {
        // Data
        companies,
        paginationMetadata,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,

        // UI State & Actions (delegated to store)
        viewMode: store.viewMode,
        isFilterCollapsed: store.isFilterCollapsed,
        selectedRows: store.selectedRows,
        sortBy: store.sortBy,
        sortDirection: store.sortDirection,

        // Actions
        setViewMode: store.setViewMode,
        toggleFilter: store.toggleFilter,
        setSelectedRows: store.setSelectedRows,
        clearSelection: store.clearSelection,

        changePage: store.setCurrentPage,
        changePageSize: store.setPageSize,
        changeSort: store.setSorting,
        applyFilters: store.setFilters,
        clearFilters: store.clearFilters,
        refreshData: query.refetch
    }
}
