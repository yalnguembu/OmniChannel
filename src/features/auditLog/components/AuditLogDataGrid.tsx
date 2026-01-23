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
import { SearchAuditLogResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface AuditLogDataGridProps {
  auditLogs: SearchAuditLogResponse[]
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

export const AuditLogDataGrid: React.FC<AuditLogDataGridProps> = ({
  auditLogs,
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

  const columnHeaders: DataGridColumnHeader<SearchAuditLogResponse>[] = [
    {
      key: "companyName",
      label: t("auditLog.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("auditLog.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("auditLog.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userFirstName",
      label: t("auditLog.fields.userFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userLastName",
      label: t("auditLog.fields.userLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userPhoneNumber",
      label: t("auditLog.fields.userPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userStatus",
      label: t("auditLog.fields.userStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userEmail",
      label: t("auditLog.fields.userEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("auditLog.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userId",
      label: t("auditLog.fields.userId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "action",
      label: t("auditLog.fields.action"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityType",
      label: t("auditLog.fields.entityType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityId",
      label: t("auditLog.fields.entityId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityName",
      label: t("auditLog.fields.entityName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityDisplayName",
      label: t("auditLog.fields.entityDisplayName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "oldValues",
      label: t("auditLog.fields.oldValues"),
      sortable: true,
      resizable: true,
    },
    {
      key: "newValues",
      label: t("auditLog.fields.newValues"),
      sortable: true,
      resizable: true,
    },
    {
      key: "changedColumn",
      label: t("auditLog.fields.changedColumn"),
      sortable: true,
      resizable: true,
    },
    {
      key: "changeReason",
      label: t("auditLog.fields.changeReason"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipAddress",
      label: t("auditLog.fields.ipAddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userAgent",
      label: t("auditLog.fields.userAgent"),
      sortable: true,
      resizable: true,
    },
    {
      key: "riskLevel",
      label: t("auditLog.fields.riskLevel"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("auditLog.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/auditLog/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/auditLog/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("auditLog.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("auditLog.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchAuditLogResponse, column: DataGridColumnHeader<SearchAuditLogResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "companyName":
          return <span className="text-muted-foreground/70">{item.companyName || "N/A"}</span>
        case "companyStatus":
          return <span className="text-muted-foreground/70">{item.companyStatus || "N/A"}</span>
        case "companyEmail":
          return <span className="text-muted-foreground/70">{item.companyEmail || "N/A"}</span>
        case "userFirstName":
          return <span className="text-muted-foreground/70">{item.userFirstName || "N/A"}</span>
        case "userLastName":
          return <span className="text-muted-foreground/70">{item.userLastName || "N/A"}</span>
        case "userPhoneNumber":
          return <span className="text-muted-foreground/70">{item.userPhoneNumber || "N/A"}</span>
        case "userStatus":
          return <span className="text-muted-foreground/70">{item.userStatus || "N/A"}</span>
        case "userEmail":
          return <span className="text-muted-foreground/70">{item.userEmail || "N/A"}</span>
        case "companyId":
          return <span className="text-muted-foreground/70">{item.companyId || "N/A"}</span>
        case "userId":
          return <span className="text-muted-foreground/70">{item.userId || "N/A"}</span>
        case "action":
          return <span className="text-muted-foreground/70">{item.action || "N/A"}</span>
        case "entityType":
          return <span className="text-muted-foreground/70">{item.entityType || "N/A"}</span>
        case "entityId":
          return <span className="text-muted-foreground/70">{item.entityId || "N/A"}</span>
        case "entityName":
          return <span className="text-muted-foreground/70">{item.entityName || "N/A"}</span>
        case "entityDisplayName":
          return <span className="text-muted-foreground/70">{item.entityDisplayName || "N/A"}</span>
        case "oldValues":
          return <span className="text-muted-foreground/70">{item.oldValues || "N/A"}</span>
        case "newValues":
          return <span className="text-muted-foreground/70">{item.newValues || "N/A"}</span>
        case "changedColumn":
          return <span className="text-muted-foreground/70">{item.changedColumn || "N/A"}</span>
        case "changeReason":
          return <span className="text-muted-foreground/70">{item.changeReason || "N/A"}</span>
        case "ipAddress":
          return <span className="text-muted-foreground/70">{item.ipAddress || "N/A"}</span>
        case "userAgent":
          return <span className="text-muted-foreground/70">{item.userAgent || "N/A"}</span>
        case "riskLevel":
          return <span className="text-muted-foreground/70">{item.riskLevel || "N/A"}</span>
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
              <DetailsCardItem label={t("auditLog.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "userFirstName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.userFirstName")} value={item.userFirstName ?? "N/A"} />
            </div>
          )
        case "userLastName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.userLastName")} value={item.userLastName ?? "N/A"} />
            </div>
          )
        case "userPhoneNumber":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.userPhoneNumber")} value={item.userPhoneNumber ?? "N/A"} />
            </div>
          )
        case "userStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.userStatus")} value={item.userStatus ?? "N/A"} />
            </div>
          )
        case "userEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.userEmail")} value={item.userEmail ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "userId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.userId")} value={item.userId ?? "N/A"} />
            </div>
          )
        case "action":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.action")} value={item.action ?? "N/A"} />
            </div>
          )
        case "entityType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.entityType")} value={item.entityType ?? "N/A"} />
            </div>
          )
        case "entityId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.entityId")} value={item.entityId ?? "N/A"} />
            </div>
          )
        case "entityName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.entityName")} value={item.entityName ?? "N/A"} />
            </div>
          )
        case "entityDisplayName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.entityDisplayName")} value={item.entityDisplayName ?? "N/A"} />
            </div>
          )
        case "oldValues":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.oldValues")} value={item.oldValues ?? "N/A"} />
            </div>
          )
        case "newValues":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.newValues")} value={item.newValues ?? "N/A"} />
            </div>
          )
        case "changedColumn":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.changedColumn")} value={item.changedColumn ?? "N/A"} />
            </div>
          )
        case "changeReason":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.changeReason")} value={item.changeReason ?? "N/A"} />
            </div>
          )
        case "ipAddress":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.ipAddress")} value={item.ipAddress ?? "N/A"} />
            </div>
          )
        case "userAgent":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.userAgent")} value={item.userAgent ?? "N/A"} />
            </div>
          )
        case "riskLevel":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("auditLog.fields.riskLevel")} value={item.riskLevel ?? "N/A"} />
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
        label: isDeleting ? t("auditLog.bulk.deleting") : t("auditLog.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchAuditLogResponse>
        columnHeaders={columnHeaders}
        items={auditLogs}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("auditLog.messages.noData")}
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
