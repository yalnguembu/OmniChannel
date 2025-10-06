import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort, ACTION } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useApplication } from "../hooks/useApplication"
import { ApplicationDataGridEntry } from "../lib/data-grid/ApplicationDataGridEntry"

export const ApplicationDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    applications,
    searchApplications,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
    deleteApplication,
  } = useApplication()

  useEffect(() => {
    searchApplications()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "companyName",
      label: t("applications.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("applications.headers.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("applications.headers.description"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("applications.headers.status"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    {
      key: "environment",
      label: t("applications.headers.environment"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("applications.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("applications.actions.more"),
      sortable: false,
      width: 110,
    },
  ]

  const gridItems = useMemo(() => {
    return applications.map((item) => new ApplicationDataGridEntry(item))
  }, [applications])

  const handleView = (id: string) => {
    navigate({ to: `/applications/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/applications/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("applications.messages.delete.confirm"))) {
      deleteApplication(id)
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
        emptyMessage={t("applications.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        actions={["view", "edit", "delete", "activate", "deactivate"]}
        dispatch={handleDispatch}
      />
    </div>
  )
}
