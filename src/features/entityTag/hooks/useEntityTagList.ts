import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useEntityTagListStore } from "../stores/entityTagListStore"
import { postApiEntityTagSearchOptions } from "@/shared/api/@tanstack/react-query.gen"
import { useEffect } from "react"
import { toast } from "sonner"

export const useEntityTagList = () => {
    const { t } = useTranslation()
    const store = useEntityTagListStore()
    
    const requestBody = {
        pageNumber: store.currentPage,
        pageSize: store.pageSize,
        sortBy: store.sortBy,
        sortDirection: store.sortDirection,
        ...store.filters,
    }

    const query = useQuery({
        ...postApiEntityTagSearchOptions({
            body: requestBody,
        }),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    useEffect(() => {
        if (query.isError) {
            toast.error(t("entityTag.messages.search.error"))
        }
    }, [query.isError, query.error, t])

    const entityTags = query.data?.data?.items || []

    const paginationMetadata = query.data?.data
        ? {
            totalCount: query.data.data.totalCount ?? 0,
            totalPages: query.data.data.totalPages ?? 0,
            pageNumber: query.data.data.pageNumber ?? store.currentPage,
            pageSize: query.data.data.pageSize ?? store.pageSize,
            startIndex: query.data.data.startIndex,
            endIndex: query.data.data.endIndex,
            hasPreviousPage: query.data.data.hasPreviousPage,
            hasNextPage: query.data.data.hasNextPage,
            isFirstPage: query.data.data.isFirstPage,
            isLastPage: query.data.data.isLastPage,
        }
        : undefined

    return {
        entityTags,
        paginationMetadata,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        viewMode: store.viewMode,
        isFilterCollapsed: store.isFilterCollapsed,
        selectedRows: store.selectedRows,
        sortBy: store.sortBy,
        sortDirection: store.sortDirection,
        setViewMode: store.setViewMode,
        toggleFilter: store.toggleFilter,
        setSelectedRows: store.setSelectedRows,
        clearSelection: store.clearSelection,
        changePage: store.setCurrentPage,
        changePageSize: store.setPageSize,
        changeSort: store.setSorting,
        applyFilters: store.setFilters,
        clearFilters: store.clearFilters,
        refreshData: query.refetch,
    }
}
