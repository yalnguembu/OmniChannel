import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { TagDataGrid } from "../components/TagDataGrid"
import { useTagList } from "../hooks/useTagList"
import { useTagMutations } from "../hooks/useTagMutations"
import { useTagDetail } from "../hooks/useTagDetail"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchTagRequest } from "@/shared/api/zod.gen"
import { SearchTagRequest, CreateTagRequest, UpdateTagRequest } from "@/shared/api/types.gen"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { TagCreateForm } from "../components/TagCreateForm"
import { TagEditForm } from "../components/TagEditForm"
import { TagDetails } from "../components/TagDetails"
import { useTagListStore } from "../stores/tagListStore"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"

export function TagsListPage() {
  const { t } = useTranslation()
  const { 
    tags, 
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
  } = useTagList()
  
  const { createMutation, updateMutation, deleteMutation, bulkDeleteMutation } = useTagMutations()
  const store = useTagListStore()
  
  const { tag: selectedItem, isLoading: isDetailsLoading } = useTagDetail(store.selectedItemId || "")

  const handleCreate = (data: CreateTagRequest) => {
    createMutation.mutate({ body: data }, {
      onSuccess: () => {
        store.setShowCreateModal(false)
        refreshData()
      }
    })
  }

  const handleUpdate = (data: UpdateTagRequest) => {
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
            title={t("tag.title")}
            addButtonText={t("tag.actions.add")}
            breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("tag.title") }]}
            onCreate={() => store.setShowCreateModal(true)}
          />
        }
        filter={
          <BaseFilter<SearchTagRequest>
            schema={zSearchTagRequest}
            onFilter={applyFilters}
            onReset={clearFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            refreshData={refreshData}
            isLoading={isLoading}
            hasSelection={(selectedRows?.length ?? 0) > 0}
            selectedRows={selectedRows ?? []}
            selectionCount={selectedRows?.length ?? 0}
            fieldTranslationPrefix="tag"
          />
        }
        content={
          <TagDataGrid 
            tags={tags}
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
        title={t("tag.form.create.title")}
        size="lg"
      >
        <TagCreateForm
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
        title={t("tag.form.edit.title")}
        size="lg"
      >
        {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <TagEditForm
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
        title={t("tag.details.title")}
        size="lg"
      >
         {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <TagDetails data={selectedItem} />
        )}
      </ModalWrapper>

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={store.showDeleteModal}
        onOpenChange={() => !store.showDeleteModal && closeModals()}
        title={t("common.actions.delete")}
        description={t("tag.messages.delete.confirm", { name: selectedItem?.id || store.selectedItemId })}
        confirmText={t("common.actions.delete")}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  )
}
