import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchSecureSettingRequest } from "@/shared/api/types.gen"
import { zSearchSecureSettingRequest } from "@/shared/api/zod.gen"
import { SecureSettingDataGrid } from "../components/SecureSettingDataGrid"
import { useSecureSetting } from "../hooks/useSecureSetting"

export function SecureSettingsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useSecureSetting()

  const handleCreate = () => {
    navigate({ to: `/administration/secure-settings/add` })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("secureSettings.title")}
          addButtonText={t("secureSettings.actions.add")}
          breadcrumbs={[{ label: t("menu.administration"), href: "/dashboard" }, { label: t("secureSettings.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchSecureSettingRequest>
          schema={zSearchSecureSettingRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="secureSettings"
        />
      }
      content={<SecureSettingDataGrid />}
    />
  )
}
