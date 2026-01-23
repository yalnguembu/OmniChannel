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
import { SearchMessageEventResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface MessageEventDataGridProps {
  messageEvents: SearchMessageEventResponse[]
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

export const MessageEventDataGrid: React.FC<MessageEventDataGridProps> = ({
  messageEvents,
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

  const columnHeaders: DataGridColumnHeader<SearchMessageEventResponse>[] = [
    {
      key: "messageStatus",
      label: t("messageEvent.fields.messageStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "messageId",
      label: t("messageEvent.fields.messageId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "eventType",
      label: t("messageEvent.fields.eventType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "eventData",
      label: t("messageEvent.fields.eventData"),
      sortable: true,
      resizable: true,
    },
    {
      key: "ipAddress",
      label: t("messageEvent.fields.ipAddress"),
      sortable: true,
      resizable: true,
    },
    {
      key: "userAgent",
      label: t("messageEvent.fields.userAgent"),
      sortable: true,
      resizable: true,
    },
    {
      key: "location",
      label: t("messageEvent.fields.location"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("messageEvent.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/messageEvent/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/messageEvent/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("messageEvent.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("messageEvent.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchMessageEventResponse, column: DataGridColumnHeader<SearchMessageEventResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "messageStatus":
          return <span className="text-muted-foreground/70">{item.messageStatus || "N/A"}</span>
        case "messageId":
          return <span className="text-muted-foreground/70">{item.messageId || "N/A"}</span>
        case "eventType":
          return <span className="text-muted-foreground/70">{item.eventType || "N/A"}</span>
        case "eventData":
          return <span className="text-muted-foreground/70">{item.eventData || "N/A"}</span>
        case "ipAddress":
          return <span className="text-muted-foreground/70">{item.ipAddress || "N/A"}</span>
        case "userAgent":
          return <span className="text-muted-foreground/70">{item.userAgent || "N/A"}</span>
        case "location":
          return <span className="text-muted-foreground/70">{item.location || "N/A"}</span>
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
        case "messageStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("messageEvent.fields.messageStatus")} value={item.messageStatus ?? "N/A"} />
            </div>
          )
        case "messageId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("messageEvent.fields.messageId")} value={item.messageId ?? "N/A"} />
            </div>
          )
        case "eventType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("messageEvent.fields.eventType")} value={item.eventType ?? "N/A"} />
            </div>
          )
        case "eventData":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("messageEvent.fields.eventData")} value={item.eventData ?? "N/A"} />
            </div>
          )
        case "ipAddress":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("messageEvent.fields.ipAddress")} value={item.ipAddress ?? "N/A"} />
            </div>
          )
        case "userAgent":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("messageEvent.fields.userAgent")} value={item.userAgent ?? "N/A"} />
            </div>
          )
        case "location":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("messageEvent.fields.location")} value={item.location ?? "N/A"} />
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
        label: isDeleting ? t("messageEvent.bulk.deleting") : t("messageEvent.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchMessageEventResponse>
        columnHeaders={columnHeaders}
        items={messageEvents}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("messageEvent.messages.noData")}
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
