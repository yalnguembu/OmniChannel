import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"
import { useWithdrawalMethod } from "@/features/withdrawal-methods/hooks/useWithdrawalMethod"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchWithdrawalMethodRequest } from "@/shared/api/zod.gen"
import { CreateWithdrawalMethodRequest, SearchWithdrawalMethodRequest } from "@/shared"
import { CommonDataGridEntry, Entity } from "@/shared/components/data-grid/adapters/common"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { WithdrawalMethodCreateForm } from "@/features/withdrawal-methods/components/WithdrawalMethodCreateForm"

export function WithdrawalMethodsTab({ companyId }: { companyId: string }) {
  const { t } = useTranslation()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const {
    withdrawalMethods,
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
  } = useWithdrawalMethod()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "paymentMethodName",
      label: "Payment Method Name",
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: "Name",
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
      key: "isVerified",
      label: "Is Verified",
      sortable: true,
      resizable: true,
    },
    {
      key: "verificationDate",
      label: "Verification Date",
      sortable: true,
      resizable: true,
    },
    {
      key: "verificationReference",
      label: "Verification Reference",
      sortable: true,
      resizable: true,
    },
    {
      key: "isDefault",
      label: "Is Default",
      sortable: true,
      resizable: true,
    },
    {
      key: "dailyLimit",
      label: "Daily Limit",
      sortable: true,
      resizable: true,
    },
    {
      key: "monthlyLimit",
      label: "Monthly Limit",
      sortable: true,
      resizable: true,
    },
    {
      key: "singleWithdrawalLimit",
      label: "Single Withdrawal Limit",
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
      label: t("withdrawalMethod.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return withdrawalMethods.map((item) => new CommonDataGridEntry(item as Entity))
  }, [withdrawalMethods])

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

  const handleSubmit = (data: CreateWithdrawalMethodRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => toggleShowCreateModal(),
      },
    )
  }

  return (
    <div className="flex flex-col gap-y-4 pt-4">
      <BaseFilter<SearchWithdrawalMethodRequest>
        schema={zSearchWithdrawalMethodRequest}
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
      />

      <Card className="shadow-none">
        <CardContent className="relative">
          <Button onClick={toggleShowCreateModal} className="absolute top-2 right-36">
            <Plus className="size-4" />
            <span>{t("withdrawalMethods.form.create.title")}</span>
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
            emptyMessage={t("withdrawalMethods.messages.noData")}
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
        title={t("withdrawalMethods.form.create.title")}
        description={t("withdrawalMethods.form.create.title")}
        open={showCreateModal}
        onOpenChange={toggleShowCreateModal}
      >
        <WithdrawalMethodCreateForm companyId={companyId} onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />
      </ModalWrapper>
    </div>
  )
}
