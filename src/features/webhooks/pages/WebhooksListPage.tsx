import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { CreateWebhookRequest, SearchWebhookRequest } from "@/shared/api/types.gen"
import { zSearchWebhookRequest } from "@/shared/api/zod.gen"
import { WebhookDataGrid } from "../components/WebhookDataGrid"
import { useWebhook } from "../hooks/useWebhook"
import { WebhookCreateForm } from "../components/WebhookCreateForm"
import { useState } from "react"
import { ModalWrapper } from "@/shared/components/ModalWrapper"

export function WebhooksListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters, createWebhookWithValidation } = useWebhook()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const handleCreate = (data: CreateWebhookRequest, setError: any) => {
    createWebhookWithValidation(data, setError, () => {
      toggleShowCreateModal()
    })
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("webhooks.title")}
          addButtonText={t("webhooks.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("webhooks.title") }]}
          onCreate={toggleShowCreateModal}
        />
      }
      filter={
        <BaseFilter<SearchWebhookRequest>
          schema={zSearchWebhookRequest}
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
          <WebhookDataGrid />
          {showCreateModal && (
            <ModalWrapper title="" description="" open={showCreateModal} onOpenChange={toggleShowCreateModal}>
              <div className="-m-6">
                <WebhookCreateForm onSubmit={handleCreate} onCancel={toggleShowCreateModal} isLoading={false} />
              </div>
            </ModalWrapper>
          )}
        </>
      }
    />
  )
}
