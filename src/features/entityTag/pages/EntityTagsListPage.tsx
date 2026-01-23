import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { EntityTagDataGrid } from "../components/EntityTagDataGrid"
import { useEntityTagList } from "../hooks/useEntityTagList"
import { useEntityTagMutations } from "../hooks/useEntityTagMutations"
import { useEntityTagDetail } from "../hooks/useEntityTagDetail"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchEntityTagRequest } from "@/shared/api/zod.gen"
import { SearchEntityTagRequest, CreateEntityTagRequest, UpdateEntityTagRequest } from "@/shared/api/types.gen"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { EntityTagCreateForm } from "../components/EntityTagCreateForm"
import { EntityTagEditForm } from "../components/EntityTagEditForm"
import { EntityTagDetails } from "../components/EntityTagDetails"
import { useEntityTagListStore } from "../stores/entityTagListStore"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"

export function EntityTagsListPage() {
  const { t } = useTranslation()
  const { 
    entityTags, 
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
  } = useEntityTagList()
  
  const { createMutation, updateMutation, deleteMutation, bulkDeleteMutation } = useEntityTagMutations()
  const store = useEntityTagListStore()
  
  const { entityTag: selectedItem, isLoading: isDetailsLoading } = useEntityTagDetail(store.selectedItemId || "")

  const handleCreate = (data: CreateEntityTagRequest) => {
    createMutation.mutate({ body: data }, {
      onSuccess: () => {
        store.setShowCreateModal(false)
        refreshData()
      }
    })
  }

  const handleUpdate = (data: UpdateEntityTagRequest) => {
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
            title={t("entityTag.title")}
            addButtonText={t("entityTag.actions.add")}
            breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("entityTag.title") }]}
            onCreate={() => store.setShowCreateModal(true)}
          />
        }
        filter={
          <BaseFilter<SearchEntityTagRequest>
            schema={zSearchEntityTagRequest}
            onFilter={applyFilters}
            onReset={clearFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            refreshData={refreshData}
            isLoading={isLoading}
            hasSelection={(selectedRows?.length ?? 0) > 0}
            selectedRows={selectedRows ?? []}
            selectionCount={selectedRows?.length ?? 0}
            fieldTranslationPrefix="entityTag"
          />
        }
        content={
          <EntityTagDataGrid 
            entityTags={entityTags}
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
        title={t("entityTag.form.create.title")}
        size="lg"
      >
        <EntityTagCreateForm
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
        title={t("entityTag.form.edit.title")}
        size="lg"
      >
        {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <EntityTagEditForm
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
        title={t("entityTag.details.title")}
        size="lg"
      >
         {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <EntityTagDetails data={selectedItem} />
        )}
      </ModalWrapper>

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={store.showDeleteModal}
        onOpenChange={() => !store.showDeleteModal && closeModals()}
        title={t("common.actions.delete")}
        description={t("entityTag.messages.delete.confirm", { name: selectedItem?.id || store.selectedItemId })}
        confirmText={t("common.actions.delete")}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  )
}
