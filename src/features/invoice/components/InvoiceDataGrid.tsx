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
import { SearchInvoiceResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface InvoiceDataGridProps {
  invoices: SearchInvoiceResponse[]
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

export const InvoiceDataGrid: React.FC<InvoiceDataGridProps> = ({
  invoices,
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

  const columnHeaders: DataGridColumnHeader<SearchInvoiceResponse>[] = [
    {
      key: "companyName",
      label: t("invoice.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("invoice.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("invoice.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyName",
      label: t("invoice.fields.currencyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencySymbol",
      label: t("invoice.fields.currencySymbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyCode",
      label: t("invoice.fields.currencyCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("invoice.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "invoiceNumber",
      label: t("invoice.fields.invoiceNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "billingPeriodStart",
      label: t("invoice.fields.billingPeriodStart"),
      sortable: true,
      resizable: true,
    },
    {
      key: "billingPeriodEnd",
      label: t("invoice.fields.billingPeriodEnd"),
      sortable: true,
      resizable: true,
    },
    {
      key: "subTotal",
      label: t("invoice.fields.subTotal"),
      sortable: true,
      resizable: true,
    },
    {
      key: "taxAmount",
      label: t("invoice.fields.taxAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "taxRate",
      label: t("invoice.fields.taxRate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "total",
      label: t("invoice.fields.total"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: t("invoice.fields.currency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("invoice.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "dueDate",
      label: t("invoice.fields.dueDate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "paidAt",
      label: t("invoice.fields.paidAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("invoice.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/invoice/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/invoice/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("invoice.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("invoice.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchInvoiceResponse, column: DataGridColumnHeader<SearchInvoiceResponse>, view: ViewMode): ReactNode => {
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
        case "invoiceNumber":
          return <span className="text-muted-foreground/70">{item.invoiceNumber || "N/A"}</span>
        case "billingPeriodStart":
          return <span className="text-muted-foreground/70">{item.billingPeriodStart || "N/A"}</span>
        case "billingPeriodEnd":
          return <span className="text-muted-foreground/70">{item.billingPeriodEnd || "N/A"}</span>
        case "subTotal":
          return <span className="text-muted-foreground/70">{item.subTotal || "N/A"}</span>
        case "taxAmount":
          return <span className="text-muted-foreground/70">{item.taxAmount || "N/A"}</span>
        case "taxRate":
          return <span className="text-muted-foreground/70">{item.taxRate || "N/A"}</span>
        case "total":
          return <span className="text-muted-foreground/70">{item.total || "N/A"}</span>
        case "currency":
          return <span className="text-muted-foreground/70">{item.currency || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "dueDate":
          return <span className="text-muted-foreground/70">{item.dueDate || "N/A"}</span>
        case "paidAt":
          return <span className="text-muted-foreground/70">{item.paidAt || "N/A"}</span>
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
              <DetailsCardItem label={t("invoice.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "currencyName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.currencyName")} value={item.currencyName ?? "N/A"} />
            </div>
          )
        case "currencySymbol":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.currencySymbol")} value={item.currencySymbol ?? "N/A"} />
            </div>
          )
        case "currencyCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.currencyCode")} value={item.currencyCode ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "invoiceNumber":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.invoiceNumber")} value={item.invoiceNumber ?? "N/A"} />
            </div>
          )
        case "billingPeriodStart":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.billingPeriodStart")} value={item.billingPeriodStart ?? "N/A"} />
            </div>
          )
        case "billingPeriodEnd":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.billingPeriodEnd")} value={item.billingPeriodEnd ?? "N/A"} />
            </div>
          )
        case "subTotal":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.subTotal")} value={item.subTotal ?? "N/A"} />
            </div>
          )
        case "taxAmount":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.taxAmount")} value={item.taxAmount ?? "N/A"} />
            </div>
          )
        case "taxRate":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.taxRate")} value={item.taxRate ?? "N/A"} />
            </div>
          )
        case "total":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.total")} value={item.total ?? "N/A"} />
            </div>
          )
        case "currency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.currency")} value={item.currency ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "dueDate":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.dueDate")} value={item.dueDate ?? "N/A"} />
            </div>
          )
        case "paidAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("invoice.fields.paidAt")} value={item.paidAt ?? "N/A"} />
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
        label: isDeleting ? t("invoice.bulk.deleting") : t("invoice.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchInvoiceResponse>
        columnHeaders={columnHeaders}
        items={invoices}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("invoice.messages.noData")}
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
