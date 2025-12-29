import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { WithdrawalMethodEditForm } from "../components/WithdrawalMethodEditForm"
import { Loader2 } from "lucide-react"
import { useWithdrawalMethod } from "../hooks/useWithdrawalMethod"
import { UpdateWithdrawalMethodRequest } from "@/shared/api"

export function EditWithdrawalMethodPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/administration/withdrawal-methods/$id/edit" })
  const { selectedWithdrawalMethod: data, updateMutation, getWithdrawalMethodQuery, isLoading } = useWithdrawalMethod()

  const handleSubmit = (data: UpdateWithdrawalMethodRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/withdrawal-methods/${id}` })
        },
      },
    )
  }

  useEffect(() => {
    if (id) {
      getWithdrawalMethodQuery(id)
    }
  }, [])

  const handleCancel = () => {
    navigate({ to: `/administration/withdrawal-methods` })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>{t("withdrawalMethod.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("withdrawalMethod.edit")}
          breadcrumbs={[
            { label: t("menu.administration"), href: "/dashboard" },
            { label: t("withdrawalMethod.title"), href: "/administration/withdrawal-methods" },
            { label: t("withdrawalMethod.edit") },
          ]}
        />
      }
      content={<WithdrawalMethodEditForm withdrawalMethodId={id} initialData={data as any} onSubmit={handleSubmit as any} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
