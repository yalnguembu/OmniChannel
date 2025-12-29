import React, { ReactNode, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridRowEntry, DataGridSort, ViewMode } from "@/shared/types/data-grid"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Trash2, Mail, PhoneCall, Power } from "lucide-react"
import { useUser } from "../hooks/useUser"
import { UserDataGridEntry } from "../lib/data-grid/UserDataGridEntry"
import StatusBadge from "@/shared/components/StatusBadge"
import { BadgeStyles } from "@/shared/types/enums"
import ActionButtonGroup from "@/shared/components/data-grid/ActionButtonGroup"
import DetailsCardItem from "@/shared/components/DetailsCardItem"
import { ConfirmationModal } from "@/shared/components/ConfirmationModal"

export const UserDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  })
  const [toggleStatusConfirmation, setToggleStatusConfirmation] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  })
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false)

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
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
    deleteUser,
    toggleUserStatus,
    bulkDeleteMutation,
  } = useUser()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "userType",
      label: t("users.headers.userType"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    {
      key: "fullName",
      label: t("users.headers.fullName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "profileName",
      label: t("users.headers.profileName"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    {
      key: "contact",
      label: t("users.headers.contact"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("users.headers.status"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    {
      key: "createdAt",
      label: t("users.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("common.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return users.map((item) => new UserDataGridEntry(item))
  }, [users])

  const handleView = (id: string) => {
    navigate({ to: `/access-control/users/${id}` })
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmation({ open: true, userId: id })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.userId) {
      deleteUser(deleteConfirmation.userId)
      setDeleteConfirmation({ open: false, userId: null })
    }
  }

  const handleToggleStatus = (id: string) => {
    setToggleStatusConfirmation({ open: true, userId: id })
  }

  const confirmToggleStatus = () => {
    if (toggleStatusConfirmation.userId) {
      toggleUserStatus(toggleStatusConfirmation.userId)
      setToggleStatusConfirmation({ open: false, userId: null })
    }
  }

  const handleBulkDelete = () => {
    setBulkDeleteConfirmation(true)
  }

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedRows)
    setBulkDeleteConfirmation(false)
  }

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "view":
        handleView(id)
        break
      case "delete":
        handleDelete(id)
        break
      case "toggle_status":
        handleToggleStatus(id)
        break
      default:
        return
    }
  }

  const actions = ["view", "toggle_status", "delete"]

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
                <DropdownMenuItem onClick={() => handleDispatch?.("toggle_status", item.getId())}>
                  <Power className="mr-2 h-4 w-4" />
                  {t("users.actions.toggleStatus")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDispatch?.("delete", item.getId())} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("countries.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        case "fullName":
          return (
            <span className="font-semibold text-xs lg:sm">{(item.getTextFor("firstName") ? `${item.getTextFor("firstName")} ` : "") + (item.getTextFor("lastName") || "")}</span>
          )
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
                <Mail className="inline size-3.5 mr-1 text-muted-foreground/60" /> {item.getTextFor("email")}
              </span>
              <span>
                <PhoneCall className="inline size-3.5 mr-1 text-muted-foreground/60" />
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
      else if (rowItem.key === "fullName")
        return (
          <DetailsCardItem
            onClick={() => rowItem.shouldClick && handleDispatch("ROW_CLICK", item.getId())}
            shouldClick={rowItem.shouldClick}
            key={rowItem.key}
            label={rowItem.label ?? ""}
            value={
              <span className="font-semibold text-sm lg:text-base">
                {(item.getTextFor("firstName") ? `${item.getTextFor("firstName")} ` : "") + (item.getTextFor("lastName") || "")}
              </span>
            }
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

  const handlePageChange = (page: number, size: number) => {
    changePage(page)
    changePageSize(size)
  }

  const bulkActions = hasSelection
    ? [
      {
        label: bulkDeleteMutation.isPending ? t("users.bulk.deleting") : t("users.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("users.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => { }}
        bulkActions={bulkActions}
        actions={actions as ACTION[]}
        dispatch={handleDispatch}
        renderCell={renderCell}
      />

      <ConfirmationModal
        open={deleteConfirmation.open}
        onOpenChange={() => setDeleteConfirmation({ open: false, userId: null })}
        onConfirm={confirmDelete}
        title={t("users.confirmations.delete.title")}
        description={t("users.confirmations.delete.description")}
        confirmText={t("users.confirmations.delete.confirm")}
        cancelText={t("users.confirmations.delete.cancel")}
        variant="danger"
      />

      <ConfirmationModal
        open={toggleStatusConfirmation.open}
        onOpenChange={() => setToggleStatusConfirmation({ open: false, userId: null })}
        onConfirm={confirmToggleStatus}
        title={t("users.confirmations.toggleStatus.title")}
        description={t("users.confirmations.toggleStatus.description")}
        confirmText={t("users.confirmations.toggleStatus.confirm")}
        cancelText={t("users.confirmations.toggleStatus.cancel")}
        variant="warning"
      />

      <ConfirmationModal
        open={bulkDeleteConfirmation}
        onOpenChange={() => setBulkDeleteConfirmation(false)}
        onConfirm={confirmBulkDelete}
        title={t("users.confirmations.bulkDelete.title")}
        description={t("users.confirmations.bulkDelete.description", { count: selectedRows.length })}
        confirmText={t("users.confirmations.bulkDelete.confirm")}
        cancelText={t("users.confirmations.bulkDelete.cancel")}
        variant="danger"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
