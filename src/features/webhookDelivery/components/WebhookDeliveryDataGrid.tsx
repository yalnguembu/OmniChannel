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
import { SearchWebhookDeliveryResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface WebhookDeliveryDataGridProps {
  webhookDeliverys: SearchWebhookDeliveryResponse[]
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

export const WebhookDeliveryDataGrid: React.FC<WebhookDeliveryDataGridProps> = ({
  webhookDeliverys,
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

  const columnHeaders: DataGridColumnHeader<SearchWebhookDeliveryResponse>[] = [
    {
      key: "webhookEndpointName",
      label: t("webhookDelivery.fields.webhookEndpointName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "webhookEndpointId",
      label: t("webhookDelivery.fields.webhookEndpointId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "eventType",
      label: t("webhookDelivery.fields.eventType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "payload",
      label: t("webhookDelivery.fields.payload"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("webhookDelivery.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "httpStatusCode",
      label: t("webhookDelivery.fields.httpStatusCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "responseBody",
      label: t("webhookDelivery.fields.responseBody"),
      sortable: true,
      resizable: true,
    },
    {
      key: "errorMessage",
      label: t("webhookDelivery.fields.errorMessage"),
      sortable: true,
      resizable: true,
    },
    {
      key: "attemptCount",
      label: t("webhookDelivery.fields.attemptCount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "nextRetryAt",
      label: t("webhookDelivery.fields.nextRetryAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "sentAt",
      label: t("webhookDelivery.fields.sentAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("webhookDelivery.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/webhookDelivery/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/webhookDelivery/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("webhookDelivery.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("webhookDelivery.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchWebhookDeliveryResponse, column: DataGridColumnHeader<SearchWebhookDeliveryResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "webhookEndpointName":
          return <span className="text-muted-foreground/70">{item.webhookEndpointName || "N/A"}</span>
        case "webhookEndpointId":
          return <span className="text-muted-foreground/70">{item.webhookEndpointId || "N/A"}</span>
        case "eventType":
          return <span className="text-muted-foreground/70">{item.eventType || "N/A"}</span>
        case "payload":
          return <span className="text-muted-foreground/70">{item.payload || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "httpStatusCode":
          return <span className="text-muted-foreground/70">{item.httpStatusCode || "N/A"}</span>
        case "responseBody":
          return <span className="text-muted-foreground/70">{item.responseBody || "N/A"}</span>
        case "errorMessage":
          return <span className="text-muted-foreground/70">{item.errorMessage || "N/A"}</span>
        case "attemptCount":
          return <span className="text-muted-foreground/70">{item.attemptCount || "N/A"}</span>
        case "nextRetryAt":
          return <span className="text-muted-foreground/70">{item.nextRetryAt || "N/A"}</span>
        case "sentAt":
          return <span className="text-muted-foreground/70">{item.sentAt || "N/A"}</span>
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
        case "webhookEndpointName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.webhookEndpointName")} value={item.webhookEndpointName ?? "N/A"} />
            </div>
          )
        case "webhookEndpointId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.webhookEndpointId")} value={item.webhookEndpointId ?? "N/A"} />
            </div>
          )
        case "eventType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.eventType")} value={item.eventType ?? "N/A"} />
            </div>
          )
        case "payload":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.payload")} value={item.payload ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "httpStatusCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.httpStatusCode")} value={item.httpStatusCode ?? "N/A"} />
            </div>
          )
        case "responseBody":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.responseBody")} value={item.responseBody ?? "N/A"} />
            </div>
          )
        case "errorMessage":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.errorMessage")} value={item.errorMessage ?? "N/A"} />
            </div>
          )
        case "attemptCount":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.attemptCount")} value={item.attemptCount ?? "N/A"} />
            </div>
          )
        case "nextRetryAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.nextRetryAt")} value={item.nextRetryAt ?? "N/A"} />
            </div>
          )
        case "sentAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookDelivery.fields.sentAt")} value={item.sentAt ?? "N/A"} />
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
        label: isDeleting ? t("webhookDelivery.bulk.deleting") : t("webhookDelivery.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchWebhookDeliveryResponse>
        columnHeaders={columnHeaders}
        items={webhookDeliverys}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("webhookDelivery.messages.noData")}
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
