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
import { SearchProviderResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface ProviderDataGridProps {
  providers: SearchProviderResponse[]
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

export const ProviderDataGrid: React.FC<ProviderDataGridProps> = ({
  providers,
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

  const columnHeaders: DataGridColumnHeader<SearchProviderResponse>[] = [
    {
      key: "name",
      label: t("provider.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "code",
      label: t("provider.fields.code"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isGlobal",
      label: t("provider.fields.isGlobal"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("provider.fields.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "baseUrl",
      label: t("provider.fields.baseUrl"),
      sortable: true,
      resizable: true,
    },
    {
      key: "documentationUrl",
      label: t("provider.fields.documentationUrl"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("provider.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/provider/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/provider/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("provider.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("provider.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchProviderResponse, column: DataGridColumnHeader<SearchProviderResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "name":
          return <span className="text-muted-foreground/70">{item.name || "N/A"}</span>
        case "code":
          return <span className="text-muted-foreground/70">{item.code || "N/A"}</span>
        case "isGlobal":
          return <span className="text-muted-foreground/70">{item.isGlobal || "N/A"}</span>
        case "isActive":
          return <span className="text-muted-foreground/70">{item.isActive || "N/A"}</span>
        case "baseUrl":
          return <span className="text-muted-foreground/70">{item.baseUrl || "N/A"}</span>
        case "documentationUrl":
          return <span className="text-muted-foreground/70">{item.documentationUrl || "N/A"}</span>
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
        case "name":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("provider.fields.name")} value={item.name ?? "N/A"} />
            </div>
          )
        case "code":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("provider.fields.code")} value={item.code ?? "N/A"} />
            </div>
          )
        case "isGlobal":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("provider.fields.isGlobal")} value={item.isGlobal ?? "N/A"} />
            </div>
          )
        case "isActive":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("provider.fields.isActive")} value={item.isActive ?? "N/A"} />
            </div>
          )
        case "baseUrl":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("provider.fields.baseUrl")} value={item.baseUrl ?? "N/A"} />
            </div>
          )
        case "documentationUrl":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("provider.fields.documentationUrl")} value={item.documentationUrl ?? "N/A"} />
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
        label: isDeleting ? t("provider.bulk.deleting") : t("provider.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchProviderResponse>
        columnHeaders={columnHeaders}
        items={providers}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("provider.messages.noData")}
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
