import React, { ReactNode, useMemo, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridRowEntry, DataGridSort, ViewMode } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useWithdrawalsReadModel } from "../hooks/useWithdrawalsReadModel"
import { WithdrawalsReadModelDataGridEntry } from "../lib/data-grid/WithdrawalsReadModelDataGridEntry"
import StatusBadge from "@/shared/components/StatusBadge"
import ActionButtonGroup from "@/shared/components/data-grid/ActionButtonGroup"
import DetailsCardItem from "@/shared/components/DetailsCardItem"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"
import { SearchWithdrawalsReadModelResponse } from "@/shared/api"
import { getApiWithdrawalsReadModelGetAllWithdrawlsEventsById } from "@/shared/api/sdk.gen"
import { toast } from "sonner"
import { WithdrawalDetailsModal } from "./WithdrawalDetailsModal"
import { Input } from "@/shared/components/ui/input"
import { useSessionStore } from "@/shared/stores/sessionStore"

export const WithdrawalsReadModelDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const { userPermissions } = useSessionStore()

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; withdrawalId: string | null }>({
    open: false,
    withdrawalId: null,
  })

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<SearchWithdrawalsReadModelResponse | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [completeReference, setCompleteReference] = useState("")
  const [actioningWithdrawalId, setActioningWithdrawalId] = useState<string | null>(null)

  const {
    withdrawalsReadModels,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
    onApproveWithdrawal,
    onCancelWithdrawal,
    onCompleteWithdrawal,
    searchWithdrawalsReadModels,
  } = useWithdrawalsReadModel()

  useEffect(() => {
    searchWithdrawalsReadModels()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "paymentMethod",
      label: "🖼",
      sortable: true,
      resizable: true,
    },
    {
      key: "amount",
      label: t("withdrawalsreadmodels.headers.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "details",
      label: t("withdrawals.headers.details"),
      sortable: true,
      resizable: true,
    },
    {
      key: "references",
      label: t("withdrawalsreadmodels.headers.references"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("withdrawalsreadmodels.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("withdrawalsReadModels.actions.more"),
      sortable: false,
      width: 110,
    },
  ]

  const gridItems = useMemo(() => {
    return withdrawalsReadModels.map((item) => new WithdrawalsReadModelDataGridEntry(item))
  }, [withdrawalsReadModels])

  const handleView = (id: string) => {
    const withdrawal = withdrawalsReadModels.find((w) => w.id === id)
    if (withdrawal) {
      setSelectedWithdrawal(withdrawal)
      setShowDetailsModal(true)
    }
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmation({ open: true, withdrawalId: id })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.withdrawalId) {
      // deleteWithdrawalReadModel(deleteConfirmation.withdrawalId)
      setDeleteConfirmation({ open: false, withdrawalId: null })
    }
  }

  const handleCopyEvent = async (id: string) => {
    const response = await getApiWithdrawalsReadModelGetAllWithdrawlsEventsById({ path: { id } })
    if (response.data) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
      toast.success("Withdrawal events copied to clipboard.")
    }
  }

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "view":
        handleView(id)
        break
      case "delete":
        handleDelete(id)
        break
      case "approve":
        onApproveWithdrawal(id)
        break
      case "cancel":
        setActioningWithdrawalId(id)
        setShowCancelModal(true)
        break
      case "complete":
        setActioningWithdrawalId(id)
        setShowCompleteModal(true)
        break
      default:
        return
    }
  }

  const actions: ACTION[] = ["view", "delete", "approve", "cancel", "complete"]

  const enum paymentMethodCode {
    MOMO = "/icons/momo.png",
    OM = "/icons/om.png",
  }

  const getActionsForStatus = (status: string): ACTION[] => {
    const baseActions: ACTION[] = ["view", "delete"]
    if (!userPermissions.includes("WITHDRAWALSREADMODEL_CHANGE_STATUS")) {
      return baseActions
    }
    switch (status) {
      case "AWAITING_APPROVAL":
        return [...baseActions, "approve", "cancel"]
      case "APPROVED":
        return [...baseActions, "complete"]
      case "PENDING":
      case "COMPLETED":
      case "CANCELLED":
      case "FAILED":
      default:
        return baseActions
    }
  }
  const renderCell = (item: DataGridRowEntry, column: DataGridColumnHeader, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "paymentMethod":
          return <img src={paymentMethodCode[item.getTextFor("paymentMethodName") as unknown]} alt="Payment Method" className="h-6 w-6 rounded-md" />
        case "amount":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-medium">{t("withdrawalsreadmodels.headers.amount")}:</span>
                <span className="text-green-500 font-bold">
                  {item.getTextFor("amount")} {item.getTextFor("currency")}
                </span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("withdrawalsreadmodels.headers.providerFeeAmount")}:</span>
                <span className="text-red-500 font-semibold">
                  {item.getTextFor("providerFeeAmount")} {item.getTextFor("currency")}
                </span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("withdrawalsreadmodels.headers.netAmount")}:</span>
                <span className="font-semibold text-blue-500">
                  {item.getTextFor("netAmount")} {item.getTextFor("currency")}
                </span>
              </div>
            </div>
          )
        case "details":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 mb-3">
                <span className="font-black text-primary">{item.getTextFor("accountNumber")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <StatusBadge text={item.getTextFor("status") as unknown as string} />
              </div>
            </div>
          )
        case "references":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("withdrawalsreadmodels.headers.internalReference")}:</span>
                <span className="text-blue-500 font-semibold">{item.getTextFor("internalReference")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("withdrawalsreadmodels.headers.providerInitialReference")}:</span>
                <span className="">{item.getTextFor("providerInitialReference")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-medium">{t("withdrawalsreadmodels.headers.providerFinalReference")}:</span>
                <span className="">{item.getTextFor("providerFinalReference")}</span>
              </div>
            </div>
          )
        case "createdAt":
          return <span className="text-muted-foreground">{item.getTextFor("createdAt")}</span>
        case "actions":
          const status = item.getTextFor("status")
          const availableActions = getActionsForStatus(status as unknown as string)
          if (availableActions.length === 0) {
            return null
          }
          return <ActionButtonGroup view={view} isLoading={isLoading} row={item} actions={availableActions as ACTION[]} dispatch={handleDispatch} />
        default:
          return <span className="text-muted-foreground/70">{item.getTextFor(column.key) || "N/A"}</span>
      }
    } else {
      switch (column.key) {
        case "paymentMethod":
          return (
            <div className="flex flex-row justify-between px-4 mt-auto border-b">
              <img src={paymentMethodCode[item.getTextFor("paymentMethodName") as keyof typeof paymentMethodCode]} alt="Payment Method" className="h-6 w-6 rounded-md" />
              <ActionButtonGroup view={view} isLoading={isLoading} row={item} actions={getActionsForStatus(item.getTextFor("status")) as ACTION[]} dispatch={handleDispatch} />
            </div>
          )
        case "amount":
          return (
            <div className="flex flex-col gap-y-1 px-4">
              <DetailsCardItem
                label={t("withdrawalsreadmodels.headers.amount")}
                value={
                  <span className="text-green-500 font-bold">
                    {item.getTextFor("amount")} {item.getTextFor("currency")}
                  </span>
                }
              />
              <DetailsCardItem
                label={t("withdrawalsreadmodels.headers.providerFeeAmount")}
                value={
                  <span className="text-red-500 font-semibold">
                    {item.getTextFor("providerFeeAmount")} {item.getTextFor("currency")}
                  </span>
                }
              />
              <DetailsCardItem
                label={t("withdrawalsreadmodels.headers.netAmount")}
                value={
                  <span className="font-semibold text-blue-500">
                    {item.getTextFor("netAmount")} {item.getTextFor("currency")}
                  </span>
                }
              />
            </div>
          )
        case "details":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <DetailsCardItem
                label={t("withdrawalsreadmodels.headers.accountNumber")}
                value={<span className="text-primary font-bold">{item.getTextFor("accountNumber")}</span>}
              />
              <DetailsCardItem label={t("withdrawalsreadmodels.headers.status")} value={<StatusBadge text={item.getTextFor("status") as unknown as string} />} />
            </div>
          )
        case "references":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <span className="font-medium border-t pt-2">{t("withdrawalsreadmodels.headers.references")}</span>
              <DetailsCardItem
                label={t("withdrawalsreadmodels.headers.internalReference")}
                value={<span className="text-blue-500 font-semibold">{item.getTextFor("internalReference")}</span>}
              />
              <DetailsCardItem
                label={t("withdrawalsreadmodels.headers.providerInitialReference")}
                value={<span className="font-semibold">{item.getTextFor("providerInitialReference")}</span>}
              />
              <DetailsCardItem
                label={t("withdrawalsreadmodels.headers.providerFinalReference")}
                value={<span className="font-semibold">{item.getTextFor("providerFinalReference")}</span>}
              />
            </div>
          )
        case "createdAt":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("withdrawalsreadmodels.headers.createdAt")} value={<span className="font-semibold">{item.getTextFor("createdAt")}</span>} />
            </div>
          )
        case "actions":
          return null
        default:
          return null
      }
    }
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
    if (currentPage !== page) changePage(page)
    if (pageSize !== size) changePageSize(size)
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
        emptyMessage={t("withdrawalsReadModels.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        renderCell={renderCell}
        actions={actions}
        dispatch={handleDispatch}
      />

      <ConfirmationModal
        open={deleteConfirmation.open}
        onOpenChange={() => setDeleteConfirmation({ open: false, withdrawalId: null })}
        onConfirm={confirmDelete}
        title={t("withdrawals.confirmations.delete.title")}
        description={t("withdrawals.confirmations.delete.description")}
        confirmText={t("withdrawals.confirmations.delete.confirm")}
        cancelText={t("withdrawals.confirmations.delete.cancel")}
        variant="danger"
      />
      <ConfirmationModal
        open={showCancelModal}
        onOpenChange={() => {
          setShowCancelModal(false)
          setActioningWithdrawalId(null)
          setCancelReason("")
        }}
        onConfirm={() => {
          if (!cancelReason) {
            toast.error(t("withdrawals.messages.cancel.reasonRequired"))
            return
          }
          if (actioningWithdrawalId) {
            onCancelWithdrawal(actioningWithdrawalId, cancelReason)
          }
          setShowCancelModal(false)
        }}
        title={t("withdrawals.confirmations.cancel.title")}
        description={t("withdrawals.confirmations.cancel.description")}
        confirmText={t("withdrawals.confirmations.cancel.confirm")}
        cancelText={t("withdrawals.confirmations.cancel.cancel")}
        variant="danger"
      >
        <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder={t("withdrawals.confirmations.cancel.reasonPlaceholder")} className="mt-4" />
      </ConfirmationModal>
      <ConfirmationModal
        open={showCompleteModal}
        onOpenChange={() => {
          setShowCompleteModal(false)
          setActioningWithdrawalId(null)
          setCompleteReference("")
        }}
        onConfirm={() => {
          if (actioningWithdrawalId) {
            onCompleteWithdrawal(actioningWithdrawalId, completeReference)
          }
          setShowCompleteModal(false)
        }}
        title={t("withdrawals.confirmations.complete.title")}
        description={t("withdrawals.confirmations.complete.description")}
        confirmText={t("withdrawals.confirmations.complete.confirm")}
        cancelText={t("withdrawals.confirmations.complete.cancel")}
      >
        <Input
          value={completeReference}
          onChange={(e) => setCompleteReference(e.target.value)}
          placeholder={t("withdrawals.confirmations.complete.referencePlaceholder")}
          className="mt-4"
        />
      </ConfirmationModal>

      <WithdrawalDetailsModal
        open={showDetailsModal}
        onOpenChange={() => {
          setShowDetailsModal(false)
          setSelectedWithdrawal(null)
        }}
        onCopyEvent={handleCopyEvent}
        withdrawal={selectedWithdrawal}
      />
    </div>
  )
}
