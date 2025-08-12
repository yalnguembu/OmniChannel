import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useSmsmailTemplate } from "../hooks/useSmsMailTemplate"
import { SmsmailTemplateDataGridEntry } from "../lib/data-grid/SmsMailTemplateDataGridEntry"

export const SmsmailTemplateDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    smsmailTemplates,
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
    deleteSmsmailTemplate,
    bulkDeleteMutation,
  } = useSmsmailTemplate()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("smsmailtemplates.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "locale",
      label: t("smsmailtemplates.headers.locale"),
      sortable: true,
      resizable: true,
    },
    {
      key: "type",
      label: t("smsmailtemplates.headers.type"),
      sortable: true,
      resizable: true,
    },
    {
      key: "subject",
      label: t("smsmailtemplates.headers.subject"),
      sortable: true,
      resizable: true,
    },
    {
      key: "body",
      label: t("smsmailtemplates.headers.body"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("smsmailtemplates.headers.isActive"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("smsmailTemplates.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return smsmailTemplates.map((item) => new SmsmailTemplateDataGridEntry(item))
  }, [smsmailTemplates])

  const handleView = (id: string) => {
    navigate({ to: `/administration/${id}` })
  }

  const handleEdit = (id: string) => {
    console.log(id)
    navigate({ to: `/administration/templates` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("smsmailTemplates.messages.delete.confirm"))) {
      deleteSmsmailTemplate(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("smsmailTemplates.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
                {t("smsmailTemplates.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("smsmailTemplates.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("smsmailTemplates.actions.delete")}
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
          label: bulkDeleteMutation.isPending ? t("smsmailTemplates.bulk.deleting") : t("smsmailTemplates.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("smsmailTemplates.messages.noData")}
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
