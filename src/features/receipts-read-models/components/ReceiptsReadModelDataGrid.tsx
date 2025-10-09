import React, { ReactNode, useMemo, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridRowEntry, DataGridSort, ViewMode } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useReceiptsReadModel } from "../hooks/useReceiptsReadModel"
import { ReceiptsReadModelDataGridEntry } from "../lib/data-grid/ReceiptsReadModelDataGridEntry"
import StatusBadge from "@/shared/components/StatusBadge"
import ActionButtonGroup from "@/shared/components/data-grid/ActionButtonGroup"
import DetailsCardItem from "@/shared/components/DetailsCardItem"
import { getApiReceiptsReadModelCheckPaymentStatusById } from "@/shared/api/sdk.gen"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"
import { TransactionDetailsModal } from "./TransactionDetailsModal"
import { ChangeStatusDialog } from "./ChangeStatusDialog"
import { SearchReceiptsReadModelResponse } from "@/shared/api/types.gen"
import { toast } from "sonner"

export const ReceiptsReadModelDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showChangeStatusDialog, setShowChangeStatusDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<SearchReceiptsReadModelResponse | null>(null)

  const {
    receiptsReadModels,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    hasSelection,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
    bulkDeleteMutation,
    searchReceiptsReadModels,
    getApiReceiptsReadModelGetAllStatus,
  } = useReceiptsReadModel()

  const { data: statusResponse } = getApiReceiptsReadModelGetAllStatus()
  const availableStatuses = useMemo(() => statusResponse?.data || [], [statusResponse])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "paymentMethod",
      label: "M",
      sortable: true,
      resizable: true,
    },
    {
      key: "amount",
      label: t("receiptsreadmodels.headers.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "transaction",
      label: t("receiptsreadmodels.headers.transaction"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("receiptsreadmodels.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    // {
    //   key: "context",
    //   label: t("receiptsreadmodels.headers.context"),
    //   sortable: true,
    //   resizable: true,
    // },
    {
      key: "references",
      label: t("receiptsreadmodels.headers.references"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("receiptsReadModels.actions.more"),
      sortable: false,
      width: 110,
    },
  ]

  const getCheckStatus = async (id: string) => {
    const response = await getApiReceiptsReadModelCheckPaymentStatusById({ path: { id } })
    if (response.status === 200 && response.data) searchReceiptsReadModels()
  }

  useEffect(() => {
    searchReceiptsReadModels()
  }, [])

  const enum paymentMethodCode {
    MTN_MOMO = "/icons/momo.png",
    ORANGE_MONEY = "/icons/om.png",
  }

  const gridItems = useMemo(() => {
    return receiptsReadModels.map((item) => new ReceiptsReadModelDataGridEntry(item))
  }, [receiptsReadModels])

  const handleView = (id: string) => {
    const transaction = receiptsReadModels.find((t) => t.id === id)
    if (transaction) {
      setSelectedTransaction(transaction)
      setShowDetailsModal(true)
    }
  }

  const handleBulkDelete = () => {
    setBulkDeleteConfirmation(true)
  }

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedRows)
    setBulkDeleteConfirmation(false)
  }

  const handleChangeStatusClick = (id: string) => {
    const transaction = receiptsReadModels.find((t) => t.id === id)
    if (transaction) {
      setSelectedTransaction(transaction)
      setShowChangeStatusDialog(true)
    }
  }

  const handleChangeStatusConfirm = (transactionId: string, newStatus: string) => {
    toast.success(t("receiptsReadModels.changeStatus.success", { status: newStatus }))
    setShowChangeStatusDialog(false)
    setSelectedTransaction(null)
    // Refresh data to get updated status
    searchReceiptsReadModels()
  }

  const sortConfig: DataGridSort | undefined = sortBy
    ? {
        column: sortBy,
        direction: sortDirection === "desc" ? SortDirection.DESC : SortDirection.ASC,
      }
    : undefined

  const handleSortChange = (config: DataGridSort) => {
    const direction = config.direction
    changeSort(config.column, direction)
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedRows(selectedIds)
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  const bulkActions = hasSelection
    ? [
        {
          label: bulkDeleteMutation.isPending ? t("receiptsReadModels.bulk.deleting") : t("receiptsReadModels.bulk.delete", { count: selectedRows.length }),
          action: handleBulkDelete,
          variant: "destructive" as const,
          loading: bulkDeleteMutation.isPending,
        },
      ]
    : undefined

  const actions: ACTION[] = ["checkStatus", "view"]

  const renderCell = (item: DataGridRowEntry, column: DataGridColumnHeader, view: ViewMode): ReactNode => {
    if (view == "list") {
      switch (column.key) {
        case "paymentMethod":
          return <img src={paymentMethodCode[item.getTextFor("paymentMethodCode") as keyof typeof paymentMethodCode]} alt="Payment Method" className="h-6 w-6 rounded-md" />
        case "amount":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-medium">{t("receiptsreadmodels.headers.amount")} :</span>
                <span className="text-green-500 font-bold">
                  {item.getTextFor("amount")} {item.getTextFor("currency")}
                </span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("receiptsreadmodels.headers.fee")} :</span>
                <span className="text-red-500 font-semibold">
                  {item.getTextFor("providerFeeAmount")} {item.getTextFor("currency")}
                </span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("receiptsreadmodels.headers.netAmount")} :</span>
                <span className="font-semibold text-blue-500">
                  {item.getTextFor("netAmount")} {item.getTextFor("currency")}
                </span>
              </div>
            </div>
          )
        case "transaction":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 mb-3">
                {/* <span className="font-medium">{t("receiptsreadmodels.headers.phoneNumberEncrypted")} :</span> */}
                <span className="font-black text-primary">{item.getTextFor("phoneNumberEncrypted")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <StatusBadge text={item.getTextFor("status")} />
              </div>
            </div>
          )
        case "references":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-medium">{t("receiptsreadmodels.headers.externalReference")} :</span>
                <span className="text-red-500 font-semibold">{item.getTextFor("externalReference")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("receiptsreadmodels.headers.internalReference")} :</span>
                <span className="text-blue-500 font-semibold">{item.getTextFor("internalReference")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("receiptsreadmodels.headers.providerInitialReference")}: </span>
                <span className="">{item.getTextFor("providerInitialReference")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("receiptsreadmodels.headers.providerFinalReference")}: </span>
                <span className="">{item.getTextFor("providerFinalReference")}</span>
              </div>
            </div>
          )
        case "createdAt":
          return <span className="text-muted-foreground">{item.getTextFor("createdAt")}</span>

        case "actions":
          return <ActionButtonGroup view={view} isLoading={isLoading} row={item} actions={actions as ACTION[]} dispatch={handleDispatch} />

        default:
          return column?.isBadge ? (
            <StatusBadge text={item.getTextFor(column.key) as string} />
          ) : (
            <span className="text-muted-foreground/70"> {item.getTextFor(column.key) || "N/A"}</span>
          )
      }
    } else {
      switch (column.key) {
        case "amount":
          return (
            <div className="flex flex-col gap-y-1 px-4">
              <DetailsCardItem
                label={t("receiptsreadmodels.headers.amount")}
                value={
                  <span className="text-green-500 font-bold">
                    {item.getTextFor("amount")} {item.getTextFor("currency")}
                  </span>
                }
              />
              <DetailsCardItem
                label={t("receiptsreadmodels.headers.fee")}
                value={
                  <span className="text-red-500 font-semibold">
                    {item.getTextFor("providerFeeAmount")} {item.getTextFor("currency")}
                  </span>
                }
              />
              <DetailsCardItem
                label={t("receiptsreadmodels.headers.netAmount")}
                value={
                  <span className="font-semibold text-blue-500">
                    {item.getTextFor("netAmount")} {item.getTextFor("currency")}
                  </span>
                }
              />
            </div>
          )
        case "paymentMethod":
          return (
            <div className="flex flex-row justify-between px-4 mt-auto border-b">
              <img src={paymentMethodCode[item.getTextFor("paymentMethodCode") as keyof typeof paymentMethodCode]} alt="Payment Method" className="h-6 w-6 rounded-md" />
              <ActionButtonGroup view={view} isLoading={isLoading} row={item} actions={actions as ACTION[]} dispatch={handleDispatch} />
            </div>
          )
        case "transaction":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <DetailsCardItem
                label={t("receiptsreadmodels.headers.phoneNumberEncrypted")}
                value={<span className="text-primary font-bold">{item.getTextFor("phoneNumberEncrypted")}</span>}
              />
              <DetailsCardItem label={t("receiptsreadmodels.headers.status")} value={<StatusBadge text={item.getTextFor("status")} />} />
            </div>
          )
        case "references":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <span className="font-medium border-t pt-2">{t("receiptsreadmodels.headers.references")} </span>
              <DetailsCardItem
                label={t("receiptsreadmodels.headers.externalReference")}
                value={<span className="text-red-500 font-semibold">{item.getTextFor("externalReference")}</span>}
              />
              <DetailsCardItem
                label={t("receiptsreadmodels.headers.internalReference")}
                value={<span className="text-blue-500 font-semibold">{item.getTextFor("internalReference")}</span>}
              />
              <DetailsCardItem
                label={t("receiptsreadmodels.headers.providerInitialReference")}
                value={<span className="font-semibold">{item.getTextFor("providerInitialReference")}</span>}
              />
              <DetailsCardItem
                label={t("receiptsreadmodels.headers.providerFinalReference")}
                value={<span className="font-semibold">{item.getTextFor("providerFinalReference")}</span>}
              />
            </div>
          )
        case "actions":
          return null
        default:
          return null
      }
    }
  }

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "checkStatus":
        getCheckStatus(id)
        break
      case "view":
        handleView(id)
        break
      case "changeStatus":
        handleChangeStatusClick(id)
        break
      default:
        return
    }
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <DataGrid
        columnHeaders={columnHeaders}
        items={gridItems}
        total={totalItems}
        page={currentPage}
        limit={pageSize}
        hasPagination={true}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage={t("receiptsReadModels.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        bulkActions={bulkActions}
        renderCell={renderCell}
        actions={actions}
        dispatch={handleDispatch}
      />

      <ConfirmationModal
        open={bulkDeleteConfirmation}
        onOpenChange={() => setBulkDeleteConfirmation(false)}
        onConfirm={confirmBulkDelete}
        title={t("receiptsReadModels.confirmations.bulkDelete.title")}
        description={t("receiptsReadModels.confirmations.bulkDelete.description", { count: selectedRows.length })}
        confirmText={t("receiptsReadModels.confirmations.bulkDelete.confirm")}
        cancelText={t("receiptsReadModels.confirmations.bulkDelete.cancel")}
        variant="danger"
        isLoading={bulkDeleteMutation.isPending}
      />

      <TransactionDetailsModal
        open={showDetailsModal}
        onOpenChange={() => {
          setShowDetailsModal(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
      />

      <ChangeStatusDialog
        open={showChangeStatusDialog}
        onOpenChange={(open) => {
          setShowChangeStatusDialog(open)
          if (!open) setSelectedTransaction(null)
        }}
        currentStatus={selectedTransaction?.status || ""}
        transactionId={selectedTransaction?.id || ""}
        availableStatuses={availableStatuses}
        onConfirm={handleChangeStatusConfirm}
        isLoading={false}
      />
    </div>
  )
}
