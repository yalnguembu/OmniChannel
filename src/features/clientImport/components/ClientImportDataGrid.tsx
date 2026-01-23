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
import { SearchClientImportResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface ClientImportDataGridProps {
  clientImports: SearchClientImportResponse[]
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

export const ClientImportDataGrid: React.FC<ClientImportDataGridProps> = ({
  clientImports,
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

  const columnHeaders: DataGridColumnHeader<SearchClientImportResponse>[] = [
    {
      key: "productName",
      label: t("clientImport.fields.productName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productStatus",
      label: t("clientImport.fields.productStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productId",
      label: t("clientImport.fields.productId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "fileName",
      label: t("clientImport.fields.fileName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "fileSize",
      label: t("clientImport.fields.fileSize"),
      sortable: true,
      resizable: true,
    },
    {
      key: "fileUrl",
      label: t("clientImport.fields.fileUrl"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("clientImport.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalRows",
      label: t("clientImport.fields.totalRows"),
      sortable: true,
      resizable: true,
    },
    {
      key: "successfulRows",
      label: t("clientImport.fields.successfulRows"),
      sortable: true,
      resizable: true,
    },
    {
      key: "failedRows",
      label: t("clientImport.fields.failedRows"),
      sortable: true,
      resizable: true,
    },
    {
      key: "duplicateRows",
      label: t("clientImport.fields.duplicateRows"),
      sortable: true,
      resizable: true,
    },
    {
      key: "mappingConfiguration",
      label: t("clientImport.fields.mappingConfiguration"),
      sortable: true,
      resizable: true,
    },
    {
      key: "errorLog",
      label: t("clientImport.fields.errorLog"),
      sortable: true,
      resizable: true,
    },
    {
      key: "startedAt",
      label: t("clientImport.fields.startedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "completedAt",
      label: t("clientImport.fields.completedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("clientImport.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/clientImport/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/clientImport/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("clientImport.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("clientImport.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchClientImportResponse, column: DataGridColumnHeader<SearchClientImportResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "productName":
          return <span className="text-muted-foreground/70">{item.productName || "N/A"}</span>
        case "productStatus":
          return <span className="text-muted-foreground/70">{item.productStatus || "N/A"}</span>
        case "productId":
          return <span className="text-muted-foreground/70">{item.productId || "N/A"}</span>
        case "fileName":
          return <span className="text-muted-foreground/70">{item.fileName || "N/A"}</span>
        case "fileSize":
          return <span className="text-muted-foreground/70">{item.fileSize || "N/A"}</span>
        case "fileUrl":
          return <span className="text-muted-foreground/70">{item.fileUrl || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "totalRows":
          return <span className="text-muted-foreground/70">{item.totalRows || "N/A"}</span>
        case "successfulRows":
          return <span className="text-muted-foreground/70">{item.successfulRows || "N/A"}</span>
        case "failedRows":
          return <span className="text-muted-foreground/70">{item.failedRows || "N/A"}</span>
        case "duplicateRows":
          return <span className="text-muted-foreground/70">{item.duplicateRows || "N/A"}</span>
        case "mappingConfiguration":
          return <span className="text-muted-foreground/70">{item.mappingConfiguration || "N/A"}</span>
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
        case "productName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.productName")} value={item.productName ?? "N/A"} />
            </div>
          )
        case "productStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.productStatus")} value={item.productStatus ?? "N/A"} />
            </div>
          )
        case "productId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.productId")} value={item.productId ?? "N/A"} />
            </div>
          )
        case "fileName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.fileName")} value={item.fileName ?? "N/A"} />
            </div>
          )
        case "fileSize":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.fileSize")} value={item.fileSize ?? "N/A"} />
            </div>
          )
        case "fileUrl":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.fileUrl")} value={item.fileUrl ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "totalRows":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.totalRows")} value={item.totalRows ?? "N/A"} />
            </div>
          )
        case "successfulRows":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.successfulRows")} value={item.successfulRows ?? "N/A"} />
            </div>
          )
        case "failedRows":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.failedRows")} value={item.failedRows ?? "N/A"} />
            </div>
          )
        case "duplicateRows":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.duplicateRows")} value={item.duplicateRows ?? "N/A"} />
            </div>
          )
        case "mappingConfiguration":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.mappingConfiguration")} value={item.mappingConfiguration ?? "N/A"} />
            </div>
          )
        case "errorLog":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.errorLog")} value={item.errorLog ?? "N/A"} />
            </div>
          )
        case "startedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.startedAt")} value={item.startedAt ?? "N/A"} />
            </div>
          )
        case "completedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("clientImport.fields.completedAt")} value={item.completedAt ?? "N/A"} />
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
        label: isDeleting ? t("clientImport.bulk.deleting") : t("clientImport.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchClientImportResponse>
        columnHeaders={columnHeaders}
        items={clientImports}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("clientImport.messages.noData")}
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
