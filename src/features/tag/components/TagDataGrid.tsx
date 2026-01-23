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
import { SearchTagResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface TagDataGridProps {
  tags: SearchTagResponse[]
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

export const TagDataGrid: React.FC<TagDataGridProps> = ({
  tags,
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

  const columnHeaders: DataGridColumnHeader<SearchTagResponse>[] = [
    {
      key: "companyName",
      label: t("tag.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("tag.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("tag.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("tag.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("tag.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "color",
      label: t("tag.fields.color"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("tag.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/tag/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/tag/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("tag.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("tag.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchTagResponse, column: DataGridColumnHeader<SearchTagResponse>, view: ViewMode): ReactNode => {
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
        case "name":
          return <span className="text-muted-foreground/70">{item.name || "N/A"}</span>
        case "color":
          return <span className="text-muted-foreground/70">{item.color || "N/A"}</span>
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
              <DetailsCardItem label={t("tag.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("tag.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("tag.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("tag.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "name":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("tag.fields.name")} value={item.name ?? "N/A"} />
            </div>
          )
        case "color":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("tag.fields.color")} value={item.color ?? "N/A"} />
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
        label: isDeleting ? t("tag.bulk.deleting") : t("tag.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchTagResponse>
        columnHeaders={columnHeaders}
        items={tags}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("tag.messages.noData")}
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
