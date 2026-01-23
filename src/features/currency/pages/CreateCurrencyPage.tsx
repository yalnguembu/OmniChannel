import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { CurrencyCreateForm } from "../components/CurrencyCreateForm"
import { useCurrencyMutations } from "../hooks/useCurrencyMutations"
import { CreateCurrencyRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateCurrencyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useCurrencyMutations()

  const handleSubmit = (data: CreateCurrencyRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("currency.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("currency.title"), href: "/currency" },
          { label: t("currency.actions.add") },
        ]}
      />
      <div className="mt-6">
        <CurrencyCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
