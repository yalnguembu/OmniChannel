import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchNotificationRequest } from "@/shared/api/types.gen"
import { zSearchNotificationRequest } from "@/shared/api/zod.gen"
import { NotificationDataGrid } from "../components/NotificationDataGrid"
import { useNotificationList } from "../hooks/useNotificationList"
import { useNotificationMutations } from "../hooks/useNotificationMutations"

export function NotificationsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    notifications,
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
  } = useNotificationList()

  const { deleteMutation, bulkDeleteMutation } = useNotificationMutations()

  const handleCreate = () => {
    navigate({ to: `/notification/add` })
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("notification.title")}
          addButtonText={t("notification.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("notification.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchNotificationRequest>
          schema={zSearchNotificationRequest}
          onFilter={(f) => { applyFilters(f); clearSelection(); }}
          onReset={() => { clearFilters(); clearSelection(); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={(selectedRows?.length ?? 0) > 0}
          selectedRows={selectedRows ?? []}
          selectionCount={selectedRows?.length ?? 0}
          fieldTranslationPrefix="notification"
        />
      }
      content={
        <NotificationDataGrid
          notifications={notifications}
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
