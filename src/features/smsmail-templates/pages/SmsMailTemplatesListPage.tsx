import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { CreateSmsmailTemplateRequest, SearchSmsmailTemplateRequest, SmsmailTemplateDto } from "@/shared/api/types.gen"
import { zSearchSmsmailTemplateRequest } from "@/shared/api/zod.gen"
import { SmsmailTemplateCreateForm } from "../components/SmsMailTemplateCreateForm"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useSmsmailTemplate } from "../hooks/useSmsMailTemplate"
import { SmsmailTemplateDataGridEntry } from "../lib/data-grid/SmsMailTemplateDataGridEntry"
import { SmsmailTemplateEditForm } from "../components/SmsMailTemplateEditForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { ModalWrapper } from "@/shared/components/ModalWrapper"

export function SmsmailTemplatesListPage() {
  const { t } = useTranslation()
  const {
    smsmailTemplates,
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
    changePage,
    changePageSize,
    changeSort,
    setSelectedRows,
    deleteSmsmailTemplate,
    isLoading,

    viewMode,
    setViewMode,
    refreshData,
    hasSelection,
    selectedRows,
    applyFilters,
    clearFilters,
    createMutation,
  } = useSmsmailTemplate()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const toggleShowCreateModal = () => setShowCreateModal((prev) => !prev)

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

  const [showEditModal, setShowEditModal] = useState(false)
  const toggleShowEditModal = () => setShowEditModal((prev) => !prev)

  const handleSubmit = (data: CreateSmsmailTemplateRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => toggleShowCreateModal(),
      },
    )
  }

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      resizable: true,
    },
    {
      key: "locale",
      label: "Locale",
      sortable: true,
      resizable: true,
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      resizable: true,
    },
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      resizable: true,
    },
    {
      key: "body",
      label: "Body",
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
      label: t("smsmailTemplates.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const [selectedItem, setSelectedItem] = useState<SmsmailTemplateDto | null>(null)

  const gridItems = useMemo(() => {
    return smsmailTemplates.map((item) => new SmsmailTemplateDataGridEntry(item))
  }, [smsmailTemplates])

  const handleDelete = (id: string) => {
    if (confirm(t("smsmailTemplates.messages.delete.confirm"))) {
      deleteSmsmailTemplate(id)
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

  const handleEdit = (id: string) => {
    const item = smsmailTemplates.find((template) => template.id === id)
    if (item) {
      setSelectedItem(item)
      setShowEditModal(true)
    }
  }

  const handleView = (id: string) => {
    const item = smsmailTemplates.find((template) => template.id === id)
    if (item) {
      setSelectedItem(item)
      setShowDetailsModal(true)
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

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b">
      <Label className="font-semibold text-muted-foreground">{label}</Label>
      <div className="md:col-span-2">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "N/A")}</div>
    </div>
  )

  interface SmsmailTemplateDetailsProps {
    onCancel: () => void
    open: boolean
    data: Partial<SmsmailTemplateDto>
  }

  const SmsmailTemplateDetails: React.FC<SmsmailTemplateDetailsProps> = ({ onCancel, open, data }) => (
    <ModalWrapper open={open} onOpenChange={onCancel} title={t("smsmailTemplates.details.title")}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>SmsmailTemplate Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(data).map(([key, value]) => {
            if (key === "id") return null
            const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
            return <DetailItem key={key} label={formattedKey} value={value} />
          })}
        </CardContent>
      </Card>
    </ModalWrapper>
  )

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("smsmailTemplates.title")}
          addButtonText={t("smsmailTemplates.actions.add")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("smsmailTemplates.title") }]}
          onCreate={toggleShowCreateModal}
        />
      }
      filter={
        <BaseFilter<SearchSmsmailTemplateRequest>
          schema={zSearchSmsmailTemplateRequest}
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
      }
      content={
        <>
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
              renderCell={renderCell}
            />
          </div>

          {showCreateModal && <SmsmailTemplateCreateForm onSubmit={handleSubmit} onCancel={toggleShowCreateModal} isLoading={false} />}

          {showEditModal && !!selectedItem && (
            <SmsmailTemplateEditForm
              initialData={selectedItem}
              smsmailTemplateId={selectedItem.id ?? ""}
              onSubmit={handleSubmit}
              onCancel={toggleShowEditModal}
              isLoading={false}
            />
          )}

          {showDetailsModal && !!selectedItem && <SmsmailTemplateDetails data={selectedItem} open={showDetailsModal} onCancel={toggleShowDetailsModal} />}
        </>
      }
    />
  )
}
