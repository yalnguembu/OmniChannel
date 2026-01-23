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
import { SearchEntityTagResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface EntityTagDataGridProps {
  entityTags: SearchEntityTagResponse[]
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

export const EntityTagDataGrid: React.FC<EntityTagDataGridProps> = ({
  entityTags,
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

  const columnHeaders: DataGridColumnHeader<SearchEntityTagResponse>[] = [
    {
      key: "tagName",
      label: t("entityTag.fields.tagName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityId",
      label: t("entityTag.fields.entityId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "entityType",
      label: t("entityTag.fields.entityType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "tagId",
      label: t("entityTag.fields.tagId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("entityTag.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/entityTag/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/entityTag/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("entityTag.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("entityTag.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchEntityTagResponse, column: DataGridColumnHeader<SearchEntityTagResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "tagName":
          return <span className="text-muted-foreground/70">{item.tagName || "N/A"}</span>
        case "entityId":
          return <span className="text-muted-foreground/70">{item.entityId || "N/A"}</span>
        case "entityType":
          return <span className="text-muted-foreground/70">{item.entityType || "N/A"}</span>
        case "tagId":
          return <span className="text-muted-foreground/70">{item.tagId || "N/A"}</span>
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
        case "tagName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("entityTag.fields.tagName")} value={item.tagName ?? "N/A"} />
            </div>
          )
        case "entityId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("entityTag.fields.entityId")} value={item.entityId ?? "N/A"} />
            </div>
          )
        case "entityType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("entityTag.fields.entityType")} value={item.entityType ?? "N/A"} />
            </div>
          )
        case "tagId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("entityTag.fields.tagId")} value={item.tagId ?? "N/A"} />
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
        label: isDeleting ? t("entityTag.bulk.deleting") : t("entityTag.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchEntityTagResponse>
        columnHeaders={columnHeaders}
        items={entityTags}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("entityTag.messages.noData")}
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
