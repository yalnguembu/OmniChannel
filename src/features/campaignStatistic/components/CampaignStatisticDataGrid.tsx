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
import { SearchCampaignStatisticResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"

interface CampaignStatisticDataGridProps {
  campaignStatistics: SearchCampaignStatisticResponse[]
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

export const CampaignStatisticDataGrid: React.FC<CampaignStatisticDataGridProps> = ({
  campaignStatistics,
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

  const columnHeaders: DataGridColumnHeader<SearchCampaignStatisticResponse>[] = [
    {
      key: "campaignName",
      label: t("campaignStatistic.fields.campaignName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignType",
      label: t("campaignStatistic.fields.campaignType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignStatus",
      label: t("campaignStatistic.fields.campaignStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "campaignId",
      label: t("campaignStatistic.fields.campaignId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalRecipients",
      label: t("campaignStatistic.fields.totalRecipients"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalSent",
      label: t("campaignStatistic.fields.totalSent"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalDelivered",
      label: t("campaignStatistic.fields.totalDelivered"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalFailed",
      label: t("campaignStatistic.fields.totalFailed"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalBounced",
      label: t("campaignStatistic.fields.totalBounced"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalOpened",
      label: t("campaignStatistic.fields.totalOpened"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalClicked",
      label: t("campaignStatistic.fields.totalClicked"),
      sortable: true,
      resizable: true,
    },
    {
      key: "deliveryRate",
      label: t("campaignStatistic.fields.deliveryRate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "openRate",
      label: t("campaignStatistic.fields.openRate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "clickRate",
      label: t("campaignStatistic.fields.clickRate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "bounceRate",
      label: t("campaignStatistic.fields.bounceRate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "totalCost",
      label: t("campaignStatistic.fields.totalCost"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("campaignStatistic.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      navigate({ to: `/campaignStatistic/${id}` })
    }
  }

  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate({ to: `/campaignStatistic/${id}/edit` })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t("campaignStatistic.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("campaignStatistic.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchCampaignStatisticResponse, column: DataGridColumnHeader<SearchCampaignStatisticResponse>, view: ViewMode): ReactNode => {
    if (view === "list") {
      switch (column.key) {
        case "campaignName":
          return <span className="text-muted-foreground/70">{item.campaignName || "N/A"}</span>
        case "campaignType":
          return <span className="text-muted-foreground/70">{item.campaignType || "N/A"}</span>
        case "campaignStatus":
          return <span className="text-muted-foreground/70">{item.campaignStatus || "N/A"}</span>
        case "campaignId":
          return <span className="text-muted-foreground/70">{item.campaignId || "N/A"}</span>
        case "totalRecipients":
          return <span className="text-muted-foreground/70">{item.totalRecipients || "N/A"}</span>
        case "totalSent":
          return <span className="text-muted-foreground/70">{item.totalSent || "N/A"}</span>
        case "totalDelivered":
          return <span className="text-muted-foreground/70">{item.totalDelivered || "N/A"}</span>
        case "totalFailed":
          return <span className="text-muted-foreground/70">{item.totalFailed || "N/A"}</span>
        case "totalBounced":
          return <span className="text-muted-foreground/70">{item.totalBounced || "N/A"}</span>
        case "totalOpened":
          return <span className="text-muted-foreground/70">{item.totalOpened || "N/A"}</span>
        case "totalClicked":
          return <span className="text-muted-foreground/70">{item.totalClicked || "N/A"}</span>
        case "deliveryRate":
          return <span className="text-muted-foreground/70">{item.deliveryRate || "N/A"}</span>
        case "openRate":
          return <span className="text-muted-foreground/70">{item.openRate || "N/A"}</span>
        case "clickRate":
          return <span className="text-muted-foreground/70">{item.clickRate || "N/A"}</span>
        case "bounceRate":
          return <span className="text-muted-foreground/70">{item.bounceRate || "N/A"}</span>
        case "totalCost":
          return <span className="text-muted-foreground/70">{item.totalCost || "N/A"}</span>
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
        case "campaignName":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.campaignName")} value={item.campaignName ?? "N/A"} />
            </div>
          )
        case "campaignType":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.campaignType")} value={item.campaignType ?? "N/A"} />
            </div>
          )
        case "campaignStatus":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.campaignStatus")} value={item.campaignStatus ?? "N/A"} />
            </div>
          )
        case "campaignId":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.campaignId")} value={item.campaignId ?? "N/A"} />
            </div>
          )
        case "totalRecipients":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.totalRecipients")} value={item.totalRecipients ?? "N/A"} />
            </div>
          )
        case "totalSent":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.totalSent")} value={item.totalSent ?? "N/A"} />
            </div>
          )
        case "totalDelivered":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.totalDelivered")} value={item.totalDelivered ?? "N/A"} />
            </div>
          )
        case "totalFailed":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.totalFailed")} value={item.totalFailed ?? "N/A"} />
            </div>
          )
        case "totalBounced":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.totalBounced")} value={item.totalBounced ?? "N/A"} />
            </div>
          )
        case "totalOpened":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.totalOpened")} value={item.totalOpened ?? "N/A"} />
            </div>
          )
        case "totalClicked":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.totalClicked")} value={item.totalClicked ?? "N/A"} />
            </div>
          )
        case "deliveryRate":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.deliveryRate")} value={item.deliveryRate ?? "N/A"} />
            </div>
          )
        case "openRate":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.openRate")} value={item.openRate ?? "N/A"} />
            </div>
          )
        case "clickRate":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.clickRate")} value={item.clickRate ?? "N/A"} />
            </div>
          )
        case "bounceRate":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.bounceRate")} value={item.bounceRate ?? "N/A"} />
            </div>
          )
        case "totalCost":
          return (
            <div className="px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("campaignStatistic.fields.totalCost")} value={item.totalCost ?? "N/A"} />
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
        label: isDeleting ? t("campaignStatistic.bulk.deleting") : t("campaignStatistic.bulk.delete", { count: selectedRows?.length }),
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
      <DataGrid<SearchCampaignStatisticResponse>
        columnHeaders={columnHeaders}
        items={campaignStatistics}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("campaignStatistic.messages.noData")}
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
