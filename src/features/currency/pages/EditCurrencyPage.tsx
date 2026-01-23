import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { CurrencyEditForm } from "../components/CurrencyEditForm"
import { useCurrencyMutations } from "../hooks/useCurrencyMutations"
import { useCurrencyDetail } from "../hooks/useCurrencyDetail"
import { UpdateCurrencyRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditCurrencyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/currency/$id/edit" })
  
  const { currency, isLoading, isError } = useCurrencyDetail(id)
  const { updateMutation } = useCurrencyMutations()

  const handleSubmit = (data: UpdateCurrencyRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/currency" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/currency" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !currency) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("currency.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("currency.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("currency.title"), href: "/currency" },
          { label: t("currency.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <CurrencyEditForm
          initialData={currency}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
