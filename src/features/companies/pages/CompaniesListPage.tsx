import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchCompanyRequest } from "@/shared/api/types.gen"
import { zSearchCompanyRequest } from "@/shared/api/zod.gen"
import { CompanyDataGrid } from "../components/CompanyDataGrid"
import { useCompany } from "../hooks/useCompany"
import { useEffect } from "react"

export function CompanysListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, searchCompanys, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useCompany()

  useEffect(() => searchCompanys(), [])

  const handleCreate = () => {
    navigate({ to: "/companies/add" })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("companies.title")}
          totalCountText={t("companies.totalCount", { count: totalItems })}
          addButtonText={t("companies.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("companies.title") }]}
          totalItems={totalItems}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchCompanyRequest>
          schema={zSearchCompanyRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="companies"
        />
      }
      content={<CompanyDataGrid />}
    />
  )
}
