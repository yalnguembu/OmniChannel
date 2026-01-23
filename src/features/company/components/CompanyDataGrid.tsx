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
import { SearchCompanyResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface CompanyDataGridProps {
  companys: SearchCompanyResponse[]
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

export const CompanyDataGrid: React.FC<CompanyDataGridProps> = ({
  companys,
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

  const columnHeaders: DataGridColumnHeader<SearchCompanyResponse>[] = [
    {
      key: "countryName",
      label: t("company.fields.countryName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "countryCode",
      label: t("company.fields.countryCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "walletCurrency",
      label: t("company.fields.walletCurrency"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("company.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "legalName",
      label: t("company.fields.legalName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "taxNumber",
      label: t("company.fields.taxNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "countryId",
      label: t("company.fields.countryId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("company.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "email",
      label: t("company.fields.email"),
      sortable: true,
      resizable: true,
    },
    {
      key: "phone",
      label: t("company.fields.phone"),
      sortable: true,
      resizable: true,
    },
    {
      key: "website",
      label: t("company.fields.website"),
      sortable: true,
      resizable: true,
    },
    {
      key: "address",
      label: t("company.fields.address"),
      sortable: true,
      resizable: true,
    },
    {
      key: "city",
      label: t("company.fields.city"),
      sortable: true,
      resizable: true,
    },
    {
      key: "postalCode",
      label: t("company.fields.postalCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "country",
      label: t("company.fields.country"),
      sortable: true,
      resizable: true,
    },
    {
      key: "billingMode",
      label: t("company.fields.billingMode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "timezone",
      label: t("company.fields.timezone"),
      sortable: true,
      resizable: true,
    },
    {
      key: "defaultLanguage",
      label: t("company.fields.defaultLanguage"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isSandbox",
      label: t("company.fields.isSandbox"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("company.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/company/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/company/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("company.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("company.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchCompanyResponse, column: DataGridColumnHeader<SearchCompanyResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "countryName":
          return <span className="text-muted-foreground/70">{item.countryName || "N/A"}</span>
        case "countryCode":
          return <span className="text-muted-foreground/70">{item.countryCode || "N/A"}</span>
        case "walletCurrency":
          return <span className="text-muted-foreground/70">{item.walletCurrency || "N/A"}</span>
        case "name":
          return <span className="text-muted-foreground/70">{item.name || "N/A"}</span>
        case "legalName":
          return <span className="text-muted-foreground/70">{item.legalName || "N/A"}</span>
        case "taxNumber":
          return <span className="text-muted-foreground/70">{item.taxNumber || "N/A"}</span>
        case "countryId":
          return <span className="text-muted-foreground/70">{item.countryId || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "email":
          return <span className="text-muted-foreground/70">{item.email || "N/A"}</span>
        case "phone":
          return <span className="text-muted-foreground/70">{item.phone || "N/A"}</span>
        case "website":
          return <span className="text-muted-foreground/70">{item.website || "N/A"}</span>
        case "address":
          return <span className="text-muted-foreground/70">{item.address || "N/A"}</span>
        case "city":
          return <span className="text-muted-foreground/70">{item.city || "N/A"}</span>
        case "postalCode":
          return <span className="text-muted-foreground/70">{item.postalCode || "N/A"}</span>
        case "country":
          return <span className="text-muted-foreground/70">{item.country || "N/A"}</span>
        case "billingMode":
          return <span className="text-muted-foreground/70">{item.billingMode || "N/A"}</span>
        case "timezone":
          return <span className="text-muted-foreground/70">{item.timezone || "N/A"}</span>
        case "defaultLanguage":
          return <span className="text-muted-foreground/70">{item.defaultLanguage || "N/A"}</span>
        case "isSandbox":
          return <span className="text-muted-foreground/70">{item.isSandbox || "N/A"}</span>
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
        case "countryName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.countryName")} value={item.countryName ?? "N/A"} />
            </div>
          )
        case "countryCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.countryCode")} value={item.countryCode ?? "N/A"} />
            </div>
          )
        case "walletCurrency":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.walletCurrency")} value={item.walletCurrency ?? "N/A"} />
            </div>
          )
        case "name":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.name")} value={item.name ?? "N/A"} />
            </div>
          )
        case "legalName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.legalName")} value={item.legalName ?? "N/A"} />
            </div>
          )
        case "taxNumber":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.taxNumber")} value={item.taxNumber ?? "N/A"} />
            </div>
          )
        case "countryId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.countryId")} value={item.countryId ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "email":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.email")} value={item.email ?? "N/A"} />
            </div>
          )
        case "phone":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.phone")} value={item.phone ?? "N/A"} />
            </div>
          )
        case "website":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.website")} value={item.website ?? "N/A"} />
            </div>
          )
        case "address":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.address")} value={item.address ?? "N/A"} />
            </div>
          )
        case "city":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.city")} value={item.city ?? "N/A"} />
            </div>
          )
        case "postalCode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.postalCode")} value={item.postalCode ?? "N/A"} />
            </div>
          )
        case "country":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.country")} value={item.country ?? "N/A"} />
            </div>
          )
        case "billingMode":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.billingMode")} value={item.billingMode ?? "N/A"} />
            </div>
          )
        case "timezone":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.timezone")} value={item.timezone ?? "N/A"} />
            </div>
          )
        case "defaultLanguage":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.defaultLanguage")} value={item.defaultLanguage ?? "N/A"} />
            </div>
          )
        case "isSandbox":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("company.fields.isSandbox")} value={item.isSandbox ?? "N/A"} />
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
        label: isDeleting ? t("company.bulk.deleting") : t("company.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchCompanyResponse>
        columnHeaders={columnHeaders}
        items={companys}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("company.messages.noData")}
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
