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
import { SearchProviderCallbackResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface ProviderCallbackDataGridProps {
  providerCallbacks: SearchProviderCallbackResponse[]
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

export const ProviderCallbackDataGrid: React.FC<ProviderCallbackDataGridProps> = ({
  providerCallbacks,
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

  const columnHeaders: DataGridColumnHeader<SearchProviderCallbackResponse>[] = [
    {
      key: "messageStatus",
      label: t("providerCallback.fields.messageStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerName",
      label: t("providerCallback.fields.providerName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerCode",
      label: t("providerCallback.fields.providerCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerId",
      label: t("providerCallback.fields.providerId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "messageId",
      label: t("providerCallback.fields.messageId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "externalMessageId",
      label: t("providerCallback.fields.externalMessageId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "rawPayload",
      label: t("providerCallback.fields.rawPayload"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("providerCallback.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "processedAt",
      label: t("providerCallback.fields.processedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "errorMessage",
      label: t("providerCallback.fields.errorMessage"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("providerCallback.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/providerCallback/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/providerCallback/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("providerCallback.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("providerCallback.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchProviderCallbackResponse, column: DataGridColumnHeader<SearchProviderCallbackResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "messageStatus":
          return <span className="text-muted-foreground/70">{item.messageStatus || "N/A"}</span>
        case "providerName":
          return <span className="text-muted-foreground/70">{item.providerName || "N/A"}</span>
        case "providerCode":
          return <span className="text-muted-foreground/70">{item.providerCode || "N/A"}</span>
        case "providerId":
          return <span className="text-muted-foreground/70">{item.providerId || "N/A"}</span>
        case "messageId":
          return <span className="text-muted-foreground/70">{item.messageId || "N/A"}</span>
        case "externalMessageId":
          return <span className="text-muted-foreground/70">{item.externalMessageId || "N/A"}</span>
        case "rawPayload":
          return <span className="text-muted-foreground/70">{item.rawPayload || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "processedAt":
          return <span className="text-muted-foreground/70">{item.processedAt || "N/A"}</span>
        case "errorMessage":
          return <span className="text-muted-foreground/70">{item.errorMessage || "N/A"}</span>
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
              <DetailsCardItem label={t("providerCallback.fields.messageStatus")} value={item.messageStatus ?? "N/A"} />
            </div>
          )
        case "providerName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("providerCallback.fields.providerName")} value={item.providerName ?? "N/A"} />
            </div>
          )
        case "providerCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("providerCallback.fields.providerCode")} value={item.providerCode ?? "N/A"} />
            </div>
          )
        case "providerId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("providerCallback.fields.providerId")} value={item.providerId ?? "N/A"} />
            </div>
          )
        case "messageId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("providerCallback.fields.messageId")} value={item.messageId ?? "N/A"} />
            </div>
          )
        case "externalMessageId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("providerCallback.fields.externalMessageId")} value={item.externalMessageId ?? "N/A"} />
            </div>
          )
        case "rawPayload":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("providerCallback.fields.rawPayload")} value={item.rawPayload ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("providerCallback.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "processedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("providerCallback.fields.processedAt")} value={item.processedAt ?? "N/A"} />
            </div>
          )
        case "errorMessage":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("providerCallback.fields.errorMessage")} value={item.errorMessage ?? "N/A"} />
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
        label: isDeleting ? t("providerCallback.bulk.deleting") : t("providerCallback.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchProviderCallbackResponse>
        columnHeaders={columnHeaders}
        items={providerCallbacks}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("providerCallback.messages.noData")}
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
