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
import { SearchProductChannelStatisticResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface ProductChannelStatisticDataGridProps {
  productChannelStatistics: SearchProductChannelStatisticResponse[]
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

export const ProductChannelStatisticDataGrid: React.FC<ProductChannelStatisticDataGridProps> = ({
  productChannelStatistics,
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

  const columnHeaders: DataGridColumnHeader<SearchProductChannelStatisticResponse>[] = [
    {
      key: "channelName",
      label: t("productChannelStatistic.fields.channelName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelCode",
      label: t("productChannelStatistic.fields.channelCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productName",
      label: t("productChannelStatistic.fields.productName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productStatus",
      label: t("productChannelStatistic.fields.productStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productId",
      label: t("productChannelStatistic.fields.productId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelId",
      label: t("productChannelStatistic.fields.channelId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "periodStart",
      label: t("productChannelStatistic.fields.periodStart"),
      sortable: true,
      resizable: true,
    },
    {
      key: "periodEnd",
      label: t("productChannelStatistic.fields.periodEnd"),
      sortable: true,
      resizable: true,
    },
    {
      key: "messagesSent",
      label: t("productChannelStatistic.fields.messagesSent"),
      sortable: true,
      resizable: true,
    },
    {
      key: "messagesDelivered",
      label: t("productChannelStatistic.fields.messagesDelivered"),
      sortable: true,
      resizable: true,
    },
    {
      key: "messagesFailed",
      label: t("productChannelStatistic.fields.messagesFailed"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalCost",
      label: t("productChannelStatistic.fields.totalCost"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("productChannelStatistic.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/productChannelStatistic/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/productChannelStatistic/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("productChannelStatistic.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("productChannelStatistic.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchProductChannelStatisticResponse, column: DataGridColumnHeader<SearchProductChannelStatisticResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "channelName":
          return <span className="text-muted-foreground/70">{item.channelName || "N/A"}</span>
        case "channelCode":
          return <span className="text-muted-foreground/70">{item.channelCode || "N/A"}</span>
        case "productName":
          return <span className="text-muted-foreground/70">{item.productName || "N/A"}</span>
        case "productStatus":
          return <span className="text-muted-foreground/70">{item.productStatus || "N/A"}</span>
        case "productId":
          return <span className="text-muted-foreground/70">{item.productId || "N/A"}</span>
        case "channelId":
          return <span className="text-muted-foreground/70">{item.channelId || "N/A"}</span>
        case "periodStart":
          return <span className="text-muted-foreground/70">{item.periodStart || "N/A"}</span>
        case "periodEnd":
          return <span className="text-muted-foreground/70">{item.periodEnd || "N/A"}</span>
        case "messagesSent":
          return <span className="text-muted-foreground/70">{item.messagesSent || "N/A"}</span>
        case "messagesDelivered":
          return <span className="text-muted-foreground/70">{item.messagesDelivered || "N/A"}</span>
        case "messagesFailed":
          return <span className="text-muted-foreground/70">{item.messagesFailed || "N/A"}</span>
        case "totalCost":
          return <span className="text-muted-foreground/70">{item.totalCost || "N/A"}</span>
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
              <DetailsCardItem label={t("productChannelStatistic.fields.channelName")} value={item.channelName ?? "N/A"} />
            </div>
          )
        case "channelCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.channelCode")} value={item.channelCode ?? "N/A"} />
            </div>
          )
        case "productName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.productName")} value={item.productName ?? "N/A"} />
            </div>
          )
        case "productStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.productStatus")} value={item.productStatus ?? "N/A"} />
            </div>
          )
        case "productId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.productId")} value={item.productId ?? "N/A"} />
            </div>
          )
        case "channelId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.channelId")} value={item.channelId ?? "N/A"} />
            </div>
          )
        case "periodStart":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.periodStart")} value={item.periodStart ?? "N/A"} />
            </div>
          )
        case "periodEnd":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.periodEnd")} value={item.periodEnd ?? "N/A"} />
            </div>
          )
        case "messagesSent":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.messagesSent")} value={item.messagesSent ?? "N/A"} />
            </div>
          )
        case "messagesDelivered":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.messagesDelivered")} value={item.messagesDelivered ?? "N/A"} />
            </div>
          )
        case "messagesFailed":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.messagesFailed")} value={item.messagesFailed ?? "N/A"} />
            </div>
          )
        case "totalCost":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannelStatistic.fields.totalCost")} value={item.totalCost ?? "N/A"} />
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
        label: isDeleting ? t("productChannelStatistic.bulk.deleting") : t("productChannelStatistic.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchProductChannelStatisticResponse>
        columnHeaders={columnHeaders}
        items={productChannelStatistics}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("productChannelStatistic.messages.noData")}
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
