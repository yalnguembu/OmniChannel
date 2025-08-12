import { useTranslation } from "react-i18next"
// import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { CountryCreateForm } from "../components/CountryCreateForm"
import { useCountry } from "../hooks/useCountry"
import { UpdateCountryRequest } from "@/shared/api"

export function CreateCountryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useCountry()

  const handleSubmit = (data: UpdateCountryRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/countries/add` })
        },
        onError: () => {
          // toast.error(t(error))
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/administration/countries` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("countries.create")}
          breadcrumbs={[
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("countries.title"), href: "/administration/countries" },
            { label: t("countries.create") },
          ]}
        />
      }
      content={<CountryCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
