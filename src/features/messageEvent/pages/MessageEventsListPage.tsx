import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchMessageEventRequest } from "@/shared/api/types.gen"
import { zSearchMessageEventRequest } from "@/shared/api/zod.gen"
import { MessageEventDataGrid } from "../components/MessageEventDataGrid"
import { useMessageEventList } from "../hooks/useMessageEventList"
import { useMessageEventMutations } from "../hooks/useMessageEventMutations"

export function MessageEventsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    messageEvents,
    paginationMetadata,
    isLoading,
    viewMode,
    selectedRows,
    sortBy,
    sortDirection,
    setViewMode,
    setSelectedRows,
    clearSelection,
    changePage,
    changePageSize,
    changeSort,
    applyFilters,
    clearFilters,
    refreshData,
  } = useMessageEventList()

  const { deleteMutation, bulkDeleteMutation } = useMessageEventMutations()

  const handleCreate = () => {
    navigate({ to: `/messageEvent/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("messageEvent.title")}
          addButtonText={t("messageEvent.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("messageEvent.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchMessageEventRequest>
          schema={zSearchMessageEventRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="messageEvent"
        />
      }
      content={
        <MessageEventDataGrid
          messageEvents={messageEvents}
          paginationMetadata={paginationMetadata}
          isLoading={isLoading}
          viewMode={viewMode}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onPageChange={handlePageChange}
          onSortChange={changeSort}
          onDelete={(id) => deleteMutation.mutate({ path: { id } })}
          onBulkDelete={() => bulkDeleteMutation.mutate(selectedRows)}
          isDeleting={deleteMutation.isPending || bulkDeleteMutation.isPending}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      }
    />
  )
}
