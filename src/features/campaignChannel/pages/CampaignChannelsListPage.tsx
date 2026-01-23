import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { CampaignChannelDataGrid } from "../components/CampaignChannelDataGrid"
import { useCampaignChannelList } from "../hooks/useCampaignChannelList"
import { useCampaignChannelMutations } from "../hooks/useCampaignChannelMutations"
import { useCampaignChannelDetail } from "../hooks/useCampaignChannelDetail"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchCampaignChannelRequest } from "@/shared/api/zod.gen"
import { SearchCampaignChannelRequest, CreateCampaignChannelRequest, UpdateCampaignChannelRequest } from "@/shared/api/types.gen"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { CampaignChannelCreateForm } from "../components/CampaignChannelCreateForm"
import { CampaignChannelEditForm } from "../components/CampaignChannelEditForm"
import { CampaignChannelDetails } from "../components/CampaignChannelDetails"
import { useCampaignChannelListStore } from "../stores/campaignChannelListStore"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"

export function CampaignChannelsListPage() {
  const { t } = useTranslation()
  const { 
    campaignChannels, 
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
  } = useCampaignChannelList()
  
  const { createMutation, updateMutation, deleteMutation, bulkDeleteMutation } = useCampaignChannelMutations()
  const store = useCampaignChannelListStore()
  
  const { campaignChannel: selectedItem, isLoading: isDetailsLoading } = useCampaignChannelDetail(store.selectedItemId || "")

  const handleCreate = (data: CreateCampaignChannelRequest) => {
    createMutation.mutate({ body: data }, {
      onSuccess: () => {
        store.setShowCreateModal(false)
        refreshData()
      }
    })
  }

  const handleUpdate = (data: UpdateCampaignChannelRequest) => {
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
            title={t("campaignChannel.title")}
            addButtonText={t("campaignChannel.actions.add")}
            breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("campaignChannel.title") }]}
            onCreate={() => store.setShowCreateModal(true)}
          />
        }
        filter={
          <BaseFilter<SearchCampaignChannelRequest>
            schema={zSearchCampaignChannelRequest}
            onFilter={applyFilters}
            onReset={clearFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            refreshData={refreshData}
            isLoading={isLoading}
            hasSelection={(selectedRows?.length ?? 0) > 0}
            selectedRows={selectedRows ?? []}
            selectionCount={selectedRows?.length ?? 0}
            fieldTranslationPrefix="campaignChannel"
          />
        }
        content={
          <CampaignChannelDataGrid 
            campaignChannels={campaignChannels}
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
        title={t("campaignChannel.form.create.title")}
        size="lg"
      >
        <CampaignChannelCreateForm
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
        title={t("campaignChannel.form.edit.title")}
        size="lg"
      >
        {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <CampaignChannelEditForm
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
        title={t("campaignChannel.details.title")}
        size="lg"
      >
         {isDetailsLoading && <div className="p-4 flex justify-center">Loading...</div>}
        {selectedItem && !isDetailsLoading && (
          <CampaignChannelDetails data={selectedItem} />
        )}
      </ModalWrapper>

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={store.showDeleteModal}
        onOpenChange={() => !store.showDeleteModal && closeModals()}
        title={t("common.actions.delete")}
        description={t("campaignChannel.messages.delete.confirm", { name: selectedItem?.id || store.selectedItemId })}
        confirmText={t("common.actions.delete")}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  )
}
