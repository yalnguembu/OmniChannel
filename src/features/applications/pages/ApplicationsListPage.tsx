import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { ApplicationDataGrid } from "../components/ApplicationDataGrid"
import { useApplicationList } from "../hooks/useApplicationList"
import { useApplicationMutations } from "../hooks/useApplicationMutations"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchApplicationRequest } from "@/shared/api/zod.gen"
import { SearchApplicationRequest, CreateApplicationRequest, UpdateApplicationRequest } from "@/shared"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { ApplicationCreateForm } from "../components/ApplicationCreateForm"
import { ApplicationEditForm } from "../components/ApplicationEditForm"
import { useApplicationListStore } from "../stores/applicationListStore"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"

export function ApplicationsListPage() {
  const { t } = useTranslation()
  const { isLoading, viewMode, setViewMode, refreshData, applyFilters, clearFilters } = useApplicationList()
  const { createMutation, updateMutation, deleteMutation } = useApplicationMutations()
  const store = useApplicationListStore()

  const handleCreate = (data: CreateApplicationRequest) => {
    createMutation.mutate({ body: data }, {
      onSuccess: () => {
        store.setShowCreateModal(false)
        refreshData()
      }
    })
  }

  const handleUpdate = (data: UpdateApplicationRequest) => {
    if (store.selectedItem?.id) {
      updateMutation.mutate({ path: { id: store.selectedItem.id }, body: data }, {
        onSuccess: () => {
          store.setShowEditModal(false)
          refreshData()
        }
      })
    }
  }

  const handleDelete = () => {
    if (store.selectedItem?.id) {
      deleteMutation.mutate({ path: { id: store.selectedItem.id } }, {
        onSuccess: () => {
          store.setShowDeleteModal(false)
          refreshData()
        }
      })
    }
  }

  return (
    <>
      <StandardListPageLayout
        header={
          <ListPageHeader
            title={t("applications.title")}
            addButtonText={t("applications.actions.add")}
            breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("applications.title") }]}
            onCreate={() => store.setShowCreateModal(true)}
          />
        }
        filter={
          <BaseFilter<SearchApplicationRequest>
            schema={zSearchApplicationRequest}
            onFilter={applyFilters}
            onReset={clearFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            refreshData={refreshData}
            isLoading={isLoading}
            hasSelection={false}
            selectedRows={[]}
            selectionCount={0}
            fieldTranslationPrefix="applications"
          />
        }
        content={<ApplicationDataGrid />}
      />

      {/* Create Modal */}
      <ModalWrapper
        open={store.showCreateModal}
        onOpenChange={() => store.setShowCreateModal(false)}
        withHeader
        title={t("applications.form.create.title")}
        size="lg"
      >
        <ApplicationCreateForm
          onSubmit={handleCreate}
          onCancel={() => store.setShowCreateModal(false)}
          isLoading={createMutation.isPending}
          style="border-none shadow-none max-w-full"
        />
      </ModalWrapper>

      {/* Edit Modal */}
      <ModalWrapper
        open={store.showEditModal}
        onOpenChange={() => store.setShowEditModal(false)}
        withHeader
        title={t("applications.form.edit.title")}
        size="lg"
      >
        {store.selectedItem && (
          <ApplicationEditForm
            initialData={store.selectedItem}
            onSubmit={handleUpdate}
            onCancel={() => store.setShowEditModal(false)}
            isLoading={updateMutation.isPending}
            style="border-none shadow-none max-w-full"
          />
        )}
      </ModalWrapper>

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={store.showDeleteModal}
        onOpenChange={() => store.setShowDeleteModal(false)}
        title={t("common.actions.delete")}
        description={t("applications.messages.delete.confirm", { name: store.selectedItem?.name })}
        confirmText={t("common.actions.delete")}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  )
}
