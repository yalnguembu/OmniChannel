import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { DocumentsTypeDataGrid } from "../components/DocumentTypesDataGrid"
import { useDocumentsType } from "../hooks/useDocumentTypes"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { CreateDocumentsTypeRequest, SearchDocumentsTypeRequest } from "@/shared"
import { zSearchDocumentsTypeRequest } from "@/shared/api/zod.gen"
import { DocumentsTypeCreateForm } from "../components/DocumentTypeCreateForm"
import { useState } from "react"

export function DocumentTypesListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters, createMutation } = useDocumentsType()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const handleSubmit = (data: CreateDocumentsTypeRequest) => {
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
          title={t("documentsTypes.title")}
          addButtonText={t("documentsTypes.actions.add")}
          breadcrumbs={[{ label: t("menu.administration"), href: "/dashboard" }, { label: t("documentsTypes.title") }]}
          onCreate={toggleShowCreateModal}
        />
      }
      filter={
        <BaseFilter<SearchDocumentsTypeRequest>
          schema={zSearchDocumentsTypeRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          fieldTranslationPrefix="documentsTypes"
        />
      }
      content={
        <>
          <DocumentsTypeDataGrid />
          {showCreateModal && <DocumentsTypeCreateForm onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />}
        </>
      }
    />
  )
}
