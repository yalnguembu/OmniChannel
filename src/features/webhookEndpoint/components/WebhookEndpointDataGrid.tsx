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
import { SearchWebhookEndpointResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface WebhookEndpointDataGridProps {
  webhookEndpoints: SearchWebhookEndpointResponse[]
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

export const WebhookEndpointDataGrid: React.FC<WebhookEndpointDataGridProps> = ({
  webhookEndpoints,
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

  const columnHeaders: DataGridColumnHeader<SearchWebhookEndpointResponse>[] = [
    {
      key: "companyName",
      label: t("webhookEndpoint.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("webhookEndpoint.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("webhookEndpoint.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("webhookEndpoint.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "url",
      label: t("webhookEndpoint.fields.url"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("webhookEndpoint.fields.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("webhookEndpoint.fields.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastSecretGenerated",
      label: t("webhookEndpoint.fields.lastSecretGenerated"),
      sortable: true,
      resizable: true,
    },
    {
      key: "events",
      label: t("webhookEndpoint.fields.events"),
      sortable: true,
      resizable: true,
    },
    {
      key: "timeoutSeconds",
      label: t("webhookEndpoint.fields.timeoutSeconds"),
      sortable: true,
      resizable: true,
    },
    {
      key: "maxRetries",
      label: t("webhookEndpoint.fields.maxRetries"),
      sortable: true,
      resizable: true,
    },
    {
      key: "retryDelaySeconds",
      label: t("webhookEndpoint.fields.retryDelaySeconds"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("webhookEndpoint.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/webhookEndpoint/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/webhookEndpoint/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("webhookEndpoint.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("webhookEndpoint.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchWebhookEndpointResponse, column: DataGridColumnHeader<SearchWebhookEndpointResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "companyName":
          return <span className="text-muted-foreground/70">{item.companyName || "N/A"}</span>
        case "companyStatus":
          return <span className="text-muted-foreground/70">{item.companyStatus || "N/A"}</span>
        case "companyEmail":
          return <span className="text-muted-foreground/70">{item.companyEmail || "N/A"}</span>
        case "companyId":
          return <span className="text-muted-foreground/70">{item.companyId || "N/A"}</span>
        case "url":
          return <span className="text-muted-foreground/70">{item.url || "N/A"}</span>
        case "description":
          return <span className="text-muted-foreground/70">{item.description || "N/A"}</span>
        case "isActive":
          return <span className="text-muted-foreground/70">{item.isActive || "N/A"}</span>
        case "lastSecretGenerated":
          return <span className="text-muted-foreground/70">{item.lastSecretGenerated || "N/A"}</span>
        case "events":
          return <span className="text-muted-foreground/70">{item.events || "N/A"}</span>
        case "timeoutSeconds":
          return <span className="text-muted-foreground/70">{item.timeoutSeconds || "N/A"}</span>
        case "maxRetries":
          return <span className="text-muted-foreground/70">{item.maxRetries || "N/A"}</span>
        case "retryDelaySeconds":
          return <span className="text-muted-foreground/70">{item.retryDelaySeconds || "N/A"}</span>
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
              <DetailsCardItem label={t("webhookEndpoint.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "url":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.url")} value={item.url ?? "N/A"} />
            </div>
          )
        case "description":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.description")} value={item.description ?? "N/A"} />
            </div>
          )
        case "isActive":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.isActive")} value={item.isActive ?? "N/A"} />
            </div>
          )
        case "lastSecretGenerated":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.lastSecretGenerated")} value={item.lastSecretGenerated ?? "N/A"} />
            </div>
          )
        case "events":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.events")} value={item.events ?? "N/A"} />
            </div>
          )
        case "timeoutSeconds":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.timeoutSeconds")} value={item.timeoutSeconds ?? "N/A"} />
            </div>
          )
        case "maxRetries":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.maxRetries")} value={item.maxRetries ?? "N/A"} />
            </div>
          )
        case "retryDelaySeconds":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("webhookEndpoint.fields.retryDelaySeconds")} value={item.retryDelaySeconds ?? "N/A"} />
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
        label: isDeleting ? t("webhookEndpoint.bulk.deleting") : t("webhookEndpoint.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchWebhookEndpointResponse>
        columnHeaders={columnHeaders}
        items={webhookEndpoints}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("webhookEndpoint.messages.noData")}
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
