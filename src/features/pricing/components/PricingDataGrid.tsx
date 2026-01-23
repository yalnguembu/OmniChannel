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
import { SearchPricingResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface PricingDataGridProps {
  pricings: SearchPricingResponse[]
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

export const PricingDataGrid: React.FC<PricingDataGridProps> = ({
  pricings,
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

  const columnHeaders: DataGridColumnHeader<SearchPricingResponse>[] = [
    {
      key: "channelName",
      label: t("pricing.fields.channelName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelCode",
      label: t("pricing.fields.channelCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("pricing.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("pricing.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("pricing.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyName",
      label: t("pricing.fields.currencyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencySymbol",
      label: t("pricing.fields.currencySymbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyCode",
      label: t("pricing.fields.currencyCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerName",
      label: t("pricing.fields.providerName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerCode",
      label: t("pricing.fields.providerCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelId",
      label: t("pricing.fields.channelId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerId",
      label: t("pricing.fields.providerId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("pricing.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "unitPrice",
      label: t("pricing.fields.unitPrice"),
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: t("pricing.fields.currency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "platformFee",
      label: t("pricing.fields.platformFee"),
      sortable: true,
      resizable: true,
    },
    {
      key: "platformFeeType",
      label: t("pricing.fields.platformFeeType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "effectiveFrom",
      label: t("pricing.fields.effectiveFrom"),
      sortable: true,
      resizable: true,
    },
    {
      key: "effectiveTo",
      label: t("pricing.fields.effectiveTo"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("pricing.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/pricing/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/pricing/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("pricing.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("pricing.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchPricingResponse, column: DataGridColumnHeader<SearchPricingResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "channelName":
          return <span className="text-muted-foreground/70">{item.channelName || "N/A"}</span>
        case "channelCode":
          return <span className="text-muted-foreground/70">{item.channelCode || "N/A"}</span>
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
        case "providerName":
          return <span className="text-muted-foreground/70">{item.providerName || "N/A"}</span>
        case "providerCode":
          return <span className="text-muted-foreground/70">{item.providerCode || "N/A"}</span>
        case "channelId":
          return <span className="text-muted-foreground/70">{item.channelId || "N/A"}</span>
        case "providerId":
          return <span className="text-muted-foreground/70">{item.providerId || "N/A"}</span>
        case "companyId":
          return <span className="text-muted-foreground/70">{item.companyId || "N/A"}</span>
        case "unitPrice":
          return <span className="text-muted-foreground/70">{item.unitPrice || "N/A"}</span>
        case "currency":
          return <span className="text-muted-foreground/70">{item.currency || "N/A"}</span>
        case "platformFee":
          return <span className="text-muted-foreground/70">{item.platformFee || "N/A"}</span>
        case "platformFeeType":
          return <span className="text-muted-foreground/70">{item.platformFeeType || "N/A"}</span>
        case "effectiveFrom":
          return <span className="text-muted-foreground/70">{item.effectiveFrom || "N/A"}</span>
        case "effectiveTo":
          return <span className="text-muted-foreground/70">{item.effectiveTo || "N/A"}</span>
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
        case "channelName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.channelName")} value={item.channelName ?? "N/A"} />
            </div>
          )
        case "channelCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.channelCode")} value={item.channelCode ?? "N/A"} />
            </div>
          )
        case "companyName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "currencyName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.currencyName")} value={item.currencyName ?? "N/A"} />
            </div>
          )
        case "currencySymbol":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.currencySymbol")} value={item.currencySymbol ?? "N/A"} />
            </div>
          )
        case "currencyCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.currencyCode")} value={item.currencyCode ?? "N/A"} />
            </div>
          )
        case "providerName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.providerName")} value={item.providerName ?? "N/A"} />
            </div>
          )
        case "providerCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.providerCode")} value={item.providerCode ?? "N/A"} />
            </div>
          )
        case "channelId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.channelId")} value={item.channelId ?? "N/A"} />
            </div>
          )
        case "providerId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.providerId")} value={item.providerId ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "unitPrice":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.unitPrice")} value={item.unitPrice ?? "N/A"} />
            </div>
          )
        case "currency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.currency")} value={item.currency ?? "N/A"} />
            </div>
          )
        case "platformFee":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.platformFee")} value={item.platformFee ?? "N/A"} />
            </div>
          )
        case "platformFeeType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.platformFeeType")} value={item.platformFeeType ?? "N/A"} />
            </div>
          )
        case "effectiveFrom":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.effectiveFrom")} value={item.effectiveFrom ?? "N/A"} />
            </div>
          )
        case "effectiveTo":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("pricing.fields.effectiveTo")} value={item.effectiveTo ?? "N/A"} />
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
        label: isDeleting ? t("pricing.bulk.deleting") : t("pricing.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchPricingResponse>
        columnHeaders={columnHeaders}
        items={pricings}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("pricing.messages.noData")}
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
