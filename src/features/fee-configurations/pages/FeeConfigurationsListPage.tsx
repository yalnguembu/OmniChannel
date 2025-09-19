import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
// import { toast } from "sonner"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchFeeConfigurationRequest } from "@/shared/api/types.gen"
import { zSearchFeeConfigurationRequest } from "@/shared/api/zod.gen"
import { FeeConfigurationDataGrid } from "../components/FeeConfigurationDataGrid"
import { useFeeConfiguration } from "../hooks/useFeeConfiguration"

export function FeeConfigurationsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useFeeConfiguration()

  const handleCreate = () => {
    navigate({ to: `/administration/fee-configurations/add` })
  }

  const handleImport = () => {
    // Implement import logic
  }

  const handleExport = () => {
    // Implement export logic
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("feeConfigurations.title")}
          addButtonText={t("feeConfigurations.actions.add")}
          breadcrumbs={[{ label: t("menu.administration"), href: "/dashboard" }, { label: t("feeConfigurations.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchFeeConfigurationRequest>
          schema={zSearchFeeConfigurationRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          onImport={handleImport}
          onExport={handleExport}
          fieldTranslationPrefix="feeConfigurations"
        />
      }
      content={<FeeConfigurationDataGrid />}
    />
  )
}
