import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useCompany } from "../hooks/useCompany"
import { CompanyDataGridEntry } from "../lib/data-grid/CompanyDataGridEntry"
import { formatDate } from "@/shared/lib"
import { DateFormat } from "@/shared/enums/common"

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
      label: t("companies.fields.email"),
      sortable: true,
      resizable: true,
    },

    {
      key: "phoneNumber",
      label: t("companies.fields.phoneNumber"),
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

  const renderCell = (item: DataGridRowEntry, columnKey: string) => {
    switch (columnKey) {
      case "actions":
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(item.getId())}>
                <Eye className="mr-2 h-4 w-4" />
                {t("companies.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("companies.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("companies.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      case "createdAt":
        return formatDate(item.getTextFor(columnKey) as string, DateFormat.SHORT)
      default:
        return item.getTextFor(columnKey) || "N/A"
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
