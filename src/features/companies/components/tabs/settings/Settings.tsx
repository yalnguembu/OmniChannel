import { useTranslation } from "react-i18next"
import { useEffect, useMemo, useState } from "react"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { Plus } from "lucide-react"
import { useSetting } from "@/features/settings/hooks/useSetting"
import { BaseFilter } from "@/shared/components/filter/base-filter"
import { zSearchSettingRequest } from "@/shared/api/zod.gen"
import { SearchSettingRequest, UpdateSettingRequest } from "@/shared"
import { CommonDataGridEntry, Entity } from "@/shared/components/data-grid/adapters/common"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { SettingCreateForm } from "@/features/settings/components/SettingCreateForm"

export function SettingsTab({ companyId }: { companyId: string }) {
  const { t } = useTranslation()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const {
    settings,
    searchSettings,
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
  } = useSetting()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "applicationName",
      label: "Application Name",
      sortable: true,
      resizable: true,
    },
    {
      key: "value",
      label: "Value",
      sortable: true,
      resizable: true,
    },
    {
      key: "dataType",
      label: "Data Type",
      sortable: true,
      resizable: true,
    },
    {
      key: "isEncrypted",
      label: "Is Encrypted",
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
      key: "category",
      label: "Category",
      sortable: true,
      resizable: true,
    },
    {
      key: "isReadOnly",
      label: "Is Read Only",
      sortable: true,
      resizable: true,
    },
    {
      key: "isSystemSetting",
      label: "Is System Setting",
      sortable: true,
      resizable: true,
    },
    {
      key: "allowedValues",
      label: "Allowed Values",
      sortable: true,
      resizable: true,
    },
    {
      key: "validationRegex",
      label: "Validation Regex",
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
      label: t("settings.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  useEffect(() => {
    searchSettings()
  }, [])

  const gridItems = useMemo(() => {
    return settings.map((item) => new CommonDataGridEntry(item as Entity))
  }, [settings])


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


  const handleSubmit = (data: UpdateSettingRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          toggleShowCreateModal()
          searchSettings()
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-y-4 pt-4">
      <BaseFilter<SearchSettingRequest>
        schema={zSearchSettingRequest}
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
            emptyMessage={t("settings.messages.noData")}
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
      <ModalWrapper title={t("settings.form.create.title")} description={t("settings.form.create.title")} open={showCreateModal} onOpenChange={toggleShowCreateModal}>
        <SettingCreateForm companyId={companyId} onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />
      </ModalWrapper>
    </div>
  )
}
