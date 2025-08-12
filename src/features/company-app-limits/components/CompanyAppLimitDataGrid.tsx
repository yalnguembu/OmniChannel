import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useCompanyAppLimit } from "../hooks/useCompanyAppLimit"
import { CompanyAppLimitDataGridEntry } from "../lib/data-grid/CompanyAppLimitDataGridEntry"

export const CompanyAppLimitDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    companyAppLimits,
    searchCompanyAppLimits,
    currentPage,
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
    deleteCompanyAppLimit,
    bulkDeleteMutation,
  } = useCompanyAppLimit()

  useEffect(() => {
    searchCompanyAppLimits()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("companyapplimits.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: t("companyapplimits.headers.applicationName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationStatus",
      label: t("companyapplimits.headers.applicationStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("companyapplimits.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyPhoneNumber",
      label: t("companyapplimits.headers.companyPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("companyapplimits.headers.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("companyapplimits.headers.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("companyapplimits.headers.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationId",
      label: t("companyapplimits.headers.applicationId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "apiRequestsLimit",
      label: t("companyapplimits.headers.apiRequestsLimit"),
      sortable: true,
      resizable: true,
    },
    {
      key: "defaultDailyLimit",
      label: t("companyapplimits.headers.defaultDailyLimit"),
      sortable: true,
      resizable: true,
    },
    {
      key: "defaultMonthlyLimit",
      label: t("companyapplimits.headers.defaultMonthlyLimit"),
      sortable: true,
      resizable: true,
    },
    {
      key: "defaultSingleTransactionLimit",
      label: t("companyapplimits.headers.defaultSingleTransactionLimit"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("companyAppLimits.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return companyAppLimits.map((item) => new CompanyAppLimitDataGridEntry(item))
  }, [companyAppLimits])

  const handleView = (id: string) => {
    navigate({ to: `/companyAppLimit/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/companyAppLimit/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("companyAppLimits.messages.delete.confirm"))) {
      deleteCompanyAppLimit(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("companyAppLimits.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
                {t("companyAppLimits.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("companyAppLimits.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("companyAppLimits.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
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
          label: bulkDeleteMutation.isPending ? t("companyAppLimits.bulk.deleting") : t("companyAppLimits.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("companyAppLimits.messages.noData")}
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
