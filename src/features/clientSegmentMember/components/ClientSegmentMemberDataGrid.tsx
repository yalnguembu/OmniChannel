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
import { SearchClientSegmentMemberResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface ClientSegmentMemberDataGridProps {
  clientSegmentMembers: SearchClientSegmentMemberResponse[]
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

export const ClientSegmentMemberDataGrid: React.FC<ClientSegmentMemberDataGridProps> = ({
  clientSegmentMembers,
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

  const columnHeaders: DataGridColumnHeader<SearchClientSegmentMemberResponse>[] = [
    {
      key: "clientFirstName",
      label: t("clientSegmentMember.fields.clientFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientLastName",
      label: t("clientSegmentMember.fields.clientLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientStatus",
      label: t("clientSegmentMember.fields.clientStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientEmail",
      label: t("clientSegmentMember.fields.clientEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "segmentName",
      label: t("clientSegmentMember.fields.segmentName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clientId",
      label: t("clientSegmentMember.fields.clientId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "segmentId",
      label: t("clientSegmentMember.fields.segmentId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "addedAt",
      label: t("clientSegmentMember.fields.addedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("clientSegmentMember.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/clientSegmentMember/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/clientSegmentMember/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("clientSegmentMember.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("clientSegmentMember.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchClientSegmentMemberResponse, column: DataGridColumnHeader<SearchClientSegmentMemberResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "clientFirstName":
          return <span className="text-muted-foreground/70">{item.clientFirstName || "N/A"}</span>
        case "clientLastName":
          return <span className="text-muted-foreground/70">{item.clientLastName || "N/A"}</span>
        case "clientStatus":
          return <span className="text-muted-foreground/70">{item.clientStatus || "N/A"}</span>
        case "clientEmail":
          return <span className="text-muted-foreground/70">{item.clientEmail || "N/A"}</span>
        case "segmentName":
          return <span className="text-muted-foreground/70">{item.segmentName || "N/A"}</span>
        case "clientId":
          return <span className="text-muted-foreground/70">{item.clientId || "N/A"}</span>
        case "segmentId":
          return <span className="text-muted-foreground/70">{item.segmentId || "N/A"}</span>
        case "addedAt":
          return <span className="text-muted-foreground/70">{item.addedAt || "N/A"}</span>
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
        case "clientFirstName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientSegmentMember.fields.clientFirstName")} value={item.clientFirstName ?? "N/A"} />
            </div>
          )
        case "clientLastName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientSegmentMember.fields.clientLastName")} value={item.clientLastName ?? "N/A"} />
            </div>
          )
        case "clientStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientSegmentMember.fields.clientStatus")} value={item.clientStatus ?? "N/A"} />
            </div>
          )
        case "clientEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientSegmentMember.fields.clientEmail")} value={item.clientEmail ?? "N/A"} />
            </div>
          )
        case "segmentName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientSegmentMember.fields.segmentName")} value={item.segmentName ?? "N/A"} />
            </div>
          )
        case "clientId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientSegmentMember.fields.clientId")} value={item.clientId ?? "N/A"} />
            </div>
          )
        case "segmentId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientSegmentMember.fields.segmentId")} value={item.segmentId ?? "N/A"} />
            </div>
          )
        case "addedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientSegmentMember.fields.addedAt")} value={item.addedAt ?? "N/A"} />
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
        label: isDeleting ? t("clientSegmentMember.bulk.deleting") : t("clientSegmentMember.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchClientSegmentMemberResponse>
        columnHeaders={columnHeaders}
        items={clientSegmentMembers}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("clientSegmentMember.messages.noData")}
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
