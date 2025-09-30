import React, { ReactNode, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridRowEntry, DataGridSort, ViewMode } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useCompany } from "../hooks/useCompany"
import { CompanyDataGridEntry } from "../lib/data-grid/CompanyDataGridEntry"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"
import StatusBadge from "@/shared/components/StatusBadge"
import { BadgeStyles } from "@/shared/types/enums"
import ActionButtonGroup from "@/shared/components/data-grid/ActionButtonGroup"
import DetailsCardItem from "@/shared/components/DetailsCardItem"

export const CompanyDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    companies,
    currentPage,
    searchCompanys,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    hasSelection,
    changePage,
    changeSort,
    setSelectedRows,
    deleteCompany,
    bulkDeleteMutation,
  } = useCompany()

  useEffect(() => {
    searchCompanys()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
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
    },
    {
      key: "actions",
      label: t("companies.actions.more"),
      sortable: false,
      width: 100,
    },
  ]

  const gridItems = useMemo(() => {
    return companies.map((item) => new CompanyDataGridEntry(item))
  }, [companies])

  const handleView = (id: string) => {
    navigate({ to: `/companies/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/companies/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("companies.messages.delete.confirm"))) {
      deleteCompany(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("companies.bulk.deleteConfirm", { count: selectedRows.length }))) {
      bulkDeleteMutation.mutate(selectedRows)
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: DataGridRowEntry, column: DataGridColumnHeader, view: ViewMode): ReactNode => {
    if (view == "list") {
      switch (column.key) {
        case "basicInfo":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.name")} :</span>
                <span className="text-primary">{item.getTextFor("name")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("companies.fields.companyType")} :</span>
                <span className="">{item.getTextFor("companyType")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("companies.fields.companySize")} :</span>
                <span className="">{item.getTextFor("companySize")}</span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <StatusBadge theme={BadgeStyles.GREEN} text={item.getTextFor("status")} />
                {item.getTextFor("isVerified") === "true" && <StatusBadge Icon={Verified} theme={BadgeStyles.BLUE} text={t("companies.fields.isVerified")} />}
              </div>
            </div>
          )
        case "contactInfo":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <span className="font-semibold">
                <User className="inline size-4 mr-1" /> {item.getTextFor("contactPerson")}
              </span>

              <span className="font-light">
                <MapPin className="inline size-4 mr-1" />
                {item.getTextFor("address")}
              </span>
              <span>
                <Mail className="inline size-4 mr-1" /> {item.getTextFor("email")}
              </span>
              <span>
                <PhoneCall className="inline size-4 mr-1" />
                {item.getTextFor("phoneNumber")}
              </span>
            </div>
          )
        case "legalFinancial":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.countryName")} :</span>
                <span>{item.getTextFor("countryName")}</span>
              </div>
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.businessRegistrationNumber")} :</span>
                <span>{item.getTextFor("businessRegistrationNumber")}</span>
              </div>
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.taxNumber")} :</span>
                <span>{item.getTextFor("taxNumber")}</span>
              </div>
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("companies.fields.website")} :</span>
                <span>{item.getTextFor("website")}</span>
              </div>
            </div>
          )
        case "createdAt":
          return <span className="text-muted-foreground/70">{item.getTextFor("createdAt")}</span>

        case "actions":
          return <ActionButtonGroup view={view} isLoading={isLoading} row={item} actions={actions as ACTION[]} dispatch={handleDispatch} />

        default:
          return column?.isBadge ? (
            <StatusBadge text={item.getTextFor(column.key) as string} />
          ) : (
            <span className="text-muted-foreground/70"> {item.getTextFor(column.key) || "N/A"}</span>
          )
      }
    } else {
      switch (column.key) {
        case "basicInfo":
          return (
            <div className="flex flex-col gap-y-1 px-4">
              <div className="flex items-center gap-x-2">
                <span className="font-semibold text-lg text-primary">{item.getTextFor("name")}</span>
                <StatusBadge theme={BadgeStyles.GREEN} text={item.getTextFor("status")} />
                {item.getTextFor("isVerified") === "true" && <StatusBadge Icon={Verified} theme={BadgeStyles.BLUE} text={t("companies.fields.isVerified")} />}
              </div>
              <div className="flex flex-col gap-y-1 text-sm text-muted-foreground">
                <DetailsCardItem Icon={User} label={t("companies.fields.companyType")} value={item.getTextFor("companyType")} />
                <DetailsCardItem Icon={Mail} label={t("companies.fields.companySize")} value={item.getTextFor("companySize")} />
              </div>
            </div>
          )
        case "contactInfo":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <DetailsCardItem Icon={User} label={t("companies.fields.contactPerson")} value={item.getTextFor("contactPerson")} />
              <DetailsCardItem Icon={Mail} label={t("companies.fields.email")} value={item.getTextFor("email")} />
              <DetailsCardItem Icon={PhoneCall} label={t("companies.fields.phoneNumber")} value={item.getTextFor("phoneNumber")} />
              <DetailsCardItem Icon={MapPin} label={t("companies.fields.address")} value={item.getTextFor("address")} />
            </div>
          )
        case "legalFinancial":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("companies.fields.countryName")} value={item.getTextFor("countryName")} />
              <DetailsCardItem label={t("companies.fields.businessRegistrationNumber")} value={item.getTextFor("businessRegistrationNumber")} />
              <DetailsCardItem label={t("companies.fields.taxNumber")} value={item.getTextFor("taxNumber")} />
              <DetailsCardItem label={t("companies.fields.website")} value={item.getTextFor("website")} />
            </div>
          )
        case "createdAt":
          return (
            <div className="px-4 pt-1 text-xs text-muted-foreground/70">
              <span>{t("companies.fields.createdAt")}: </span>
              <span>{item.getTextFor("createdAt")}</span>
            </div>
          )
        case "actions":
          return (
            <div className="flex flex-row justify-between px-4 pt-2 mt-auto border-t">
              <DetailsCardItem label="#" value={1234} />
              <ActionButtonGroup view={view} isLoading={isLoading} row={item} actions={actions as ACTION[]} dispatch={handleDispatch} />
            </div>
          )
        default:
          // This will prevent rendering any other individual fields that are now part of a group.
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
    const direction = config.direction
    changeSort(config.column, direction)
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedRows(selectedIds)
  }

  const handlePageChange = (page: number) => {
    changePage(page)
  }

  const bulkActions = hasSelection
    ? [
        {
          label: bulkDeleteMutation.isPending ? t("companies.bulk.deleting") : t("companies.bulk.delete", { count: selectedRows.length }),
          action: handleBulkDelete,
          variant: "destructive" as const,
          loading: bulkDeleteMutation.isPending,
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
    <div className="w-full max-w-full overflow-hidden">
      <DataGrid
        columnHeaders={columnHeaders}
        items={gridItems}
        total={totalItems}
        page={currentPage}
        limit={pageSize}
        hasPagination={true}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage={t("companies.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        bulkActions={bulkActions}
        renderCell={renderCell}
        actions={["edit", "delete", "view"]}
        dispatch={handleDispatch}
      />
    </div>
  )
}
