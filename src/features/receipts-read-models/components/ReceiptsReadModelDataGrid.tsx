import React, { ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { DataGrid } from "@/shared/components/data-grid/data-grid"
import { ACTION, DataGridColumnHeader, DataGridRowEntry, DataGridSort, ViewMode } from "@/shared/types"
import { SortDirection } from "@/shared/enums/data-grid"
import { useReceiptsReadModel } from "../hooks/useReceiptsReadModel"
import { ReceiptsReadModelDataGridEntry } from "../lib/data-grid/ReceiptsReadModelDataGridEntry"
import { Mail, PhoneCall, User, MapPin, Verified } from "lucide-react"
import StatusBadge from "@/shared/components/StatusBadge"
import { BadgeStyles } from "@/shared/types/enums"
import ActionButtonGroup from "@/shared/components/data-grid/ActionButtonGroup"
import DetailsCardItem from "@/shared/components/DetailsCardItem"

export const ReceiptsReadModelDataGrid: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    receiptsReadModels,
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
    bulkDeleteMutation,
  } = useReceiptsReadModel()

  const columnHeaders: DataGridColumnHeader[] = [
    {
      key: "paymentMethod",
      label: "M",
      sortable: true,
      resizable: true,
    },
    {
      key: "coreDetails",
      label: t("receiptsreadmodels.headers.coreDetails"),
      sortable: true,
      resizable: true,
    },
    {
      key: "fee",
      label: t("receiptsreadmodels.headers.fee"),
      sortable: true,
      resizable: true,
    },
    {
      key: "context",
      label: t("receiptsreadmodels.headers.context"),
      sortable: true,
      resizable: true,
    },
    {
      key: "references",
      label: t("receiptsreadmodels.headers.references"),
      sortable: true,
      resizable: true,
    },
    {
      key: "createdAt",
      label: t("receiptsreadmodels.headers.createdAt"),
      sortable: true,
      resizable: true,
    },
    {
      key: "actions",
      label: t("receiptsReadModels.actions.more"),
      sortable: false,
      width: 70,
    },
  ]

  const enum paymentMethodCode {
    MTN_MOMO = "/icons/momo.png",
    ORANGE_MONEY = "/icons/om.png",
  }

  const gridItems = useMemo(() => {
    return receiptsReadModels.map((item) => new ReceiptsReadModelDataGridEntry(item))
  }, [receiptsReadModels])

  const handleView = (id: string) => {
    navigate({ to: `/payments/receipts/${id}` })
  }

  const handleEdit = (id: string) => {
    console.log(id)
    // navigate({ to: `/payments/receipts/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    console.log(id)
    if (confirm(t("receiptsReadModels.messages.delete.confirm"))) {
      // deleteReceiptsReadModel(id)
    }
  }

  const handleBulkDelete = () => {
    if (confirm(t("receiptsReadModels.bulk.deleteConfirm", { count: selectedRows.length }))) {
      bulkDeleteMutation.mutate(selectedRows)
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
          label: bulkDeleteMutation.isPending ? t("receiptsReadModels.bulk.deleting") : t("receiptsReadModels.bulk.delete", { count: selectedRows.length }),
          action: handleBulkDelete,
          variant: "destructive" as const,
          loading: bulkDeleteMutation.isPending,
        },
      ]
    : undefined

  const actions = ["view", "edit", "delete"]

  const renderCell = (item: DataGridRowEntry, column: DataGridColumnHeader, view: ViewMode): ReactNode => {
    if (view == "list") {
      switch (column.key) {
        case "paymentMethod":
          return <img src={paymentMethodCode[item.getTextFor("paymentMethodCode") as keyof typeof paymentMethodCode]} alt="Payment Method" className="h-6 w-6 rounded-md" />
        case "coreDetails":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("receiptsreadmodels.headers.amount")} :</span>
                <span className="text-primary">
                  {item.getTextFor("amount")}
                  {item.getTextFor("currency")}
                </span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("receiptsreadmodels.headers.netAmount")} :</span>
                <span className="">{item.getTextFor("netAmount")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <StatusBadge text={item.getTextFor("status")} />
              </div>
            </div>
          )
        case "fee":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("receiptsreadmodels.headers.providerFeeAmount")} :</span>
                <span className="text-primary">{item.getTextFor("providerFeeAmount")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("receiptsreadmodels.headers.internalFeeAmount")} :</span>
                <span className="">{item.getTextFor("internalFeeAmount")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("receiptsreadmodels.headers.feeAppliedAmount")} :</span>
                <span className="">{item.getTextFor("feeAppliedAmount")}</span>
              </div>
            </div>
          )
        case "context":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("receiptsreadmodels.headers.applicationName")} :</span>
                <span className="text-primary">{item.getTextFor("applicationName")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("receiptsreadmodels.headers.companyName")} :</span>
                <span className="">{item.getTextFor("companyName")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("receiptsreadmodels.headers.phoneNumberEncrypted")} :</span>
                <span className="">{item.getTextFor("phoneNumberEncrypted")}</span>
              </div>
            </div>
          )
        case "references":
          return (
            <div className="flex flex-col gap-y-1 text-muted-foreground/80">
              <div className="flex gap-x-1.5 lg:text-md">
                <span className="font-semibold">{t("receiptsreadmodels.headers.externalReference")} :</span>
                <span className="text-primary">{item.getTextFor("externalReference")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("receiptsreadmodels.headers.providerReference")} :</span>
                <span className="">{item.getTextFor("providerReference")}</span>
              </div>
              <div className="flex gap-x-1.5">
                <span className="font-semibold">{t("receiptsreadmodels.headers.transactionId")} :</span>
                <span className="">{item.getTextFor("transactionId")}</span>
              </div>
            </div>
          )
        case "createdAt":
          return <span className="text-muted-foreground/70">{item.getTextFor("createdAt")}</span>

        case "actions":
          return <ActionButtonGroup view={view} isLoading={isLoading} row={item} actions={actions as ACTION[]} dispatch={handleDispatch} />

        default:
          return column?.isBadge ? (
            <StatusBadge text={item.getTextFor(column.key) as string} />
          ) : (
            <span className="text-muted-foreground/70"> {item.getTextFor(column.key) || "N/A"}</span>
          )
      }
    } else {
      switch (column.key) {
        case "basicInfo":
          return (
            <div className="flex flex-col gap-y-1 px-4">
              <div className="flex items-center gap-x-2">
                <span className="font-semibold text-lg text-primary">{item.getTextFor("name")}</span>
                <StatusBadge theme={BadgeStyles.GREEN} text={item.getTextFor("status")} />
                {item.getTextFor("isVerified") === "true" && <StatusBadge Icon={Verified} theme={BadgeStyles.BLUE} text={t("receiptsreadmodels.headers.isVerified")} />}
              </div>
              <div className="flex flex-col gap-y-1 text-sm text-muted-foreground">
                <DetailsCardItem Icon={User} label={t("receiptsreadmodels.headers.companyType")} value={item.getTextFor("companyType")} />
                <DetailsCardItem Icon={Mail} label={t("receiptsreadmodels.headers.companySize")} value={item.getTextFor("companySize")} />
              </div>
            </div>
          )
        case "contactInfo":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <DetailsCardItem Icon={User} label={t("receiptsreadmodels.headers.contactPerson")} value={item.getTextFor("contactPerson")} />
              <DetailsCardItem Icon={Mail} label={t("receiptsreadmodels.headers.email")} value={item.getTextFor("email")} />
              <DetailsCardItem Icon={PhoneCall} label={t("receiptsreadmodels.headers.phoneNumber")} value={item.getTextFor("phoneNumber")} />
              <DetailsCardItem Icon={MapPin} label={t("receiptsreadmodels.headers.address")} value={item.getTextFor("address")} />
            </div>
          )
        case "legalFinancial":
          return (
            <div className="flex flex-col gap-y-1 px-4 text-sm text-muted-foreground">
              <DetailsCardItem label={t("receiptsreadmodels.headers.countryName")} value={item.getTextFor("countryName")} />
              <DetailsCardItem label={t("receiptsreadmodels.headers.businessRegistrationNumber")} value={item.getTextFor("businessRegistrationNumber")} />
              <DetailsCardItem label={t("receiptsreadmodels.headers.taxNumber")} value={item.getTextFor("taxNumber")} />
              <DetailsCardItem label={t("receiptsreadmodels.headers.website")} value={item.getTextFor("website")} />
            </div>
          )
        case "createdAt":
          return (
            <div className="px-4 pt-1 text-xs text-muted-foreground/70">
              <span>{t("receiptsreadmodels.headers.createdAt")}: </span>
              <span>{item.getTextFor("createdAt")}</span>
            </div>
          )
        case "actions":
          return (
            <div className="flex flex-row justify-between px-4 pt-2 mt-auto border-t">
              <DetailsCardItem label="#" value={1234} />
              <ActionButtonGroup view={view} isLoading={isLoading} row={item} actions={actions as ACTION[]} dispatch={handleDispatch} />
            </div>
          )
        default:
          // This will prevent rendering any other individual fields that are now part of a group.
          return null
      }
    }
  }

  const handleDispatch = (action: ACTION, id: string) => {
    switch (action) {
      case "edit":
        handleEdit(id)
        break
      case "view":
        handleView(id)
        break
      case "delete":
        handleDelete(id)
        break
      default:
        return
    }
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
        emptyMessage={t("receiptsReadModels.messages.noData")}
        enableSelection={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        enableSorting={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        enableColumnVisibility={true}
        bulkActions={bulkActions}
        renderCell={renderCell}
        action={actions}
        dispatch={handleDispatch}
      />
    </div>
  )
}
