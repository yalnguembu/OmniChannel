import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { DataGridColumnHeader, DataGridSort } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useKycDocument } from "../hooks/useKycDocument"
import { KycDocumentDataGridEntry } from "../lib/data-grid/KycDocumentDataGridEntry"

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
    changePageSize,
    changeSort,
    setSelectedRows,
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
        onColumnVisibilityChange={() => { }}
        dispatch={() => { }}
      />
    </div>
  )
}
