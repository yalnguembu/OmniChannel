import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useDocumentsType } from "../hooks/useDocumentTypes"
import { DocumentTypeDataGridEntry } from "../lib/data-grid/DocumentTypeDataGridEntry"
import { DocumentsTypeDto, UpdateDocumentsTypeRequest } from "@/shared"
import { Label } from "@/shared/components/ui/label"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { DocumentsTypeEditForm } from "./DocumentTypeEditForm"

export const DocumentsTypeDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const {
    documentsTypes,
    searchDocumentsTypes,
    currentPage,
    pageSize,
    totalItems,
    sortBy,
    sortDirection,
    selectedRows,
    isLoading,
    changePage,
    changeSort,
    setSelectedRows,
    deleteDocumentsType,
    updateMutation,
  } = useDocumentsType()

  useEffect(() => {
    searchDocumentsTypes()
  }, [])

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("documentTypes.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "name",
      label: t("documentTypes.headers.name"),
      sortable: true,
      resizable: true,
    },
    {
      key: "description",
      label: t("documentTypes.headers.description"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("documentsTypes.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return documentsTypes.map((item) => new DocumentTypeDataGridEntry(item))
  }, [documentsTypes])

  const handleDelete = (id: string) => {
    if (confirm(t("blockedIp.messages.delete.confirm"))) {
      deleteDocumentsType(id)
    }
  }

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

  const [showEditModal, setShowEditModal] = useState(false)
  const toggleShowEditModal = () => setShowEditModal((prev) => !prev)
  const [selectedItem, setSelectedItem] = useState<DocumentsTypeDto | null>(null)

  const handleEdit = (id: string) => {
    const item = documentsTypes.find((documentType) => documentType.id === id)
    if (item) {
      setSelectedItem(item)
      setShowEditModal(true)
    }
  }

  const handleView = (id: string) => {
    const item = documentsTypes.find((documentType) => documentType.id === id)
    if (item) {
      setSelectedItem(item)
      setShowDetailsModal(true)
    }
  }
  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b">
      <Label className="font-semibold text-muted-foreground">{label}</Label>
      <div className="md:col-span-2">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "N/A")}</div>
    </div>
  )

  interface DocumentTypeDetailsProps {
    onCancel: () => void
    open: boolean
    data: Partial<DocumentsTypeDto>
  }

  const DocumentTypeDetails: React.FC<DocumentTypeDetailsProps> = ({ onCancel, open, data }) => (
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

  const handleSubmit = (data: UpdateDocumentsTypeRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => toggleShowEditModal(),
      },
    )
  }

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
        emptyMessage={t("documentsTypes.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        hiddenColumns={[]}
        onColumnVisibilityChange={() => {}}
        actions={["view", "edit", "delete"]}
        dispatch={handleDispatch}
      />
      {showEditModal && !!selectedItem && (
        <DocumentsTypeEditForm initialData={selectedItem} documentTypeId={selectedItem.id ?? ""} onSubmit={handleSubmit} onCancel={toggleShowEditModal} isLoading={false} />
      )}
      {showDetailsModal && !!selectedItem && <DocumentTypeDetails data={selectedItem} open={showDetailsModal} onCancel={toggleShowDetailsModal} />}
    </div>
  )
}
