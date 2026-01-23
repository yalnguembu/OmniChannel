import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort, ViewMode } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import StatusBadge from "@/shared/components/StatusBadge"
import { BadgeStyles } from "@/shared/types/enums"
import ActionButtonGroup from "@/shared/components/data-grid/ActionButtonGroup"
import DetailsCardItem from "@/shared/components/DetailsCardItem"
import { SearchWalletTransactionResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface WalletTransactionDataGridProps {
  walletTransactions: SearchWalletTransactionResponse[]
  paginationMetadata?: {
    totalCount: number
    totalPages: number
    pageNumber: number
    pageSize: number
    startIndex?: number
    endIndex?: number
    hasPreviousPage?: boolean
    hasNextPage?: boolean
  }
  isLoading: boolean
  viewMode: "grid" | "list"
  selectedRows: string[]
  onSelectionChange: (rows: string[]) => void
  onPageChange: (page: number, size: number) => void
  onSortChange: (column: string, direction: SortDirection | null) => void
  onDelete: (id: string) => void
  onBulkDelete: () => void
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  isDeleting?: boolean
  sortBy?: string | null
  sortDirection?: SortDirection | null
}

export const WalletTransactionDataGrid: React.FC<WalletTransactionDataGridProps> = ({
  walletTransactions,
  paginationMetadata,
  isLoading,
  viewMode,
  selectedRows,
  onSelectionChange,
  onPageChange,
  onSortChange,
  onDelete,
  onBulkDelete,
  onView,
  onEdit,
  isDeleting,
  sortBy,
  sortDirection
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const columnHeaders: DataGridColumnHeader<SearchWalletTransactionResponse>[] = [
    {
      key: "walletCurrency",
      label: t("walletTransaction.fields.walletCurrency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "walletId",
      label: t("walletTransaction.fields.walletId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "type",
      label: t("walletTransaction.fields.type"),
      sortable: true,
      resizable: true,
    },
    {
      key: "amount",
      label: t("walletTransaction.fields.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "balanceBefore",
      label: t("walletTransaction.fields.balanceBefore"),
      sortable: true,
      resizable: true,
    },
    {
      key: "balanceAfter",
      label: t("walletTransaction.fields.balanceAfter"),
      sortable: true,
      resizable: true,
    },
    {
      key: "reason",
      label: t("walletTransaction.fields.reason"),
      sortable: true,
      resizable: true,
    },
    {
      key: "referenceType",
      label: t("walletTransaction.fields.referenceType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "referenceId",
      label: t("walletTransaction.fields.referenceId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("walletTransaction.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/walletTransaction/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/walletTransaction/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("walletTransaction.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("walletTransaction.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchWalletTransactionResponse, column: DataGridColumnHeader<SearchWalletTransactionResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "walletCurrency":
          return <span className="text-muted-foreground/70">{item.walletCurrency || "N/A"}</span>
        case "walletId":
          return <span className="text-muted-foreground/70">{item.walletId || "N/A"}</span>
        case "type":
          return <span className="text-muted-foreground/70">{item.type || "N/A"}</span>
        case "amount":
          return <span className="text-muted-foreground/70">{item.amount || "N/A"}</span>
        case "balanceBefore":
          return <span className="text-muted-foreground/70">{item.balanceBefore || "N/A"}</span>
        case "balanceAfter":
          return <span className="text-muted-foreground/70">{item.balanceAfter || "N/A"}</span>
        case "reason":
          return <span className="text-muted-foreground/70">{item.reason || "N/A"}</span>
        case "referenceType":
          return <span className="text-muted-foreground/70">{item.referenceType || "N/A"}</span>
        case "referenceId":
          return <span className="text-muted-foreground/70">{item.referenceId || "N/A"}</span>
        case "actions":
          return <ActionButtonGroup view={view} isLoading={isLoading} row={item as any} actions={actions as ACTION[]} dispatch={handleDispatch} />

        default:
          const val = (item as any)[column.key]
          return column?.isBadge ? (
            <StatusBadge text={val as string} />
          ) : (
            <span className="text-muted-foreground/70">{val || "N/A"}</span>
          )
      }
    } else {
      switch (column.key) {
        case "walletCurrency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("walletTransaction.fields.walletCurrency")} value={item.walletCurrency ?? "N/A"} />
            </div>
          )
        case "walletId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("walletTransaction.fields.walletId")} value={item.walletId ?? "N/A"} />
            </div>
          )
        case "type":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("walletTransaction.fields.type")} value={item.type ?? "N/A"} />
            </div>
          )
        case "amount":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("walletTransaction.fields.amount")} value={item.amount ?? "N/A"} />
            </div>
          )
        case "balanceBefore":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("walletTransaction.fields.balanceBefore")} value={item.balanceBefore ?? "N/A"} />
            </div>
          )
        case "balanceAfter":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("walletTransaction.fields.balanceAfter")} value={item.balanceAfter ?? "N/A"} />
            </div>
          )
        case "reason":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("walletTransaction.fields.reason")} value={item.reason ?? "N/A"} />
            </div>
          )
        case "referenceType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("walletTransaction.fields.referenceType")} value={item.referenceType ?? "N/A"} />
            </div>
          )
        case "referenceId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("walletTransaction.fields.referenceId")} value={item.referenceId ?? "N/A"} />
            </div>
          )
        case "actions":
          return (
            <div className="flex flex-row justify-between px-4 pt-2 mt-auto border-t">
              <DetailsCardItem label="#" value={item.id?.substring(0, 8) || "N/A"} />
              <ActionButtonGroup view={view} isLoading={isLoading} row={item as any} actions={actions as ACTION[]} dispatch={handleDispatch} />
            </div>
          )
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
    onSortChange(config.column, config.direction)
  }

  const bulkActions = (selectedRows?.length > 0)
    ? [
      {
        label: isDeleting ? t("walletTransaction.bulk.deleting") : t("walletTransaction.bulk.delete", { count: selectedRows?.length }),
        action: handleBulkDelete,
        variant: "destructive" as const,
        loading: isDeleting,
      },
    ]
    : undefined

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "edit":
        handleEdit(id)
        break
      case "view":
        handleView(id)
        break
      case "delete":
        handleDelete(id)
        break
      default:
        return
    }
  }

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col gap-2">
      <DataGrid<SearchWalletTransactionResponse>
        columnHeaders={columnHeaders}
        items={walletTransactions}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("walletTransaction.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={onSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        bulkActions={bulkActions}
        renderCell={renderCell}
        dispatch={handleDispatch}
        actions={actions as ACTION[]}
        viewMode={viewMode}
      />
    </div>
  )
}
