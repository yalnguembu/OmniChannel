import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { KycDocumentDataGrid } from "../components/KycDocumentDataGrid"
import { useKycDocument } from "../hooks/useKycDocument"
import { CreateKycDocumentRequest, SearchKycDocumentRequest } from "@/shared/api/types.gen"
import { zSearchKycDocumentRequest } from "@/shared/api/zod.gen"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { useState } from "react"
import { KycDocumentCreateForm } from "../components/KycDocumentCreateForm"

export function KycDocumentsListPage() {
  const { t } = useTranslation()
  const { isLoading, totalItems, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters, createMutation } = useKycDocument()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const handleSubmit = (data: CreateKycDocumentRequest) => {
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
          title={t("kycDocuments.title")}
          totalCountText={t("kycDocuments.totalCount", { count: totalItems })}
          addButtonText={t("kycDocuments.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("kycDocuments.title") }]}
          totalItems={totalItems}
          onCreate={toggleShowCreateModal}
        />
      }
      filter={
        <BaseFilter<SearchKycDocumentRequest>
          schema={zSearchKycDocumentRequest}
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
          <KycDocumentDataGrid />
          {showCreateModal && <KycDocumentCreateForm onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />}
        </>
      }
    />
  )
}
