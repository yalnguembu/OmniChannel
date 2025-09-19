import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchSettingRequest } from "@/shared/api/types.gen"
import { zSearchSettingRequest } from "@/shared/api/zod.gen"
import { SettingDataGrid } from "../components/SettingDataGrid"
import { useSetting } from "../hooks/useSetting"

export function SettingsListPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useSetting()

  const handleCreate = () => {
    navigate({ to: `/administration/settings/add` })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("settings.title")}
          addButtonText={t("settings.actions.add")}
          breadcrumbs={[{ label: t("menu.administration"), href: "/dashboard" }, { label: t("settings.title") }]}
          onCreate={handleCreate}
        />
      }
      filter={
        <BaseFilter<SearchSettingRequest>
          schema={zSearchSettingRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="settings"
        />
      }
      content={<SettingDataGrid />}
    />
  )
}
