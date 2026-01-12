import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort, ViewMode } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"
import StatusBadge from "@/shared/components/StatusBadge"
import { BadgeStyles } from "@/shared/types/enums"
import ActionButtonGroup from "@/shared/components/data-grid/ActionButtonGroup"
import DetailsCardItem from "@/shared/components/DetailsCardItem"
import { SearchCompanyResponse } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"

interface CompanyDataGridProps {
  companies: SearchCompanyResponse[];
  paginationMetadata?: {
    totalCount: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    startIndex?: number;
    endIndex?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
  };
  isLoading: boolean;
  viewMode: "grid" | "list";
  selectedRows: string[];
  onSelectionChange: (rows: string[]) => void;
  onPageChange: (page: number, size: number) => void;
  onSortChange: (column: string, direction: SortDirection | null) => void;
  onDelete: (id: string) => void;
  onBulkDelete: () => void;
  isDeleting?: boolean;
  sortBy?: string | null;
  sortDirection?: SortDirection | null;
}

export const CompanyDataGrid: React.FC<CompanyDataGridProps> = ({
  companies,
  paginationMetadata,
  isLoading,
  viewMode,
  selectedRows,
  onSelectionChange,
  onPageChange,
  onSortChange,
  onDelete,
  onBulkDelete,
  isDeleting,
  sortBy,
  sortDirection
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const columnHeaders: DataGridColumnHeader<SearchCompanyResponse>[] = [
    {
      key: "basicInfo",
      label: t("companies.groups.basicInfo"),
      sortable: true,
      resizable: true,
    },
    {
      key: "contactInfo",
      label: t("companies.groups.contactInfo"),
      sortable: true,
      resizable: true,
    },
    {
      key: "legalFinancial",
      label: t("companies.groups.legalFinancial"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("companies.fields.createdAt"),
      sortable: true,
      resizable: true,
      hidden: viewMode === "grid",
      render: (val) => formatDate(val as string)
    },
    {
      key: "actions",
      label: t("companies.actions.more"),
      sortable: false,
      width: 100,
    },
  ]


  const handleView = (id: string) => {
    navigate({ to: `/companies/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/companies/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("companies.messages.delete.confirm"))) {
      onDelete(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("companies.bulk.deleteConfirm", { count: selectedRows?.length }))) {
      onBulkDelete()
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: SearchCompanyResponse, column: DataGridColumnHeader<SearchCompanyResponse>, view: ViewMode): ReactNode => {
    if (view == "list") {
      switch (column.key) {
        case "basicInfo":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.name")} :</span>
                <span className="text-primary">{item.name}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("companies.fields.companyType")} :</span>
                <span className="">{item.companyType}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("companies.fields.companySize")} :</span>
                <span className="">{item.companySize}</span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <StatusBadge theme={BadgeStyles.GREEN} text={item.status ?? ""} />
                {item.isVerified && <StatusBadge Icon={Verified} theme={BadgeStyles.BLUE} text={t("companies.fields.isVerified")} />}
              </div>
            </div>
          )
        case "contactInfo":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <span className="font-semibold">
                <User className="inline size-4 mr-1" /> {item.contactPerson}
              </span>

              <span className="font-light">
                <MapPin className="inline size-4 mr-1" />
                {item.address}
              </span>
              <span>
                <Mail className="inline size-4 mr-1" /> {item.email}
              </span>
              <span>
                <PhoneCall className="inline size-4 mr-1" />
                {item.phoneNumber}
              </span>
            </div>
          )
        case "legalFinancial":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.countryName")} :</span>
                <span>{item.countryName}</span>
              </div>
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.businessRegistrationNumber")} :</span>
                <span>{item.businessRegistrationNumber}</span>
              </div>
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.taxNumber")} :</span>
                <span>{item.taxNumber}</span>
              </div>
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.website")} :</span>
                <span>{item.website}</span>
              </div>
            </div>
          )
        case "createdAt":
          return <span className="text-muted-foreground/70">{item.createdAt ? formatDate(item.createdAt) : "N/A"}</span>

        case "actions":
          return <ActionButtonGroup view={view} isLoading={isLoading} row={item as any} actions={actions as ACTION[]} dispatch={handleDispatch} />

        default:
          const val = (item as any)[column.key]
          return column?.isBadge ? (
            <StatusBadge text={val as string} />
          ) : (
            <span className="text-muted-foreground/70"> {val || "N/A"}</span>
          )
      }
    } else {
      switch (column.key) {
        case "basicInfo":
          return (
            <div className="flex flex-col gap-y-1 px-4">
              <div className="flex items-center gap-x-2">
                <span className="font-semibold text-lg text-primary">{item.name}</span>
                <StatusBadge theme={BadgeStyles.GREEN} text={item.status ?? ""} />
                {item.isVerified && <StatusBadge Icon={Verified} theme={BadgeStyles.BLUE} text={t("companies.fields.isVerified")} />}
              </div>
              <div className="flex flex-col gap-y-1 text-sm text-muted-foreground">
                <DetailsCardItem Icon={User} label={t("companies.fields.companyType")} value={item.companyType ?? "N/A"} />
                <DetailsCardItem Icon={Mail} label={t("companies.fields.companySize")} value={item.companySize ?? "N/A"} />
              </div>
            </div>
          )
        case "contactInfo":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <DetailsCardItem Icon={User} label={t("companies.fields.contactPerson")} value={item.contactPerson ?? "N/A"} />
              <DetailsCardItem Icon={Mail} label={t("companies.fields.email")} value={item.email ?? "N/A"} />
              <DetailsCardItem Icon={PhoneCall} label={t("companies.fields.phoneNumber")} value={item.phoneNumber ?? "N/A"} />
              <DetailsCardItem Icon={MapPin} label={t("companies.fields.address")} value={item.address ?? "N/A"} />
            </div>
          )
        case "legalFinancial":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companies.fields.countryName")} value={item.countryName ?? "N/A"} />
              <DetailsCardItem label={t("companies.fields.businessRegistrationNumber")} value={item.businessRegistrationNumber ?? "N/A"} />
              <DetailsCardItem label={t("companies.fields.taxNumber")} value={item.taxNumber ?? "N/A"} />
              <DetailsCardItem label={t("companies.fields.website")} value={item.website ?? "N/A"} />
            </div>
          )
        case "createdAt":
          return (
            <div className="px-4 pt-1 text-xs text-muted-foreground/70">
              <span>{t("companies.fields.createdAt")}: </span>
              <span>{item.createdAt ? formatDate(item.createdAt) : "N/A"}</span>
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
        label: isDeleting ? t("companies.bulk.deleting") : t("companies.bulk.delete", { count: selectedRows?.length }),
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
        items={companies}
        total={paginationMetadata?.totalCount ?? 0}
        page={paginationMetadata?.pageNumber ?? 1}
        limit={paginationMetadata?.pageSize ?? 10}
        hasPagination={true}
        paginationMetadata={paginationMetadata}
        onPageChange={onPageChange}
        isLoading={isLoading}
        emptyMessage={t("companies.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={onSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => { }}
        bulkActions={bulkActions}
        renderCell={renderCell}
        dispatch={handleDispatch}
        actions={actions as ACTION[]}
        viewMode={viewMode}
      />
    </div>
  )
}
