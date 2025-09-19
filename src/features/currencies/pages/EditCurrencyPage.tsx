import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { CurrencyEditForm } from "../components/CurrencyEditForm"
import { Loader2 } from "lucide-react"
import { useCurrency } from "../hooks/useCurrency"
import { UpdateCurrencyRequest } from "@/shared/api"

export function EditCurrencyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/administration/currencies/$id/edit" })
  const { updateMutation, getCurrencyQuery, isLoading } = useCurrency()

  const handleSubmit = (data: UpdateCurrencyRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/currencies` })
        },
      },
    )
  }

  const { data: succesResponse } = getCurrencyQuery(id)

  const handleCancel = () => {
    navigate({ to: `/administration/currencies` })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!succesResponse?.data) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>{t("currencies.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("currencies.edit")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("currencies.title"), href: "/currency" }, { label: t("currencies.edit") }]}
        />
      }
      content={<CurrencyEditForm currencyId={id} initialData={succesResponse.data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
