import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridRowEntry, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useKycDocument } from "../hooks/useKycDocument"
import { KycDocumentDataGridEntry } from "../lib/data-grid/KycDocumentDataGridEntry"
import { KycDocumentEditForm } from "./KycDocumentEditForm"
import { Label } from "@/shared/components/ui/label"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { KycDocumentDto, UpdateKycDocumentRequest } from "@/shared"

export const KycDocumentDataGrid: React.FC = () => {
  const { t } = useTranslation()

  const {
    kycDocuments,
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
    deleteKycDocument,
    updateMutation,
  } = useKycDocument()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "createdAt",
      label: t("kycdocuments.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "approvalByFirstName",
      label: t("kycdocuments.headers.approvalByFirstName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "approvalByLastName",
      label: t("kycdocuments.headers.approvalByLastName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "approvalByPhoneNumber",
      label: t("kycdocuments.headers.approvalByPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "approvalByStatus",
      label: t("kycdocuments.headers.approvalByStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "approvalByEmail",
      label: t("kycdocuments.headers.approvalByEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyName",
      label: t("kycdocuments.headers.companyName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyPhoneNumber",
      label: t("kycdocuments.headers.companyPhoneNumber"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyStatus",
      label: t("kycdocuments.headers.companyStatus"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyEmail",
      label: t("kycdocuments.headers.companyEmail"),
      sortable: true,
      resizable: true,
    },
    {
      key: "documentTypeName",
      label: t("kycdocuments.headers.documentTypeName"),
      sortable: true,
      resizable: true,
    },
    {
      key: "companyId",
      label: t("kycdocuments.headers.companyId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "documentTypeId",
      label: t("kycdocuments.headers.documentTypeId"),
      sortable: true,
      resizable: true,
    },
    {
      key: "documentUrl",
      label: t("kycdocuments.headers.documentUrl"),
      sortable: true,
      resizable: true,
    },
    {
      key: "status",
      label: t("kycdocuments.headers.status"),
      sortable: true,
      resizable: true,
    },
    {
      key: "submissionDate",
      label: t("kycdocuments.headers.submissionDate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "approvalDate",
      label: t("kycdocuments.headers.approvalDate"),
      sortable: true,
      resizable: true,
    },
    {
      key: "approvalBy",
      label: t("kycdocuments.headers.approvalBy"),
      sortable: true,
      resizable: true,
    },
    {
      key: "rejectionReason",
      label: t("kycdocuments.headers.rejectionReason"),
      sortable: true,
      resizable: true,
    },

    {
      key: "actions",
      label: t("kycDocuments.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const gridItems = useMemo(() => {
    return kycDocuments.map((item) => new KycDocumentDataGridEntry(item))
  }, [kycDocuments])

  const handleDelete = (id: string) => {
    if (confirm(t("blockedIp.messages.delete.confirm"))) {
      deleteKycDocument(id)
    }
  }

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toggleShowDetailsModal = () => setShowDetailsModal((prev) => !prev)

  const [showEditModal, setShowEditModal] = useState(false)
  const toggleShowEditModal = () => setShowEditModal((prev) => !prev)
  const [selectedItem, setSelectedItem] = useState<KycDocumentDto | null>(null)

  const handleEdit = (id: string) => {
    const item = kycDocuments.find((kycDocument) => kycDocument.id === id)
    if (item) {
      setSelectedItem(item)
      setShowEditModal(true)
    }
  }

  const handleView = (id: string) => {
    const item = kycDocuments.find((kycDocument) => kycDocument.id === id)
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

  interface KycDetailsProps {
    onCancel: () => void
    open: boolean
    data: Partial<KycDocumentDto>
  }

  const KycDetails: React.FC<KycDetailsProps> = ({ onCancel, open, data }) => (
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
                {t("kycDocuments.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(item.getId())}>
                <Edit className="mr-2 h-4 w-4" />
                {t("kycDocuments.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(item.getId())} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("kycDocuments.actions.delete")}
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

  const handleSubmit = (data: UpdateKycDocumentRequest) => {
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
        emptyMessage={t("kycDocuments.messages.noData")}
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

      {showEditModal && !!selectedItem && (
        <KycDocumentEditForm initialData={selectedItem} kycDocumentId={selectedItem.id ?? ""} onSubmit={handleSubmit} onCancel={toggleShowEditModal} isLoading={false} />
      )}
      {showDetailsModal && !!selectedItem && <KycDetails data={selectedItem} open={showDetailsModal} onCancel={toggleShowDetailsModal} />}
    </div>
  )
}
