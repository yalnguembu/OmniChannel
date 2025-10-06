import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchReceiptsReadModelRequest } from "@/shared/api/types.gen"
import { zSearchReceiptsReadModelRequest } from "@/shared/api/zod.gen"
import { ReceiptsReadModelDataGrid } from "../components/ReceiptsReadModelDataGrid"
import { useReceiptsReadModel } from "../hooks/useReceiptsReadModel"
import { useEffect, useMemo } from "react"
import { TransactionStatisticCards } from "../components/TransactionStatisticCards"
import { FilterSectionBuilder } from "@/shared/lib/filter"
import { FilterFieldType } from "@/shared/enums/filter"

export function ReceiptsReadModelsListPage() {
  const { t } = useTranslation()
  const {
    isLoading,
    viewMode,
    setViewMode,
    refreshData,
    hasSelection,
    selectedRows,
    applyFilters,
    clearFilters,
    searchReceiptsReadModels,
    companyDropdownQuery,
    applicationDropdownQuery,
  } = useReceiptsReadModel()

  useEffect(() => {
    searchReceiptsReadModels()
  }, [])
  const handleImport = () => {
    // Implement import logic
  }

  const handleExport = () => {
    // Implement export logic
  }

  const companyOptions = useMemo(() => companyDropdownQuery.data?.data?.map((c) => ({ value: c.id ?? "", label: c.name ?? "" })) ?? [], [companyDropdownQuery.data])

  const applicationOptions = useMemo(() => applicationDropdownQuery.data?.data?.map((a) => ({ value: a.id ?? "", label: a.name ?? "" })) ?? [], [applicationDropdownQuery.data])

  const paymentMethodOptions = [
    { value: "ORANGE_MONEY", label: t("statusBadges.ORANGE") },
    { value: "MTN_MOMO", label: t("statusBadges.MTN") },
  ]

  const statusOptions = [
    { value: "PENDING", label: t("statusBadges.PENDING") },
    { value: "PROCESSING", label: t("statusBadges.PROCESSING") },
    { value: "VALIDATING", label: t("statusBadges.VALIDATING") },
    { value: "COMPLETED", label: t("statusBadges.COMPLETED") },
    { value: "FAILED", label: t("statusBadges.FAILED") },
    { value: "CANCELLED", label: t("statusBadges.CANCELLED") },
    { value: "REJECTED", label: t("statusBadges.REJECTED") },
    { value: "TIMEOUT", label: t("statusBadges.TIMEOUT") },
  ]

  const filterSections = useMemo(
    () => [
      new FilterSectionBuilder(t(""), false, false)
        .addField({
          key: "companyId",
          label: t("receiptsreadmodels.headers.companyId"),
          type: FilterFieldType.SEARCHDROPDOWN,
          placeholder: t("receiptsreadmodels.headers.companyId"),
          options: companyOptions,
          isLoadingOptions: companyDropdownQuery.isLoading,
        })
        .addField({
          key: "applicationId",
          label: t("receiptsreadmodels.headers.applicationId"),
          type: FilterFieldType.SEARCHDROPDOWN,
          placeholder: t("receiptsreadmodels.headers.applicationId"),
          options: applicationOptions,
          isLoadingOptions: applicationDropdownQuery.isLoading,
        })
        .addField({
          key: "paymentMethodCode",
          label: t("receiptsreadmodels.headers.paymentMethodCode"),
          type: FilterFieldType.SELECT,
          placeholder: t("receiptsreadmodels.headers.paymentMethodCode"),
          options: paymentMethodOptions,
        })
        .addField({
          key: "status",
          label: t("receiptsreadmodels.headers.status"),
          type: FilterFieldType.SELECT,
          placeholder: t("receiptsreadmodels.headers.status"),
          options: statusOptions,
        })
        .addField({
          key: "internalReference",
          label: t("receiptsreadmodels.headers.internalReference"),
          type: FilterFieldType.TEXT,
          placeholder: t("receiptsreadmodels.headers.internalReference"),
        })
        .addField({
          key: "externalReference",
          label: t("receiptsreadmodels.headers.externalReference"),
          type: FilterFieldType.TEXT,
          placeholder: t("receiptsreadmodels.headers.externalReference"),
        })
        .addField({
          key: "providerInitialReference",
          label: t("receiptsreadmodels.headers.providerInitialReference"),
          type: FilterFieldType.TEXT,
          placeholder: t("receiptsreadmodels.headers.providerInitialReference"),
        })
        .addField({
          key: "providerFinalReference",
          label: t("receiptsreadmodels.headers.providerFinalReference"),
          type: FilterFieldType.TEXT,
          placeholder: t("receiptsreadmodels.headers.providerFinalReference"),
        })
        .addField({
          key: "phoneNumberEncrypted",
          label: t("receiptsreadmodels.headers.phoneNumberEncrypted"),
          type: FilterFieldType.TEXT,
          placeholder: t("receiptsreadmodels.headers.phoneNumberEncrypted"),
        })
        .addField({
          key: "customerName",
          label: t("receiptsreadmodels.headers.customerName"),
          type: FilterFieldType.TEXT,
          placeholder: t("receiptsreadmodels.headers.customerName"),
        })
        .addField({
          key: "customerEmail",
          label: t("receiptsreadmodels.headers.customerEmail"),
          type: FilterFieldType.TEXT,
          placeholder: t("receiptsreadmodels.headers.customerEmail"),
        })
        // .addField({
        //   key: "customerIpAddress",
        //   label: t("receiptsreadmodels.headers.customerIpAddress"),
        //   type: FilterFieldType.TEXT,
        //   placeholder: t("receiptsreadmodels.headers.customerIpAddress"),
        // })
        // .addField({
        //   key: "currency",
        //   label: t("receiptsreadmodels.headers.currency"),
        //   type: FilterFieldType.TEXT,
        //   placeholder: t("receiptsreadmodels.headers.currency"),
        // })
        .build(),
    ],
    [t, companyOptions, applicationOptions, companyDropdownQuery.isLoading, applicationDropdownQuery.isLoading],
  )

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader title={t("receiptsReadModels.title")} breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("receiptsReadModels.title") }]} />
      }
      statistic={<TransactionStatisticCards />}
      filter={
        <BaseFilter<SearchReceiptsReadModelRequest>
          schema={zSearchReceiptsReadModelRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          onImport={handleImport}
          onExport={handleExport}
          fieldTranslationPrefix="receiptsReadModels"
          sections={filterSections}
          enableDateRange={true}
        />
      }
      content={<ReceiptsReadModelDataGrid />}
    />
  )
}
