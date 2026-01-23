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
import { SearchPaymentMethodResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface PaymentMethodDataGridProps {
  paymentMethods: SearchPaymentMethodResponse[]
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

export const PaymentMethodDataGrid: React.FC<PaymentMethodDataGridProps> = ({
  paymentMethods,
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

  const columnHeaders: DataGridColumnHeader<SearchPaymentMethodResponse>[] = [
    {
      key: "code",
      label: t("paymentMethod.fields.code"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("paymentMethod.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("paymentMethod.fields.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "logoUrl",
      label: t("paymentMethod.fields.logoUrl"),
      sortable: true,
      resizable: true,
    },
    {
      key: "requiresPhoneNumber",
      label: t("paymentMethod.fields.requiresPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "minimumAmount",
      label: t("paymentMethod.fields.minimumAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "maximumAmount",
      label: t("paymentMethod.fields.maximumAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "settlementPeriod",
      label: t("paymentMethod.fields.settlementPeriod"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("paymentMethod.fields.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "sortOrder",
      label: t("paymentMethod.fields.sortOrder"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("paymentMethod.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/paymentMethod/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/paymentMethod/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("paymentMethod.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("paymentMethod.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchPaymentMethodResponse, column: DataGridColumnHeader<SearchPaymentMethodResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "code":
          return <span className="text-muted-foreground/70">{item.code || "N/A"}</span>
        case "name":
          return <span className="text-muted-foreground/70">{item.name || "N/A"}</span>
        case "description":
          return <span className="text-muted-foreground/70">{item.description || "N/A"}</span>
        case "logoUrl":
          return <span className="text-muted-foreground/70">{item.logoUrl || "N/A"}</span>
        case "requiresPhoneNumber":
          return <span className="text-muted-foreground/70">{item.requiresPhoneNumber || "N/A"}</span>
        case "minimumAmount":
          return <span className="text-muted-foreground/70">{item.minimumAmount || "N/A"}</span>
        case "maximumAmount":
          return <span className="text-muted-foreground/70">{item.maximumAmount || "N/A"}</span>
        case "settlementPeriod":
          return <span className="text-muted-foreground/70">{item.settlementPeriod || "N/A"}</span>
        case "isActive":
          return <span className="text-muted-foreground/70">{item.isActive || "N/A"}</span>
        case "sortOrder":
          return <span className="text-muted-foreground/70">{item.sortOrder || "N/A"}</span>
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
        case "code":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.code")} value={item.code ?? "N/A"} />
            </div>
          )
        case "name":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.name")} value={item.name ?? "N/A"} />
            </div>
          )
        case "description":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.description")} value={item.description ?? "N/A"} />
            </div>
          )
        case "logoUrl":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.logoUrl")} value={item.logoUrl ?? "N/A"} />
            </div>
          )
        case "requiresPhoneNumber":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.requiresPhoneNumber")} value={item.requiresPhoneNumber ?? "N/A"} />
            </div>
          )
        case "minimumAmount":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.minimumAmount")} value={item.minimumAmount ?? "N/A"} />
            </div>
          )
        case "maximumAmount":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.maximumAmount")} value={item.maximumAmount ?? "N/A"} />
            </div>
          )
        case "settlementPeriod":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.settlementPeriod")} value={item.settlementPeriod ?? "N/A"} />
            </div>
          )
        case "isActive":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.isActive")} value={item.isActive ?? "N/A"} />
            </div>
          )
        case "sortOrder":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("paymentMethod.fields.sortOrder")} value={item.sortOrder ?? "N/A"} />
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
        label: isDeleting ? t("paymentMethod.bulk.deleting") : t("paymentMethod.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchPaymentMethodResponse>
        columnHeaders={columnHeaders}
        items={paymentMethods}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("paymentMethod.messages.noData")}
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
