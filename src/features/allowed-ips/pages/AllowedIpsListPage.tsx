import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { AllowedIpDataGrid } from "../components/AllowedIpDataGrid"
import { useAllowedIp } from "../hooks/useAllowedIp"
import { zSearchAllowedIpRequest } from "@/shared/api/zod.gen"
import { CreateAllowedIpRequest, SearchAllowedIpRequest } from "@/shared/api/types.gen"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { useState } from "react"
import { AllowedIpCreateForm } from "../components/AllowedIpCreateForm"

export function AllowedIpsListPage() {
  const { t } = useTranslation()
  const { isLoading, applyFilters, clearFilters, viewMode, setViewMode, refreshData, hasSelection, selectedRows, createMutation } = useAllowedIp()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const handleSubmit = (data: CreateAllowedIpRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => toggleShowCreateModal(),
      },
    )
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("allowedIps.title")}
          addButtonText={t("allowedIps.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("allowedIps.title") }]}
          onCreate={toggleShowCreateModal}
        />
      }
      filter={
        <BaseFilter<SearchAllowedIpRequest>
          schema={zSearchAllowedIpRequest}
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
      content={
        <>
          <AllowedIpDataGrid />
          {showCreateModal && <AllowedIpCreateForm onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />}
        </>
      }
    />
  )
}
