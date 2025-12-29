import { useTranslation } from "react-i18next"
import { useEffect, useMemo, useState } from "react"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"
import { useCompanyAppLimit } from "@/features/company-app-limits/hooks/useCompanyAppLimit"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchCompanyAppLimitRequest } from "@/shared/api/zod.gen"
import { SearchCompanyAppLimitRequest, UpdateCompanyAppLimitRequest } from "@/shared"
import { CommonDataGridEntry, Entity } from "@/shared/components/data-grid/adapters/common"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { CompanyAppLimitCreateForm } from "@/features/company-app-limits/components/CompanyAppLimitCreateForm"

export function CompanyAppLimitsTab({ companyId }: { companyId: string }) {
  const { t } = useTranslation()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const {
    companyAppLimits,
    searchCompanyAppLimits,
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
  } = useCompanyAppLimit()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      resizable: true,
    },
    {
      key: "applicationName",
      label: "Application Name",
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: "Company Name",
      sortable: true,
      resizable: true,
    },
    {
      key: "apiRequestsLimit",
      label: "Api Requests Limit",
      sortable: true,
      resizable: true,
    },
    {
      key: "defaultDailyLimit",
      label: "Default Daily Limit",
      sortable: true,
      resizable: true,
    },
    {
      key: "defaultMonthlyLimit",
      label: "Default Monthly Limit",
      sortable: true,
      resizable: true,
    },
    {
      key: "defaultSingleTransactionLimit",
      label: "Default Single Transaction Limit",
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("companyAppLimits.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  useEffect(() => {
    searchCompanyAppLimits()
  }, [])

  const gridItems = useMemo(() => {
    return companyAppLimits.map((item) => new CommonDataGridEntry(item as Entity))
  }, [companyAppLimits])

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

  const handleSubmit = (data: UpdateCompanyAppLimitRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toggleShowCreateModal()
          searchCompanyAppLimits()
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-y-4 pt-4">
      <BaseFilter<SearchCompanyAppLimitRequest>
        schema={zSearchCompanyAppLimitRequest}
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
            emptyMessage={t("companyAppLimits.messages.noData")}
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
        title={t("companyAppLimits.form.create.title")}
        description={t("companyAppLimits.form.create.title")}
        open={showCreateModal}
        onOpenChange={toggleShowCreateModal}
      >
        <CompanyAppLimitCreateForm companyId={companyId} onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />
      </ModalWrapper>
    </div>
  )
}
