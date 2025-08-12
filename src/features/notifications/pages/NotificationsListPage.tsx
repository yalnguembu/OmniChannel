import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchNotificationRequest } from "@/shared/api/types.gen"
import { zSearchNotificationRequest } from "@/shared/api/zod.gen"
import { NotificationDataGrid } from "../components/NotificationDataGrid"
import { useNotification } from "../hooks/useNotification"

export function NotificationsListPage() {
  const { t } = useTranslation()
  const { isLoading, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useNotification()

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("notification.title")}
          totalCountText={t("notification.totalCount", { count: totalItems })}
          addButtonText={t("notification.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("notification.title") }]}
          totalItems={totalItems}
        />
      }
      filter={
        <BaseFilter<SearchNotificationRequest>
          schema={zSearchNotificationRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
        />
      }
      content={<NotificationDataGrid />}
    />
  )
}
