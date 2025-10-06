import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useCountry } from "../hooks/useCountry"
import { CountryDataGridEntry } from "../lib/data-grid/CountryDataGridEntry"

export const CountryDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { countrys, currentPage, pageSize, totalItems, sortBy, sortDirection, selectedRows, isLoading, changePage, changeSort, setSelectedRows, deleteCountry } = useCountry()

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
      width: 100,
    },
  ]

  const gridItems = useMemo(() => {
    return countrys.map((item) => new CountryDataGridEntry(item))
  }, [countrys])

  const handleEdit = (id: string) => {
    navigate({ to: `/administration/countries/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("countries.messages.delete.confirm"))) {
      deleteCountry(id)
    }
  }

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
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

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
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
        actions={["edit", "delete"]}
        dispatch={handleDispatch}
      />
    </div>
  )
}
