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
import { SearchConnectorResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface ConnectorDataGridProps {
  connectors: SearchConnectorResponse[]
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

export const ConnectorDataGrid: React.FC<ConnectorDataGridProps> = ({
  connectors,
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

  const columnHeaders: DataGridColumnHeader<SearchConnectorResponse>[] = [
    {
      key: "companyName",
      label: t("connector.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("connector.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("connector.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productName",
      label: t("connector.fields.productName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productStatus",
      label: t("connector.fields.productStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerName",
      label: t("connector.fields.providerName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerCode",
      label: t("connector.fields.providerCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "providerId",
      label: t("connector.fields.providerId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "productId",
      label: t("connector.fields.productId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("connector.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("connector.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("connector.fields.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isDefault",
      label: t("connector.fields.isDefault"),
      sortable: true,
      resizable: true,
    },
    {
      key: "configuration",
      label: t("connector.fields.configuration"),
      sortable: true,
      resizable: true,
    },
    {
      key: "priority",
      label: t("connector.fields.priority"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastTestAt",
      label: t("connector.fields.lastTestAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastTestStatus",
      label: t("connector.fields.lastTestStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("connector.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/connector/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/connector/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("connector.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("connector.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchConnectorResponse, column: DataGridColumnHeader<SearchConnectorResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "companyName":
          return <span className="text-muted-foreground/70">{item.companyName || "N/A"}</span>
        case "companyStatus":
          return <span className="text-muted-foreground/70">{item.companyStatus || "N/A"}</span>
        case "companyEmail":
          return <span className="text-muted-foreground/70">{item.companyEmail || "N/A"}</span>
        case "productName":
          return <span className="text-muted-foreground/70">{item.productName || "N/A"}</span>
        case "productStatus":
          return <span className="text-muted-foreground/70">{item.productStatus || "N/A"}</span>
        case "providerName":
          return <span className="text-muted-foreground/70">{item.providerName || "N/A"}</span>
        case "providerCode":
          return <span className="text-muted-foreground/70">{item.providerCode || "N/A"}</span>
        case "providerId":
          return <span className="text-muted-foreground/70">{item.providerId || "N/A"}</span>
        case "productId":
          return <span className="text-muted-foreground/70">{item.productId || "N/A"}</span>
        case "companyId":
          return <span className="text-muted-foreground/70">{item.companyId || "N/A"}</span>
        case "name":
          return <span className="text-muted-foreground/70">{item.name || "N/A"}</span>
        case "isActive":
          return <span className="text-muted-foreground/70">{item.isActive || "N/A"}</span>
        case "isDefault":
          return <span className="text-muted-foreground/70">{item.isDefault || "N/A"}</span>
        case "configuration":
          return <span className="text-muted-foreground/70">{item.configuration || "N/A"}</span>
        case "priority":
          return <span className="text-muted-foreground/70">{item.priority || "N/A"}</span>
        case "lastTestAt":
          return <span className="text-muted-foreground/70">{item.lastTestAt || "N/A"}</span>
        case "lastTestStatus":
          return <span className="text-muted-foreground/70">{item.lastTestStatus || "N/A"}</span>
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
              <DetailsCardItem label={t("connector.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "productName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.productName")} value={item.productName ?? "N/A"} />
            </div>
          )
        case "productStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.productStatus")} value={item.productStatus ?? "N/A"} />
            </div>
          )
        case "providerName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.providerName")} value={item.providerName ?? "N/A"} />
            </div>
          )
        case "providerCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.providerCode")} value={item.providerCode ?? "N/A"} />
            </div>
          )
        case "providerId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.providerId")} value={item.providerId ?? "N/A"} />
            </div>
          )
        case "productId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.productId")} value={item.productId ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "name":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.name")} value={item.name ?? "N/A"} />
            </div>
          )
        case "isActive":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.isActive")} value={item.isActive ?? "N/A"} />
            </div>
          )
        case "isDefault":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.isDefault")} value={item.isDefault ?? "N/A"} />
            </div>
          )
        case "configuration":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.configuration")} value={item.configuration ?? "N/A"} />
            </div>
          )
        case "priority":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.priority")} value={item.priority ?? "N/A"} />
            </div>
          )
        case "lastTestAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.lastTestAt")} value={item.lastTestAt ?? "N/A"} />
            </div>
          )
        case "lastTestStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("connector.fields.lastTestStatus")} value={item.lastTestStatus ?? "N/A"} />
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
        label: isDeleting ? t("connector.bulk.deleting") : t("connector.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchConnectorResponse>
        columnHeaders={columnHeaders}
        items={connectors}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("connector.messages.noData")}
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
