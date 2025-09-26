import React, { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useFeeConfiguration } from "../hooks/useFeeConfiguration"
import { FeeConfigurationDataGridEntry } from "../lib/data-grid/FeeConfigurationDataGridEntry"

export const FeeConfigurationDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    feeConfigurations,
    searchFeeConfigurations,
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
    deleteFeeConfiguration,
    bulkDeleteMutation,
  } = useFeeConfiguration()

  useEffect(() => {
    searchFeeConfigurations()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    // {
    //   key: "currencyName",
    //   label: t("feeconfigurations.headers.currencyName"),
    //   sortable: true,
    //   resizable: true,
    // },
    // {
    //   key: "currencyCode",
    //   label: t("feeconfigurations.headers.currencyCode"),
    //   sortable: true,
    //   resizable: true,
    // },
    // {
    //   key: "feeTypeName",
    //   label: t("feeconfigurations.headers.feeTypeName"),
    //   sortable: true,
    //   resizable: true,
    // },
    // {
    //   key: "feeTypeTransactionType",
    //   label: t("feeconfigurations.headers.feeTypeTransactionType"),
    //   sortable: true,
    //   resizable: true,
    // },
    // {
    //   key: "feeTypeCode",
    //   label: t("feeconfigurations.headers.feeTypeCode"),
    //   sortable: true,
    //   resizable: true,
    // },
    // {
    //   key: "feeTypeId",
    //   label: t("feeconfigurations.headers.feeTypeId"),
    //   sortable: true,
    //   resizable: true,
    // },
    {
      key: "ownerType",
      label: t("feeconfigurations.headers.ownerType"),
      sortable: true,
      resizable: true,
      isBadge: true,
    },
    // {
    //   key: "ownerId",
    //   label: t("feeconfigurations.headers.ownerId"),
    //   sortable: true,
    //   resizable: true,
    // },

    {
      key: "currencySymbol",
      label: t("feeconfigurations.headers.currencySymbol"),
      sortable: true,
      resizable: true,
    },
    {
      key: "fixedAmount",
      label: t("feeconfigurations.headers.fixedAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "percentageRate",
      label: t("feeconfigurations.headers.percentageRate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "minAmount",
      label: t("feeconfigurations.headers.minAmount"),
      sortable: true,
      resizable: true,
    },
    {
      key: "maxAmount",
      label: t("feeconfigurations.headers.maxAmount"),
      sortable: true,
      resizable: true,
    },
    // {
    //   key: "currency",
    //   label: t("feeconfigurations.headers.currency"),
    //   sortable: true,
    //   resizable: true,
    // },
    {
      key: "startDate",
      label: t("feeconfigurations.headers.startDate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "endDate",
      label: t("feeconfigurations.headers.endDate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: t("feeconfigurations.headers.isActive"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("feeconfigurations.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("feeConfigurations.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return feeConfigurations.map((item) => new FeeConfigurationDataGridEntry(item))
  }, [feeConfigurations])

  const handleView = (id: string) => {
    navigate({ to: `/administration/fee-configurations/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `/administration/fee-configurations/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    if (confirm(t("feeConfigurations.messages.delete.confirm"))) {
      deleteFeeConfiguration(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("feeConfigurations.bulk.deleteConfirm", { count: selectedRows.length }))) {
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
          label: bulkDeleteMutation.isPending ? t("feeConfigurations.bulk.deleting") : t("feeConfigurations.bulk.delete", { count: selectedRows.length }),
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
        emptyMessage={t("feeConfigurations.messages.noData")}
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
        actions={["view", "edit", "delete"]}
        dispatch={handleDispatch}
      />
    </div>
  )
}
