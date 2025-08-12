import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { ApplicationDataGrid } from "../components/ApplicationDataGrid"
import { useApplication } from "../hooks/useApplication"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchApplicationRequest } from "@/shared/api/zod.gen"
import { SearchApplicationRequest } from "@/shared"

export function ApplicationsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useApplication()

  const handleCreate = () => {
    navigate({ to: `/applications/add` })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("applications.title")}
          totalCountText={t("applications.totalCount", { count: totalItems })}
          addButtonText={t("applications.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("applications.title") }]}
          totalItems={totalItems}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchApplicationRequest>
          schema={zSearchApplicationRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="applications"
        />
      }
      content={<ApplicationDataGrid />}
    />
  )
}
