import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useMemo, useState, useEffect } from "react"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, Plus } from "lucide-react"
import { useApplication } from "../../hooks/useApplication"
import { UpdateApplicationRequest } from "@/shared"
import { ApplicationDataGridEntry } from "../../lib/data-grid/ApplicationDataGridEntry"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { ApplicationCreateForm } from "../ApplicationCreateForm"

export function ApplicationsTab({ companyId }: { companyId: string }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const {
    applications,
    searchApplicationsByCompany,
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
    deleteApplication,
    bulkDeleteMutation,
    createMutation,
  } = useApplication()

  useEffect(() => {
    searchApplicationsByCompany(companyId)
  }, [companyId])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      resizable: true,
    },
    {
      key: "environment",
      label: "Environment",
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("applications.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return applications.map((item) => new ApplicationDataGridEntry(item))
  }, [applications])

  const handleView = (id: string) => {
    navigate({ to: `/application/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/applications/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("applications.messages.delete.confirm"))) {
      deleteApplication(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("applications.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
                {t("applications.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("applications.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("applications.actions.delete")}
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
          label: bulkDeleteMutation.isPending ? t("applications.bulk.deleting") : t("applications.bulk.delete", { count: selectedRows.length }),
          action: handleBulkDelete,
          variant: "destructive" as const,
          loading: bulkDeleteMutation.isPending,
        },
      ]
    : undefined

  const handleSubmit = (data: UpdateApplicationRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toggleShowCreateModal()
        },
      },
    )
  }

  return (
    <>
      <Card className="flex flex-col gap-y-4 mt-4 xl:mt-6">
        <CardContent className="relative">
          <Button onClick={toggleShowCreateModal} className="absolute top-2 right-6">
            <Plus className="size-4" />
            <span>{t("applications.form.create.title")}</span>
          </Button>
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
            enableSelection={false}
            onSelectionChange={handleSelectionChange}
            enableSorting={true}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            enableColumnVisibility={false}
            hiddenColumns={[]}
            onColumnVisibilityChange={() => {}}
            bulkActions={bulkActions}
            renderCell={renderCell}
          />
        </CardContent>
      </Card>
      <ModalWrapper withHeader={false} open={showCreateModal} onOpenChange={toggleShowCreateModal}>
        <ApplicationCreateForm style="border-none shadow-none" companyId="" onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />
      </ModalWrapper>
    </>
  )
}
