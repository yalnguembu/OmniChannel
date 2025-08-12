import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useCountry } from "../hooks/useCountry"
import { CountryDataGridEntry } from "../lib/data-grid/CountryDataGridEntry"

export const CountryDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { countrys, currentPage, searchCountries, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changeSort, setSelectedRows, deleteCountry } =
    useCountry()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "code",
      label: t("countries.headers.code"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("countries.headers.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("countries.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("countries.headers.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("countries.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  useEffect(() => {
    searchCountries()
  }, [])

  const gridItems = useMemo(() => {
    return countrys.map((item) => new CountryDataGridEntry(item))
  }, [countrys])

  const handleView = (id: string) => {
    navigate({ to: `/countries/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/countries/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("countries.messages.delete.confirm"))) {
      deleteCountry(id)
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
                {t("countries.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("countries.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("countries.actions.delete")}
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
        emptyMessage={t("countries.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        renderCell={renderCell}
      />
    </div>
  )
}
