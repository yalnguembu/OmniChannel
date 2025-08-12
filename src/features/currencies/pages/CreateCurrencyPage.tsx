import { useTranslation } from "react-i18next"
// import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { CurrencyCreateForm } from "../components/CurrencyCreateForm"
import { useCurrency } from "../hooks/useCurrency"
import { UpdateCurrencyRequest } from "@/shared/api"

export function CreateCurrencyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useCurrency()

  const handleSubmit = (data: UpdateCurrencyRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/currencies` })
        },
        onError: () => {
          // toast.error(t(error))
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/administration/currencies` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("currencies.create")}
          breadcrumbs={[
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("currencies.title"), href: `/administration/currencies` },
            { label: t("currencies.create") },
          ]}
        />
      }
      content={<CurrencyCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
