import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchUserDeviceRequest } from "@/shared/api/types.gen"
import { zSearchUserDeviceRequest } from "@/shared/api/zod.gen"
import { UserDeviceDataGrid } from "../components/UserDeviceDataGrid"
import { useUserDevice } from "../hooks/useUserDevice"

export function UserDevicesListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters } = useUserDevice()

  return (
    <StandardListPageLayout
      header={<ListPageHeader title={t("userDevices.title")} breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("userDevices.title") }]} />}
      filter={
        <BaseFilter<SearchUserDeviceRequest>
          schema={zSearchUserDeviceRequest}
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
      content={<UserDeviceDataGrid />}
    />
  )
}
