import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchCompanyAppLimitRequest } from "@/shared/api/types.gen"
import { zSearchCompanyAppLimitRequest } from "@/shared/api/zod.gen"
import { CompanyAppLimitDataGrid } from "../components/CompanyAppLimitDataGrid"
import { useCompanyAppLimit } from "../hooks/useCompanyAppLimit"

export function CompanyAppLimitsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { totalItems, applyFilters, clearFilters, viewMode, setViewMode, refreshData, isLoading, hasSelection, selectedRows } = useCompanyAppLimit()

  const handleCreate = () => {
    navigate({ to: `/administration/company-app-limits/add` })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("companyAppLimits.title")}
          totalCountText={t("companyAppLimits.totalCount", { count: totalItems })}
          addButtonText={t("companyAppLimits.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("companyAppLimits.title") }]}
          totalItems={totalItems}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchCompanyAppLimitRequest>
          schema={zSearchCompanyAppLimitRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="companyAppLimits"
        />
      }
      content={<CompanyAppLimitDataGrid />}
    />
  )
}
