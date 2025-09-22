import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BlockedIpDataGrid } from "../components/BlockedIpDataGrid"
import { useBlockedIp } from "../hooks/useBlockedIp"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { CreateBlockedIpRequest, SearchBlockedIpRequest } from "@/shared"
import { zSearchBlockedIpRequest } from "@/shared/api/zod.gen"
import { useState } from "react"
import { BlockedIpCreateForm } from "../components/BlockedIpCreateForm"

export function BlockedIpsListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, createMutation, clearFilters } = useBlockedIp()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const handleSubmit = (data: CreateBlockedIpRequest) => {
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
          title={t("blockedIp.title")}
          addButtonText={t("blockedIp.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("blockedIp.title") }]}
          onCreate={toggleShowCreateModal}
        />
      }
      filter={
        <BaseFilter<SearchBlockedIpRequest>
          schema={zSearchBlockedIpRequest}
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
          <BlockedIpDataGrid />
          {showCreateModal && <BlockedIpCreateForm onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />}
        </>
      }
    />
  )
}
