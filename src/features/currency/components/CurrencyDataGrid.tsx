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
import { SearchCurrencyResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface CurrencyDataGridProps {
  currencys: SearchCurrencyResponse[]
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

export const CurrencyDataGrid: React.FC<CurrencyDataGridProps> = ({
  currencys,
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

  const columnHeaders: DataGridColumnHeader<SearchCurrencyResponse>[] = [
    {
      key: "code",
      label: t("currency.fields.code"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("currency.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "symbol",
      label: t("currency.fields.symbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "decimalPlaces",
      label: t("currency.fields.decimalPlaces"),
      sortable: true,
      resizable: true,
    },
    {
      key: "exchangeRate",
      label: t("currency.fields.exchangeRate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isBaseCurrency",
      label: t("currency.fields.isBaseCurrency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("currency.fields.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "lastUpdated",
      label: t("currency.fields.lastUpdated"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("currency.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/currency/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/currency/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("currency.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("currency.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchCurrencyResponse, column: DataGridColumnHeader<SearchCurrencyResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "code":
          return <span className="text-muted-foreground/70">{item.code || "N/A"}</span>
        case "name":
          return <span className="text-muted-foreground/70">{item.name || "N/A"}</span>
        case "symbol":
          return <span className="text-muted-foreground/70">{item.symbol || "N/A"}</span>
        case "decimalPlaces":
          return <span className="text-muted-foreground/70">{item.decimalPlaces || "N/A"}</span>
        case "exchangeRate":
          return <span className="text-muted-foreground/70">{item.exchangeRate || "N/A"}</span>
        case "isBaseCurrency":
          return <span className="text-muted-foreground/70">{item.isBaseCurrency || "N/A"}</span>
        case "isActive":
          return <span className="text-muted-foreground/70">{item.isActive || "N/A"}</span>
        case "lastUpdated":
          return <span className="text-muted-foreground/70">{item.lastUpdated || "N/A"}</span>
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
        case "code":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("currency.fields.code")} value={item.code ?? "N/A"} />
            </div>
          )
        case "name":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("currency.fields.name")} value={item.name ?? "N/A"} />
            </div>
          )
        case "symbol":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("currency.fields.symbol")} value={item.symbol ?? "N/A"} />
            </div>
          )
        case "decimalPlaces":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("currency.fields.decimalPlaces")} value={item.decimalPlaces ?? "N/A"} />
            </div>
          )
        case "exchangeRate":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("currency.fields.exchangeRate")} value={item.exchangeRate ?? "N/A"} />
            </div>
          )
        case "isBaseCurrency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("currency.fields.isBaseCurrency")} value={item.isBaseCurrency ?? "N/A"} />
            </div>
          )
        case "isActive":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("currency.fields.isActive")} value={item.isActive ?? "N/A"} />
            </div>
          )
        case "lastUpdated":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("currency.fields.lastUpdated")} value={item.lastUpdated ?? "N/A"} />
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
        label: isDeleting ? t("currency.bulk.deleting") : t("currency.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchCurrencyResponse>
        columnHeaders={columnHeaders}
        items={currencys}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("currency.messages.noData")}
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
