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
import { SearchProductChannelResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface ProductChannelDataGridProps {
  productChannels: SearchProductChannelResponse[]
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

export const ProductChannelDataGrid: React.FC<ProductChannelDataGridProps> = ({
  productChannels,
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

  const columnHeaders: DataGridColumnHeader<SearchProductChannelResponse>[] = [
    {
      key: "channelName",
      label: t("productChannel.fields.channelName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelCode",
      label: t("productChannel.fields.channelCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productName",
      label: t("productChannel.fields.productName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productStatus",
      label: t("productChannel.fields.productStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productId",
      label: t("productChannel.fields.productId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelId",
      label: t("productChannel.fields.channelId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("productChannel.fields.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "priority",
      label: t("productChannel.fields.priority"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("productChannel.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/productChannel/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/productChannel/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("productChannel.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("productChannel.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchProductChannelResponse, column: DataGridColumnHeader<SearchProductChannelResponse>, view: ViewMode): ReactNode => {
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
        case "isActive":
          return <span className="text-muted-foreground/70">{item.isActive || "N/A"}</span>
        case "priority":
          return <span className="text-muted-foreground/70">{item.priority || "N/A"}</span>
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
              <DetailsCardItem label={t("productChannel.fields.channelName")} value={item.channelName ?? "N/A"} />
            </div>
          )
        case "channelCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannel.fields.channelCode")} value={item.channelCode ?? "N/A"} />
            </div>
          )
        case "productName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannel.fields.productName")} value={item.productName ?? "N/A"} />
            </div>
          )
        case "productStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannel.fields.productStatus")} value={item.productStatus ?? "N/A"} />
            </div>
          )
        case "productId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannel.fields.productId")} value={item.productId ?? "N/A"} />
            </div>
          )
        case "channelId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannel.fields.channelId")} value={item.channelId ?? "N/A"} />
            </div>
          )
        case "isActive":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannel.fields.isActive")} value={item.isActive ?? "N/A"} />
            </div>
          )
        case "priority":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("productChannel.fields.priority")} value={item.priority ?? "N/A"} />
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
        label: isDeleting ? t("productChannel.bulk.deleting") : t("productChannel.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchProductChannelResponse>
        columnHeaders={columnHeaders}
        items={productChannels}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("productChannel.messages.noData")}
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
