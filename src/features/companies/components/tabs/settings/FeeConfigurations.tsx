import { useTranslation } from "react-i18next"
import { useEffect, useMemo, useState } from "react"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"
import { useFeeConfiguration } from "@/features/fee-configurations/hooks/useFeeConfiguration"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchFeeConfigurationRequest } from "@/shared/api/zod.gen"
import { SearchFeeConfigurationRequest, UpdateFeeConfigurationRequest } from "@/shared"
import { CommonDataGridEntry, Entity } from "@/shared/components/data-grid/adapters/common"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { FeeConfigurationCreateForm } from "@/features/fee-configurations/components/FeeConfigurationCreateForm"

export function FeeConfigurationsTab({ companyId }: { companyId: string }) {
  const { t } = useTranslation()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

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
    viewMode,
    setViewMode,
    refreshData,
    applyFilters,
    clearFilters,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
    createMutation,
  } = useFeeConfiguration()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "currencyName",
      label: "Currency Name",
      sortable: true,
      resizable: true,
    },
    {
      key: "currencySymbol",
      label: "Currency Symbol",
      sortable: true,
      resizable: true,
    },
    {
      key: "currencyCode",
      label: "Currency Code",
      sortable: true,
      resizable: true,
    },
    {
      key: "feeTypeName",
      label: "Fee Type Name",
      sortable: true,
      resizable: true,
    },
    {
      key: "feeTypeTransactionType",
      label: "Fee Type Transaction Type",
      sortable: true,
      resizable: true,
    },
    {
      key: "feeTypeCode",
      label: "Fee Type Code",
      sortable: true,
      resizable: true,
    },
    {
      key: "feeTypeId",
      label: "Fee Type Id",
      sortable: true,
      resizable: true,
    },
    {
      key: "ownerType",
      label: "Owner Type",
      sortable: true,
      resizable: true,
    },
    {
      key: "ownerId",
      label: "Owner Id",
      sortable: true,
      resizable: true,
    },
    {
      key: "fixedAmount",
      label: "Fixed Amount",
      sortable: true,
      resizable: true,
    },
    {
      key: "percentageRate",
      label: "Percentage Rate",
      sortable: true,
      resizable: true,
    },
    {
      key: "minAmount",
      label: "Min Amount",
      sortable: true,
      resizable: true,
    },
    {
      key: "maxAmount",
      label: "Max Amount",
      sortable: true,
      resizable: true,
    },
    {
      key: "currency",
      label: "Currency",
      sortable: true,
      resizable: true,
    },
    {
      key: "startDate",
      label: "Start Date",
      sortable: true,
      resizable: true,
    },
    {
      key: "endDate",
      label: "End Date",
      sortable: true,
      resizable: true,
    },
    {
      key: "isActive",
      label: "Is Active",
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

  useEffect(() => {
    searchFeeConfigurations()
  }, [])

  const gridItems = useMemo(() => {
    return feeConfigurations.map((item) => new CommonDataGridEntry(item as Entity))
  }, [feeConfigurations])

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

  const handleSubmit = (data: UpdateFeeConfigurationRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toggleShowCreateModal()
          searchFeeConfigurations()
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-y-4 pt-4">
      <BaseFilter<SearchFeeConfigurationRequest>
        schema={zSearchFeeConfigurationRequest}
        onFilter={applyFilters}
        onReset={clearFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        refreshData={refreshData}
        isLoading={isLoading}
        hasSelection={hasSelection}
        selectedRows={selectedRows}
        selectionCount={selectedRows.length}
      />

      <Card className="shadow-none">
        <CardContent className="relative px-4">
          <Button onClick={toggleShowCreateModal} className="absolute top-2 right-36">
            <Plus className="size-4" />
            <span>{t("companyAppLimits.form.create.title")}</span>
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
            emptyMessage={t("feeConfigurations.messages.noData")}
            enableSelection={true}
            selectedRows={selectedRows}
            onSelectionChange={handleSelectionChange}
            enableSorting={true}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
            enableColumnVisibility={true}
            hiddenColumns={[]}
            onColumnVisibilityChange={() => { }}
            dispatch={() => { }}
          />
        </CardContent>
      </Card>
      <ModalWrapper
        title={t("feeConfigurations.form.create.title")}
        description={t("feeConfigurations.form.create.title")}
        open={showCreateModal}
        onOpenChange={toggleShowCreateModal}
      >
        <FeeConfigurationCreateForm companyId={companyId} onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />
      </ModalWrapper>
    </div>
  )
}
