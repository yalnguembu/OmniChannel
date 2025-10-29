import { useTranslation } from "react-i18next"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "../../../shared/components/ListPageHeader"
import { BaseFilter } from "@/shared/components/filter"
import { SearchWithdrawalsReadModelRequest, WithdrawalsInitRequest } from "@/shared/api/types.gen"
import { zSearchWithdrawalsReadModelRequest } from "@/shared/api/zod.gen"
import { WithdrawalsReadModelDataGrid } from "../components/WithdrawalsReadModelDataGrid"
import { useWithdrawalsReadModel } from "../hooks/useWithdrawalsReadModel"
import { useState } from "react"
import { WithdrawalInitForm } from "../components/WithdrawalInitForm"
import { ModalWrapper } from "@/shared/components/ModalWrapper"
import { useSessionStore } from "@/shared/stores/sessionStore"

export function WithdrawalsReadModelsListPage() {
  const { t } = useTranslation()
  const { userPermissions } = useSessionStore()
  const { isLoading, isError, error, viewMode, setViewMode, refreshData, hasSelection, selectedRows, applyFilters, clearFilters, createWithdrawalReadModelWithValidation } =
    useWithdrawalsReadModel()

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)

  const toggleShowCreateForm = () => setShowCreateForm((prev) => !prev)

  const handleExport = () => {
    // Implement export logic
  }
  const handleSubmitWithdrawalInit = (data: WithdrawalsInitRequest, setError: any) => {
    createWithdrawalReadModelWithValidation(data, setError, () => {
      toggleShowCreateForm()
    })
  }

  const mainContent = () => {
    if (isError && error) {
      // toast.error(t(error))
    }

    return (
      <>
        <WithdrawalsReadModelDataGrid />
        {showCreateForm ? (
          <ModalWrapper title="" size="2xl" open={showCreateForm} onOpenChange={toggleShowCreateForm}>
            <div className="-m-6">
              <WithdrawalInitForm onSubmit={handleSubmitWithdrawalInit} onCancel={toggleShowCreateForm} />
            </div>{" "}
          </ModalWrapper>
        ) : (
          <></>
        )}
      </>
    )
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("withdrawalsReadModels.title")}
          addButtonText={userPermissions?.includes("WITHDRAWALSREADMODEL_CREATE") ? t("withdrawalsReadModels.actions.add") : undefined}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("withdrawalsReadModels.title") }]}
          onCreate={toggleShowCreateForm}
        />
      }
      filter={
        <BaseFilter<SearchWithdrawalsReadModelRequest>
          schema={zSearchWithdrawalsReadModelRequest}
          onFilter={applyFilters}
          onReset={clearFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          refreshData={refreshData}
          isLoading={isLoading}
          hasSelection={hasSelection}
          selectedRows={selectedRows}
          selectionCount={selectedRows.length}
          onExport={handleExport}
          fieldTranslationPrefix="withdrawalsReadModels"
        />
      }
      content={mainContent()}
    />
  )
}
