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
import { SearchPaymentResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface PaymentDataGridProps {
  payments: SearchPaymentResponse[]
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

export const PaymentDataGrid: React.FC<PaymentDataGridProps> = ({
  payments,
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

  const columnHeaders: DataGridColumnHeader<SearchPaymentResponse>[] = [
    {
      key: "companyName",
      label: t("payment.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("payment.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("payment.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyName",
      label: t("payment.fields.currencyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencySymbol",
      label: t("payment.fields.currencySymbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyCode",
      label: t("payment.fields.currencyCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "invoiceCurrency",
      label: t("payment.fields.invoiceCurrency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "invoiceStatus",
      label: t("payment.fields.invoiceStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodCurrency",
      label: t("payment.fields.paymentMethodCurrency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodStatus",
      label: t("payment.fields.paymentMethodStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("payment.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "invoiceId",
      label: t("payment.fields.invoiceId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paymentMethodId",
      label: t("payment.fields.paymentMethodId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "amount",
      label: t("payment.fields.amount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: t("payment.fields.currency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "method",
      label: t("payment.fields.method"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("payment.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "externalTransactionId",
      label: t("payment.fields.externalTransactionId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "finalTransactionId",
      label: t("payment.fields.finalTransactionId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "metadata",
      label: t("payment.fields.metadata"),
      sortable: true,
      resizable: true,
    },
    {
      key: "processedAt",
      label: t("payment.fields.processedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "failureReason",
      label: t("payment.fields.failureReason"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("payment.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/payment/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/payment/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("payment.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("payment.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchPaymentResponse, column: DataGridColumnHeader<SearchPaymentResponse>, view: ViewMode): ReactNode => {
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
        case "invoiceCurrency":
          return <span className="text-muted-foreground/70">{item.invoiceCurrency || "N/A"}</span>
        case "invoiceStatus":
          return <span className="text-muted-foreground/70">{item.invoiceStatus || "N/A"}</span>
        case "paymentMethodCurrency":
          return <span className="text-muted-foreground/70">{item.paymentMethodCurrency || "N/A"}</span>
        case "paymentMethodStatus":
          return <span className="text-muted-foreground/70">{item.paymentMethodStatus || "N/A"}</span>
        case "companyId":
          return <span className="text-muted-foreground/70">{item.companyId || "N/A"}</span>
        case "invoiceId":
          return <span className="text-muted-foreground/70">{item.invoiceId || "N/A"}</span>
        case "paymentMethodId":
          return <span className="text-muted-foreground/70">{item.paymentMethodId || "N/A"}</span>
        case "amount":
          return <span className="text-muted-foreground/70">{item.amount || "N/A"}</span>
        case "currency":
          return <span className="text-muted-foreground/70">{item.currency || "N/A"}</span>
        case "method":
          return <span className="text-muted-foreground/70">{item.method || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "externalTransactionId":
          return <span className="text-muted-foreground/70">{item.externalTransactionId || "N/A"}</span>
        case "finalTransactionId":
          return <span className="text-muted-foreground/70">{item.finalTransactionId || "N/A"}</span>
        case "metadata":
          return <span className="text-muted-foreground/70">{item.metadata || "N/A"}</span>
        case "processedAt":
          return <span className="text-muted-foreground/70">{item.processedAt || "N/A"}</span>
        case "failureReason":
          return <span className="text-muted-foreground/70">{item.failureReason || "N/A"}</span>
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
              <DetailsCardItem label={t("payment.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "currencyName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.currencyName")} value={item.currencyName ?? "N/A"} />
            </div>
          )
        case "currencySymbol":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.currencySymbol")} value={item.currencySymbol ?? "N/A"} />
            </div>
          )
        case "currencyCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.currencyCode")} value={item.currencyCode ?? "N/A"} />
            </div>
          )
        case "invoiceCurrency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.invoiceCurrency")} value={item.invoiceCurrency ?? "N/A"} />
            </div>
          )
        case "invoiceStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.invoiceStatus")} value={item.invoiceStatus ?? "N/A"} />
            </div>
          )
        case "paymentMethodCurrency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.paymentMethodCurrency")} value={item.paymentMethodCurrency ?? "N/A"} />
            </div>
          )
        case "paymentMethodStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.paymentMethodStatus")} value={item.paymentMethodStatus ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "invoiceId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.invoiceId")} value={item.invoiceId ?? "N/A"} />
            </div>
          )
        case "paymentMethodId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.paymentMethodId")} value={item.paymentMethodId ?? "N/A"} />
            </div>
          )
        case "amount":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.amount")} value={item.amount ?? "N/A"} />
            </div>
          )
        case "currency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.currency")} value={item.currency ?? "N/A"} />
            </div>
          )
        case "method":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.method")} value={item.method ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "externalTransactionId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.externalTransactionId")} value={item.externalTransactionId ?? "N/A"} />
            </div>
          )
        case "finalTransactionId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.finalTransactionId")} value={item.finalTransactionId ?? "N/A"} />
            </div>
          )
        case "metadata":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.metadata")} value={item.metadata ?? "N/A"} />
            </div>
          )
        case "processedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.processedAt")} value={item.processedAt ?? "N/A"} />
            </div>
          )
        case "failureReason":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("payment.fields.failureReason")} value={item.failureReason ?? "N/A"} />
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
        label: isDeleting ? t("payment.bulk.deleting") : t("payment.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchPaymentResponse>
        columnHeaders={columnHeaders}
        items={payments}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("payment.messages.noData")}
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
