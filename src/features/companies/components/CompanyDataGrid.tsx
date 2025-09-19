import React, { ReactNode, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridRowEntry, DataGridSort, ViewMode } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { useCompany } from "../hooks/useCompany"
import { CompanyDataGridEntry } from "../lib/data-grid/CompanyDataGridEntry"
import { MoreHorizontal, Eye, Edit, Trash2, Mail, PhoneCall } from "lucide-react"
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
      key: "name",
      label: t("companies.fields.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "email",
      label: t("companies.fields.contact"),
      sortable: true,
      resizable: true,
    },
    {
      key: "countryCode",
      label: t("companies.fields.countryCode"),
      sortable: true,
      resizable: true,
    },
    {
      key: "address",
      label: t("companies.fields.address"),
      sortable: true,
      resizable: true,
    },
    {
      key: "businessRegistrationNumber",
      label: t("companies.fields.businessRegistrationNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "taxNumber",
      label: t("companies.fields.taxNumber"),
      sortable: true,
      resizable: true,
    },

    {
      key: "companySize",
      label: t("companies.fields.companySize"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyType",
      label: t("companies.fields.companyType"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isVerified",
      label: t("companies.fields.isVerified"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("companies.fields.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "contactPerson",
      label: t("companies.fields.contactPerson"),
      sortable: true,
      resizable: true,
    },
    // {
    //   key: "countryName",
    //   label: t("companies.headers.countryName"),
    //   sortable: true,
    //   resizable: true,
    // },
    // {
    //   key: "contactPhone",
    //   label: t("companies.headers.contactPhone"),
    //   sortable: true,
    //   resizable: true,
    // }, // {
    //   key: "countryId",
    //   label: t("companies.headers.countryId"),
    //   sortable: true,
    //   resizable: true,
    // },
    // {
    //   key: "website",
    //   label: t("companies.headers.website"),
    //   sortable: true,
    //   resizable: true,
    // },
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
      width: 70,
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

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "view":
        handleView(id)
        break
      case "edit":
        handleEdit(id)
        break
      case "delete":
        handleDelete(id)
        break
      default:
        return
    }
  }

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: DataGridRowEntry, column: DataGridColumnHeader, view: ViewMode): ReactNode => {
    if (view == "list") {
      switch (column.key) {
        case "actions":
          return actions.length < 3 ? (
            <div>
              <></>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDispatch?.("view", item.getId())}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t("countries.actions.view")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDispatch?.("edit", item.getId())}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t("countries.actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDispatch?.("delete", item.getId())} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("countries.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        case "name":
          return <span className="font-semibold text-sm lg:text-base">{item.getTextFor("name")}</span>
        case "company":
          return (
            <div className="flex flex-col gap-y-1">
              <span className="text-blue-500 font-bold">{item.getTextFor("campanyName")}</span>
              <span className="text-gray-500 font-bold">{item.getTextFor("campanyEmail")}</span>
            </div>
          )
        case "contact":
          return (
            <div className="flex flex-col gap-y-1">
              <span>
                <Mail className="inline size-4 mr-1" /> {item.getTextFor("email")}
              </span>
              <span>
                <PhoneCall className="inline size-4 mr-1" />
                {item.getTextFor("phoneNumber")}
              </span>
            </div>
          )
        case "profileName":
          return <StatusBadge theme={BadgeStyles.BLUE} text={item.getTextFor(column.key) as string} />
        case "userType":
          return <StatusBadge theme={BadgeStyles.YELLOW} text={item.getTextFor(column.key) as string} />
        default:
          return column?.isBadge ? (
            <StatusBadge text={item.getTextFor(column.key) as string} />
          ) : (
            <span className="text-muted-foreground/70"> {item.getTextFor(column.key) || "N/A"}</span>
          )
      }
    } else {
      const rowItem = {
        label: column.label,
        value: item.getTextFor(column.key),
        key: column.key,
        isBadge: column.isBadge,
        theme: column.badgeTheme,
        shouldClick: column.shouldClick,
      }
      if (rowItem.key === "actions")
        return (
          <div className="flex flex-row justify-between px-4 pt-2 border-t-[1.5px]">
            <span className="px-2 h-min text-sm font-semibold block min-w-14">{rowItem.label}</span>
            <ActionButtonGroup view={view} isLoading={isLoading} row={item} actions={actions as ACTION[]} dispatch={handleDispatch} />
          </div>
        )
      else if (rowItem.key === "id") return <></>
      else if (rowItem.key === "contact")
        return (
          <DetailsCardItem
            onClick={() => rowItem.shouldClick && handleDispatch("ROW_CLICK", item.getId())}
            shouldClick={rowItem.shouldClick}
            key={rowItem.key}
            label={rowItem.label ?? ""}
            value={
              <div className="flex flex-col gap-y-1">
                <span>
                  <Mail className="inline size-4 mr-1" /> {item.getTextFor("email")}
                </span>
                <span>
                  <PhoneCall className="inline size-4 mr-1" />
                  {item.getTextFor("phoneNumber")}
                </span>
              </div>
            }
            isBadge={rowItem.isBadge}
            theme={rowItem.theme}
            className={`mx-3 border-b border-b-base-300`}
          />
        )
      else if (rowItem.key === "name")
        return (
          <DetailsCardItem
            onClick={() => rowItem.shouldClick && handleDispatch("ROW_CLICK", item.getId())}
            shouldClick={rowItem.shouldClick}
            key={rowItem.key}
            label={rowItem.label ?? ""}
            value={<span className="font-semibold text-sm lg:text-base">{item.getTextFor("name")}</span>}
            isBadge={rowItem.isBadge}
            theme={rowItem.theme}
            className={`mx-3 border-b border-b-base-300`}
          />
        )
      else
        return (
          <DetailsCardItem
            onClick={() => rowItem.shouldClick && handleDispatch("ROW_CLICK", item.getId())}
            shouldClick={rowItem.shouldClick}
            key={rowItem.key}
            label={rowItem.label ?? ""}
            value={`${rowItem.value || "N/A"}`}
            isBadge={rowItem.isBadge}
            theme={rowItem.theme}
            className={`mx-3 border-b border-b-base-300`}
          />
        )
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
      />
    </div>
  )
}
