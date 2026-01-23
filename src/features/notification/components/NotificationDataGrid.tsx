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
import { SearchNotificationResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface NotificationDataGridProps {
  notifications: SearchNotificationResponse[]
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

export const NotificationDataGrid: React.FC<NotificationDataGridProps> = ({
  notifications,
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

  const columnHeaders: DataGridColumnHeader<SearchNotificationResponse>[] = [
    {
      key: "userFirstName",
      label: t("notification.fields.userFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userLastName",
      label: t("notification.fields.userLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userPhoneNumber",
      label: t("notification.fields.userPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userStatus",
      label: t("notification.fields.userStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userEmail",
      label: t("notification.fields.userEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userId",
      label: t("notification.fields.userId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "type",
      label: t("notification.fields.type"),
      sortable: true,
      resizable: true,
    },
    {
      key: "title",
      label: t("notification.fields.title"),
      sortable: true,
      resizable: true,
    },
    {
      key: "message",
      label: t("notification.fields.message"),
      sortable: true,
      resizable: true,
    },
    {
      key: "alertType",
      label: t("notification.fields.alertType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isRead",
      label: t("notification.fields.isRead"),
      sortable: true,
      resizable: true,
    },
    {
      key: "readAt",
      label: t("notification.fields.readAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actionUrl",
      label: t("notification.fields.actionUrl"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actionLabel",
      label: t("notification.fields.actionLabel"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("notification.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/notification/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/notification/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("notification.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("notification.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchNotificationResponse, column: DataGridColumnHeader<SearchNotificationResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
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
        case "userId":
          return <span className="text-muted-foreground/70">{item.userId || "N/A"}</span>
        case "type":
          return <span className="text-muted-foreground/70">{item.type || "N/A"}</span>
        case "title":
          return <span className="text-muted-foreground/70">{item.title || "N/A"}</span>
        case "message":
          return <span className="text-muted-foreground/70">{item.message || "N/A"}</span>
        case "alertType":
          return <span className="text-muted-foreground/70">{item.alertType || "N/A"}</span>
        case "isRead":
          return <span className="text-muted-foreground/70">{item.isRead || "N/A"}</span>
        case "readAt":
          return <span className="text-muted-foreground/70">{item.readAt || "N/A"}</span>
        case "actionUrl":
          return <span className="text-muted-foreground/70">{item.actionUrl || "N/A"}</span>
        case "actionLabel":
          return <span className="text-muted-foreground/70">{item.actionLabel || "N/A"}</span>
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
        case "userFirstName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.userFirstName")} value={item.userFirstName ?? "N/A"} />
            </div>
          )
        case "userLastName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.userLastName")} value={item.userLastName ?? "N/A"} />
            </div>
          )
        case "userPhoneNumber":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.userPhoneNumber")} value={item.userPhoneNumber ?? "N/A"} />
            </div>
          )
        case "userStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.userStatus")} value={item.userStatus ?? "N/A"} />
            </div>
          )
        case "userEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.userEmail")} value={item.userEmail ?? "N/A"} />
            </div>
          )
        case "userId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.userId")} value={item.userId ?? "N/A"} />
            </div>
          )
        case "type":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.type")} value={item.type ?? "N/A"} />
            </div>
          )
        case "title":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.title")} value={item.title ?? "N/A"} />
            </div>
          )
        case "message":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.message")} value={item.message ?? "N/A"} />
            </div>
          )
        case "alertType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.alertType")} value={item.alertType ?? "N/A"} />
            </div>
          )
        case "isRead":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.isRead")} value={item.isRead ?? "N/A"} />
            </div>
          )
        case "readAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.readAt")} value={item.readAt ?? "N/A"} />
            </div>
          )
        case "actionUrl":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.actionUrl")} value={item.actionUrl ?? "N/A"} />
            </div>
          )
        case "actionLabel":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("notification.fields.actionLabel")} value={item.actionLabel ?? "N/A"} />
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
        label: isDeleting ? t("notification.bulk.deleting") : t("notification.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchNotificationResponse>
        columnHeaders={columnHeaders}
        items={notifications}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("notification.messages.noData")}
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
