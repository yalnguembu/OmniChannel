import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { ProviderCallbackDataGrid } from "../components/ProviderCallbackDataGrid"
import { useProviderCallbackList } from "../hooks/useProviderCallbackList"
import { useProviderCallbackMutations } from "../hooks/useProviderCallbackMutations"
import { useProviderCallbackDetail } from "../hooks/useProviderCallbackDetail"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchProviderCallbackRequest } from "@/shared/api/zod.gen"
import { SearchProviderCallbackRequest, CreateProviderCallbackRequest, UpdateProviderCallbackRequest } from "@/shared/api/types.gen"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { ProviderCallbackCreateForm } from "../components/ProviderCallbackCreateForm"
import { ProviderCallbackEditForm } from "../components/ProviderCallbackEditForm"
import { ProviderCallbackDetails } from "../components/ProviderCallbackDetails"
import { useProviderCallbackListStore } from "../stores/providerCallbackListStore"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"

export function ProviderCallbacksListPage() {
  const { t } = useTranslation()
  const { 
    providerCallbacks, 
    paginationMetadata,
    isLoading, 
    viewMode, 
    setViewMode, 
    refreshData, 
    applyFilters, 
    clearFilters,
    selectedRows,
    setSelectedRows,
    sortBy,
    sortDirection,
    changePage,
    changePageSize,
    changeSort
  } = useProviderCallbackList()
  
  const { createMutation, updateMutation, deleteMutation, bulkDeleteMutation } = useProviderCallbackMutations()
  const store = useProviderCallbackListStore()
  
  const { providerCallback: selectedItem, isLoading: isDetailsLoading } = useProviderCallbackDetail(store.selectedItemId || "")

  const handleCreate = (data: CreateProviderCallbackRequest) => {
    createMutation.mutate({ body: data }, {
      onSuccess: () => {
        store.setShowCreateModal(false)
        refreshData()
      }
    })
  }

  const handleUpdate = (data: UpdateProviderCallbackRequest) => {
    if (store.selectedItemId) {
      updateMutation.mutate({ path: { id: store.selectedItemId }, body: data }, {
        onSuccess: () => {
          store.setShowEditModal(false)
          store.setSelectedItemId(null)
          refreshData()
        }
      })
    }
  }

  const handleDelete = () => {
    if (store.selectedItemId) {
      deleteMutation.mutate({ path: { id: store.selectedItemId } }, {
        onSuccess: () => {
          store.setShowDeleteModal(false)
          store.setSelectedItemId(null)
          refreshData()
        }
      })
    }
  }

  const handleBulkDelete = () => {
    if (selectedRows && selectedRows.length > 0) {
      bulkDeleteMutation.mutate(selectedRows, {
        onSuccess: () => {
          setSelectedRows([])
          refreshData()
        }
      })
    }
  }
  
  const closeModals = () => {
      store.setShowCreateModal(false)
      store.setShowEditModal(false)
      store.setShowDetailsModal(false)
      store.setShowDeleteModal(false)
      store.setSelectedItemId(null)
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  return (
    <>
      <StandardListPageLayout
        header={
          <ListPageHeader
            title={t("providerCallback.title")}
            addButtonText={t("providerCallback.actions.add")}
            breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("providerCallback.title") }]}
            onCreate={() => store.setShowCreateModal(true)}
          />
        }
        filter={
          <BaseFilter<SearchProviderCallbackRequest>
            schema={zSearchProviderCallbackRequest}
            onFilter={applyFilters}
            onReset={clearFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            refreshData={refreshData}
            isLoading={isLoading}
            hasSelection={(selectedRows?.length ?? 0) > 0}
            selectedRows={selectedRows ?? []}
            selectionCount={selectedRows?.length ?? 0}
            fieldTranslationPrefix="providerCallback"
          />
        }
        content={
          <ProviderCallbackDataGrid 
            providerCallbacks={providerCallbacks}
            paginationMetadata={paginationMetadata}
            isLoading={isLoading}
            viewMode={viewMode}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onPageChange={handlePageChange}
            onSortChange={changeSort}
            onDelete={(id) => { store.setSelectedItemId(id); store.setShowDeleteModal(true); }}
            onBulkDelete={handleBulkDelete}
            onView={(id) => { store.setSelectedItemId(id); store.setShowDetailsModal(true); }}
            onEdit={(id) => { store.setSelectedItemId(id); store.setShowEditModal(true); }}
            isDeleting={deleteMutation.isPending || bulkDeleteMutation.isPending}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />
        }
      />

      {/* Create Modal */}
      <ModalWrapper
        open={store.showCreateModal}
        onOpenChange={() => !store.showCreateModal && closeModals()}
        withHeader
        title={t("providerCallback.form.create.title")}
        size="lg"
      >
        <ProviderCallbackCreateForm
          onSubmit={handleCreate}
          onCancel={closeModals}
          isLoading={createMutation.isPending}
        />
      </ModalWrapper>

      {/* Edit Modal */}
      <ModalWrapper
        open={store.showEditModal}
        onOpenChange={() => !store.showEditModal && closeModals()}
        withHeader
        title={t("providerCallback.form.edit.title")}
        size="lg"
      >
        {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <ProviderCallbackEditForm
            initialData={selectedItem}
            onSubmit={handleUpdate}
            onCancel={closeModals}
            isLoading={updateMutation.isPending}
          />
        )}
      </ModalWrapper>

      {/* Details Modal */}
      <ModalWrapper
        open={store.showDetailsModal}
        onOpenChange={() => !store.showDetailsModal && closeModals()}
        withHeader
        title={t("providerCallback.details.title")}
        size="lg"
      >
         {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <ProviderCallbackDetails data={selectedItem} />
        )}
      </ModalWrapper>

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={store.showDeleteModal}
        onOpenChange={() => !store.showDeleteModal && closeModals()}
        title={t("common.actions.delete")}
        description={t("providerCallback.messages.delete.confirm", { name: selectedItem?.id || store.selectedItemId })}
        confirmText={t("common.actions.delete")}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  )
}
