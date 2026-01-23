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
import { SearchCompanyVerificationResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface CompanyVerificationDataGridProps {
  companyVerifications: SearchCompanyVerificationResponse[]
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

export const CompanyVerificationDataGrid: React.FC<CompanyVerificationDataGridProps> = ({
  companyVerifications,
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

  const columnHeaders: DataGridColumnHeader<SearchCompanyVerificationResponse>[] = [
    {
      key: "companyName",
      label: t("companyVerification.fields.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("companyVerification.fields.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("companyVerification.fields.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("companyVerification.fields.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "verificationType",
      label: t("companyVerification.fields.verificationType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "documentUrl",
      label: t("companyVerification.fields.documentUrl"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("companyVerification.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "verifiedAt",
      label: t("companyVerification.fields.verifiedAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "rejectionAt",
      label: t("companyVerification.fields.rejectionAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "verifiedBy",
      label: t("companyVerification.fields.verifiedBy"),
      sortable: true,
      resizable: true,
    },
    {
      key: "rejectionReason",
      label: t("companyVerification.fields.rejectionReason"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("companyVerification.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/companyVerification/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/companyVerification/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("companyVerification.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("companyVerification.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchCompanyVerificationResponse, column: DataGridColumnHeader<SearchCompanyVerificationResponse>, view: ViewMode): ReactNode => {
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
        case "verificationType":
          return <span className="text-muted-foreground/70">{item.verificationType || "N/A"}</span>
        case "documentUrl":
          return <span className="text-muted-foreground/70">{item.documentUrl || "N/A"}</span>
        case "status":
          return <span className="text-muted-foreground/70">{item.status || "N/A"}</span>
        case "verifiedAt":
          return <span className="text-muted-foreground/70">{item.verifiedAt || "N/A"}</span>
        case "rejectionAt":
          return <span className="text-muted-foreground/70">{item.rejectionAt || "N/A"}</span>
        case "verifiedBy":
          return <span className="text-muted-foreground/70">{item.verifiedBy || "N/A"}</span>
        case "rejectionReason":
          return <span className="text-muted-foreground/70">{item.rejectionReason || "N/A"}</span>
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
              <DetailsCardItem label={t("companyVerification.fields.companyName")} value={item.companyName ?? "N/A"} />
            </div>
          )
        case "companyStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.companyStatus")} value={item.companyStatus ?? "N/A"} />
            </div>
          )
        case "companyEmail":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.companyEmail")} value={item.companyEmail ?? "N/A"} />
            </div>
          )
        case "companyId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.companyId")} value={item.companyId ?? "N/A"} />
            </div>
          )
        case "verificationType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.verificationType")} value={item.verificationType ?? "N/A"} />
            </div>
          )
        case "documentUrl":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.documentUrl")} value={item.documentUrl ?? "N/A"} />
            </div>
          )
        case "status":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.status")} value={item.status ?? "N/A"} />
            </div>
          )
        case "verifiedAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.verifiedAt")} value={item.verifiedAt ?? "N/A"} />
            </div>
          )
        case "rejectionAt":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.rejectionAt")} value={item.rejectionAt ?? "N/A"} />
            </div>
          )
        case "verifiedBy":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.verifiedBy")} value={item.verifiedBy ?? "N/A"} />
            </div>
          )
        case "rejectionReason":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companyVerification.fields.rejectionReason")} value={item.rejectionReason ?? "N/A"} />
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
        label: isDeleting ? t("companyVerification.bulk.deleting") : t("companyVerification.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchCompanyVerificationResponse>
        columnHeaders={columnHeaders}
        items={companyVerifications}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("companyVerification.messages.noData")}
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
