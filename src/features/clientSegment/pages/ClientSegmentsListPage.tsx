import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { ClientSegmentDataGrid } from "../components/ClientSegmentDataGrid"
import { useClientSegmentList } from "../hooks/useClientSegmentList"
import { useClientSegmentMutations } from "../hooks/useClientSegmentMutations"
import { useClientSegmentDetail } from "../hooks/useClientSegmentDetail"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchClientSegmentRequest } from "@/shared/api/zod.gen"
import { SearchClientSegmentRequest, CreateClientSegmentRequest, UpdateClientSegmentRequest } from "@/shared/api/types.gen"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { ClientSegmentCreateForm } from "../components/ClientSegmentCreateForm"
import { ClientSegmentEditForm } from "../components/ClientSegmentEditForm"
import { ClientSegmentDetails } from "../components/ClientSegmentDetails"
import { useClientSegmentListStore } from "../stores/clientSegmentListStore"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"

export function ClientSegmentsListPage() {
  const { t } = useTranslation()
  const { 
    clientSegments, 
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
  } = useClientSegmentList()
  
  const { createMutation, updateMutation, deleteMutation, bulkDeleteMutation } = useClientSegmentMutations()
  const store = useClientSegmentListStore()
  
  const { clientSegment: selectedItem, isLoading: isDetailsLoading } = useClientSegmentDetail(store.selectedItemId || "")

  const handleCreate = (data: CreateClientSegmentRequest) => {
    createMutation.mutate({ body: data }, {
      onSuccess: () => {
        store.setShowCreateModal(false)
        refreshData()
      }
    })
  }

  const handleUpdate = (data: UpdateClientSegmentRequest) => {
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
            title={t("clientSegment.title")}
            addButtonText={t("clientSegment.actions.add")}
            breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("clientSegment.title") }]}
            onCreate={() => store.setShowCreateModal(true)}
          />
        }
        filter={
          <BaseFilter<SearchClientSegmentRequest>
            schema={zSearchClientSegmentRequest}
            onFilter={applyFilters}
            onReset={clearFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            refreshData={refreshData}
            isLoading={isLoading}
            hasSelection={(selectedRows?.length ?? 0) > 0}
            selectedRows={selectedRows ?? []}
            selectionCount={selectedRows?.length ?? 0}
            fieldTranslationPrefix="clientSegment"
          />
        }
        content={
          <ClientSegmentDataGrid 
            clientSegments={clientSegments}
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
        title={t("clientSegment.form.create.title")}
        size="lg"
      >
        <ClientSegmentCreateForm
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
        title={t("clientSegment.form.edit.title")}
        size="lg"
      >
        {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <ClientSegmentEditForm
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
        title={t("clientSegment.details.title")}
        size="lg"
      >
         {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <ClientSegmentDetails data={selectedItem} />
        )}
      </ModalWrapper>

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={store.showDeleteModal}
        onOpenChange={() => !store.showDeleteModal && closeModals()}
        title={t("common.actions.delete")}
        description={t("clientSegment.messages.delete.confirm", { name: selectedItem?.id || store.selectedItemId })}
        confirmText={t("common.actions.delete")}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  )
}
