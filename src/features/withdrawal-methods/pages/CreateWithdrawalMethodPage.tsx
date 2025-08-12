import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { WithdrawalMethodCreateForm } from "../components/WithdrawalMethodCreateForm"
import { useWithdrawalMethod } from "../hooks/useWithdrawalMethod"
import { UpdateWithdrawalMethodRequest } from "@/shared/api"

export function CreateWithdrawalMethodPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useWithdrawalMethod()

  const handleSubmit = (data: UpdateWithdrawalMethodRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/withdrawal-methods` })
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/administration/withdrawal-methods` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("withdrawalMethod.create")}
          breadcrumbs={[
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("withdrawalMethod.title"), href: "/withdrawalMethod" },
            { label: t("withdrawalMethod.create") },
          ]}
        />
      }
      content={<WithdrawalMethodCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
