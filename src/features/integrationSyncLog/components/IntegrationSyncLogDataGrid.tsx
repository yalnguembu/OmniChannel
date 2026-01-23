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
import { SearchIntegrationSyncLogResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface IntegrationSyncLogDataGridProps {
  integrationSyncLogs: SearchIntegrationSyncLogResponse[]
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

export const IntegrationSyncLogDataGrid: React.FC<IntegrationSyncLogDataGridProps> = ({
  integrationSyncLogs,
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

  const columnHeaders: DataGridColumnHeader<SearchIntegrationSyncLogResponse>[] = [
    {
      key: "integrationName",
      label: t("integrationSyncLog.fields.integrationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "integrationType",
      label: t("integrationSyncLog.fields.integrationType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "integrationId",
      label: t("integrationSyncLog.fields.integrationId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "syncType",
      label: t("integrationSyncLog.fields.syncType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("integrationSyncLog.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "recordsProcessed",
      label: t("integrationSyncLog.fields.recordsProcessed"),
      sortable: true,
      resizable: true,
    },
    {
      key: "recordsSucceeded",
      label: t("integrationSyncLog.fields.recordsSucceeded"),
      sortable: true,
      resizable: true,
    },
    {
      key: "recordsFailed",
      label: t("integrationSyncLog.fields.recordsFailed"),
      sortable: true,
      resizable: true,
    },
    {
      key: "errorLog",
      label: t("integrationSyncLog.fields.errorLog"),
      sortable: true,
      resizable: true,
    },
    {
      key: "startedAt",
      label: t("integrationSyncLog.fields.startedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "completedAt",
      label: t("integrationSyncLog.fields.completedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("integrationSyncLog.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/integrationSyncLog/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/integrationSyncLog/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("integrationSyncLog.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("integrationSyncLog.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchIntegrationSyncLogResponse, column: DataGridColumnHeader<SearchIntegrationSyncLogResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "integrationName":
          return <span className="text-muted-foreground/70">{item.integrationName || "N/A"}</span>
        case "integrationType":
          return <span className="text-muted-foreground/70">{item.integrationType || "N/A"}</span>
        case "integrationId":
          return <span className="text-muted-foreground/70">{item.integrationId || "N/A"}</span>
        case "syncType":
          return <span className="text-muted-foreground/70">{item.syncType || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "recordsProcessed":
          return <span className="text-muted-foreground/70">{item.recordsProcessed || "N/A"}</span>
        case "recordsSucceeded":
          return <span className="text-muted-foreground/70">{item.recordsSucceeded || "N/A"}</span>
        case "recordsFailed":
          return <span className="text-muted-foreground/70">{item.recordsFailed || "N/A"}</span>
        case "errorLog":
          return <span className="text-muted-foreground/70">{item.errorLog || "N/A"}</span>
        case "startedAt":
          return <span className="text-muted-foreground/70">{item.startedAt || "N/A"}</span>
        case "completedAt":
          return <span className="text-muted-foreground/70">{item.completedAt || "N/A"}</span>
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
        case "integrationName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.integrationName")} value={item.integrationName ?? "N/A"} />
            </div>
          )
        case "integrationType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.integrationType")} value={item.integrationType ?? "N/A"} />
            </div>
          )
        case "integrationId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.integrationId")} value={item.integrationId ?? "N/A"} />
            </div>
          )
        case "syncType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.syncType")} value={item.syncType ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "recordsProcessed":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.recordsProcessed")} value={item.recordsProcessed ?? "N/A"} />
            </div>
          )
        case "recordsSucceeded":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.recordsSucceeded")} value={item.recordsSucceeded ?? "N/A"} />
            </div>
          )
        case "recordsFailed":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.recordsFailed")} value={item.recordsFailed ?? "N/A"} />
            </div>
          )
        case "errorLog":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.errorLog")} value={item.errorLog ?? "N/A"} />
            </div>
          )
        case "startedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.startedAt")} value={item.startedAt ?? "N/A"} />
            </div>
          )
        case "completedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("integrationSyncLog.fields.completedAt")} value={item.completedAt ?? "N/A"} />
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
        label: isDeleting ? t("integrationSyncLog.bulk.deleting") : t("integrationSyncLog.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchIntegrationSyncLogResponse>
        columnHeaders={columnHeaders}
        items={integrationSyncLogs}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("integrationSyncLog.messages.noData")}
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
