import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useApplicationListStore } from "../stores/applicationListStore"
import { postApiApplicationSearchOptions } from "@/shared/api/@tanstack/react-query.gen"
import { useEffect } from "react"
import { toast } from "sonner"

export const useApplicationList = () => {
    const { t } = useTranslation()
    const { filters, viewMode, pageSize, currentPage, setFilters, clearFilters, setViewMode, setPageSize, setCurrentPage } =
        useApplicationListStore()

    // Prepare request body
    const requestBody = {
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: filters.searchTerm,
        ids: filters.ids,
        companyId: filters.companyId,
        status: filters.status,
    }

    // Use Query for Search
    const query = useQuery({
        ...postApiApplicationSearchOptions({
            body: requestBody,
        }),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Handle errors
    useEffect(() => {
        if (query.isError) {
            toast.error(t("applications.messages.search.error"))
        }
    }, [query.isError, query.error, t])

    // Computed data
    const applications = query.data?.data?.items || []

    // Extract full pagination metadata
    const paginationMetadata = query.data?.data
        ? {
            totalCount: query.data.data.totalCount ?? 0,
            totalPages: query.data.data.totalPages ?? 0,
            pageNumber: query.data.data.pageNumber ?? currentPage,
            pageSize: query.data.data.pageSize ?? pageSize,
            startIndex: query.data.data.startIndex,
            endIndex: query.data.data.endIndex,
            hasPreviousPage: query.data.data.hasPreviousPage,
            hasNextPage: query.data.data.hasNextPage,
            isFirstPage: query.data.data.isFirstPage,
            isLastPage: query.data.data.isLastPage,
        }
        : undefined

    return {
        // Data
        applications,
        paginationMetadata,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,

        // UI State
        viewMode,

        // Actions
        setViewMode,
        changePage: setCurrentPage,
        changePageSize: setPageSize,
        applyFilters: setFilters,
        clearFilters,
        refreshData: query.refetch,
    }
}
