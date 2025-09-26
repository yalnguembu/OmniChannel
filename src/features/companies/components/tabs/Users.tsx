import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, ACTION, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import {  Plus } from "lucide-react"
import { useUser } from "@/features/users/hooks/useUser"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchUserRequest } from "@/shared/api/zod.gen"
import { CreateCompanyUserRequest, SearchUserRequest } from "@/shared"
import { CommonDataGridEntry, Entity } from "@/shared/components/data-grid/adapters/common"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { UserCreateForm } from "../UserCreateForm"

export function UsersTab({ companyId }: { companyId: string }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const {
    users,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    hasSelection,
    viewMode,
    setViewMode,
    refreshData,
    applyFilters,
    clearFilters,
    changePage,
    changeSort,
    setSelectedRows,
    deleteUser,
    createCompanyMutation,
  } = useUser()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "firstName",
      label: "First Name",
      sortable: true,
      resizable: true,
    },
    {
      key: "lastName",
      label: "Last Name",
      sortable: true,
      resizable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      resizable: true,
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      sortable: true,
      resizable: true,
    },
    {
      key: "userType",
      label: "User Type",
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
      key: "createdAt",
      label: "Created At",
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("users.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return users.map((item) => new CommonDataGridEntry(item as Entity))
  }, [users])

  const handleView = (id: string) => {
    navigate({ to: `/access-control/user/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/access-control/users/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("users.messages.delete.confirm"))) {
      deleteUser(id)
    }
  }
  const handleDispatch = (action: ACTION, id: string) => {
    if (action === "view") handleView(id)
    else if (action === "edit") handleEdit(id)
    else if (action === "delete") handleDelete(id)
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

  const handleSubmit = (data: CreateCompanyUserRequest) => {
    createCompanyMutation.mutate(
      { body: data },
      {
        onSuccess: () => toggleShowCreateModal(),
      },
    )
  }

  return (
    <div className="flex flex-col gap-y-4 pt-4">
      <BaseFilter<SearchUserRequest>
        schema={zSearchUserRequest}
        onFilter={applyFilters}
        onReset={clearFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        refreshData={refreshData}
        isLoading={isLoading}
        hasSelection={hasSelection}
        selectedRows={selectedRows}
        selectionCount={selectedRows.length}
        defaultCollapsed={false}
        fieldTranslationPrefix="users"
      />

      <Card>
        <CardContent className="relative">
          <Button onClick={toggleShowCreateModal} className="absolute top-2 right-36">
            <Plus className="size-4" />
            <span>{t("users.form.create.title")}</span>
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
            emptyMessage={t("users.messages.noData")}
            enableSelection={true}
            selectedRows={selectedRows}
            onSelectionChange={handleSelectionChange}
            enableSorting={true}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            enableColumnVisibility={true}
            dispatch={handleDispatch}
            actions={["view", "edit", "delete"]}
          />
        </CardContent>
      </Card>
      <ModalWrapper title={t("users.form.create.title")} description={t("users.form.create.title")} open={showCreateModal} onOpenChange={toggleShowCreateModal}>
        <UserCreateForm companyId={companyId} onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />
      </ModalWrapper>
    </div>
  )
}
