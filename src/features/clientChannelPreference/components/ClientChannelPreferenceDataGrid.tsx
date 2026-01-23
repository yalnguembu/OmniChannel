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
import { SearchClientChannelPreferenceResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface ClientChannelPreferenceDataGridProps {
  clientChannelPreferences: SearchClientChannelPreferenceResponse[]
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

export const ClientChannelPreferenceDataGrid: React.FC<ClientChannelPreferenceDataGridProps> = ({
  clientChannelPreferences,
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

  const columnHeaders: DataGridColumnHeader<SearchClientChannelPreferenceResponse>[] = [
    {
      key: "channelName",
      label: t("clientChannelPreference.fields.channelName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelCode",
      label: t("clientChannelPreference.fields.channelCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientFirstName",
      label: t("clientChannelPreference.fields.clientFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientLastName",
      label: t("clientChannelPreference.fields.clientLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientStatus",
      label: t("clientChannelPreference.fields.clientStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientEmail",
      label: t("clientChannelPreference.fields.clientEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientId",
      label: t("clientChannelPreference.fields.clientId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "channelId",
      label: t("clientChannelPreference.fields.channelId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isOptedIn",
      label: t("clientChannelPreference.fields.isOptedIn"),
      sortable: true,
      resizable: true,
    },
    {
      key: "optedInAt",
      label: t("clientChannelPreference.fields.optedInAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "optedOutAt",
      label: t("clientChannelPreference.fields.optedOutAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "optOutReason",
      label: t("clientChannelPreference.fields.optOutReason"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("clientChannelPreference.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/clientChannelPreference/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/clientChannelPreference/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("clientChannelPreference.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("clientChannelPreference.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchClientChannelPreferenceResponse, column: DataGridColumnHeader<SearchClientChannelPreferenceResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "channelName":
          return <span className="text-muted-foreground/70">{item.channelName || "N/A"}</span>
        case "channelCode":
          return <span className="text-muted-foreground/70">{item.channelCode || "N/A"}</span>
        case "clientFirstName":
          return <span className="text-muted-foreground/70">{item.clientFirstName || "N/A"}</span>
        case "clientLastName":
          return <span className="text-muted-foreground/70">{item.clientLastName || "N/A"}</span>
        case "clientStatus":
          return <span className="text-muted-foreground/70">{item.clientStatus || "N/A"}</span>
        case "clientEmail":
          return <span className="text-muted-foreground/70">{item.clientEmail || "N/A"}</span>
        case "clientId":
          return <span className="text-muted-foreground/70">{item.clientId || "N/A"}</span>
        case "channelId":
          return <span className="text-muted-foreground/70">{item.channelId || "N/A"}</span>
        case "isOptedIn":
          return <span className="text-muted-foreground/70">{item.isOptedIn || "N/A"}</span>
        case "optedInAt":
          return <span className="text-muted-foreground/70">{item.optedInAt || "N/A"}</span>
        case "optedOutAt":
          return <span className="text-muted-foreground/70">{item.optedOutAt || "N/A"}</span>
        case "optOutReason":
          return <span className="text-muted-foreground/70">{item.optOutReason || "N/A"}</span>
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
              <DetailsCardItem label={t("clientChannelPreference.fields.channelName")} value={item.channelName ?? "N/A"} />
            </div>
          )
        case "channelCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.channelCode")} value={item.channelCode ?? "N/A"} />
            </div>
          )
        case "clientFirstName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.clientFirstName")} value={item.clientFirstName ?? "N/A"} />
            </div>
          )
        case "clientLastName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.clientLastName")} value={item.clientLastName ?? "N/A"} />
            </div>
          )
        case "clientStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.clientStatus")} value={item.clientStatus ?? "N/A"} />
            </div>
          )
        case "clientEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.clientEmail")} value={item.clientEmail ?? "N/A"} />
            </div>
          )
        case "clientId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.clientId")} value={item.clientId ?? "N/A"} />
            </div>
          )
        case "channelId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.channelId")} value={item.channelId ?? "N/A"} />
            </div>
          )
        case "isOptedIn":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.isOptedIn")} value={item.isOptedIn ?? "N/A"} />
            </div>
          )
        case "optedInAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.optedInAt")} value={item.optedInAt ?? "N/A"} />
            </div>
          )
        case "optedOutAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.optedOutAt")} value={item.optedOutAt ?? "N/A"} />
            </div>
          )
        case "optOutReason":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientChannelPreference.fields.optOutReason")} value={item.optOutReason ?? "N/A"} />
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
        label: isDeleting ? t("clientChannelPreference.bulk.deleting") : t("clientChannelPreference.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchClientChannelPreferenceResponse>
        columnHeaders={columnHeaders}
        items={clientChannelPreferences}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("clientChannelPreference.messages.noData")}
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
