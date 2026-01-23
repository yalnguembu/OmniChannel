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
import { SearchWalletResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface WalletDataGridProps {
  wallets: SearchWalletResponse[]
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

export const WalletDataGrid: React.FC<WalletDataGridProps> = ({
  wallets,
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

  const columnHeaders: DataGridColumnHeader<SearchWalletResponse>[] = [
    {
      key: "companyName",
      label: t("wallet.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("wallet.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("wallet.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyName",
      label: t("wallet.fields.currencyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencySymbol",
      label: t("wallet.fields.currencySymbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyCode",
      label: t("wallet.fields.currencyCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("wallet.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "balance",
      label: t("wallet.fields.balance"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: t("wallet.fields.currency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "minimumBalance",
      label: t("wallet.fields.minimumBalance"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lowBalanceThreshold",
      label: t("wallet.fields.lowBalanceThreshold"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isBlocked",
      label: t("wallet.fields.isBlocked"),
      sortable: true,
      resizable: true,
    },
    {
      key: "blockedAt",
      label: t("wallet.fields.blockedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "blockReason",
      label: t("wallet.fields.blockReason"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("wallet.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/wallet/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/wallet/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("wallet.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("wallet.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchWalletResponse, column: DataGridColumnHeader<SearchWalletResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "companyName":
          return <span className="text-muted-foreground/70">{item.companyName || "N/A"}</span>
        case "companyStatus":
          return <span className="text-muted-foreground/70">{item.companyStatus || "N/A"}</span>
        case "companyEmail":
          return <span className="text-muted-foreground/70">{item.companyEmail || "N/A"}</span>
        case "currencyName":
          return <span className="text-muted-foreground/70">{item.currencyName || "N/A"}</span>
        case "currencySymbol":
          return <span className="text-muted-foreground/70">{item.currencySymbol || "N/A"}</span>
        case "currencyCode":
          return <span className="text-muted-foreground/70">{item.currencyCode || "N/A"}</span>
        case "companyId":
          return <span className="text-muted-foreground/70">{item.companyId || "N/A"}</span>
        case "balance":
          return <span className="text-muted-foreground/70">{item.balance || "N/A"}</span>
        case "currency":
          return <span className="text-muted-foreground/70">{item.currency || "N/A"}</span>
        case "minimumBalance":
          return <span className="text-muted-foreground/70">{item.minimumBalance || "N/A"}</span>
        case "lowBalanceThreshold":
          return <span className="text-muted-foreground/70">{item.lowBalanceThreshold || "N/A"}</span>
        case "isBlocked":
          return <span className="text-muted-foreground/70">{item.isBlocked || "N/A"}</span>
        case "blockedAt":
          return <span className="text-muted-foreground/70">{item.blockedAt || "N/A"}</span>
        case "blockReason":
          return <span className="text-muted-foreground/70">{item.blockReason || "N/A"}</span>
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
        case "companyName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "currencyName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.currencyName")} value={item.currencyName ?? "N/A"} />
            </div>
          )
        case "currencySymbol":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.currencySymbol")} value={item.currencySymbol ?? "N/A"} />
            </div>
          )
        case "currencyCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.currencyCode")} value={item.currencyCode ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "balance":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.balance")} value={item.balance ?? "N/A"} />
            </div>
          )
        case "currency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.currency")} value={item.currency ?? "N/A"} />
            </div>
          )
        case "minimumBalance":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.minimumBalance")} value={item.minimumBalance ?? "N/A"} />
            </div>
          )
        case "lowBalanceThreshold":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.lowBalanceThreshold")} value={item.lowBalanceThreshold ?? "N/A"} />
            </div>
          )
        case "isBlocked":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.isBlocked")} value={item.isBlocked ?? "N/A"} />
            </div>
          )
        case "blockedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.blockedAt")} value={item.blockedAt ?? "N/A"} />
            </div>
          )
        case "blockReason":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("wallet.fields.blockReason")} value={item.blockReason ?? "N/A"} />
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
        label: isDeleting ? t("wallet.bulk.deleting") : t("wallet.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchWalletResponse>
        columnHeaders={columnHeaders}
        items={wallets}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("wallet.messages.noData")}
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
