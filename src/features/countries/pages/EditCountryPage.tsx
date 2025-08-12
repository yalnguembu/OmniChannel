import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { CountryEditForm } from "../components/CountryEditForm"
import { Loader2 } from "lucide-react"
// import { toast } from "sonner"
import { useCountry } from "../hooks/useCountry"
import { UpdateCountryRequest } from "@/shared/api"

export function EditCountryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/administration/countries/$id/edit" })
  const { selectedCountry: data, updateMutation, getCountryQuery, isLoading } = useCountry()

  const handleSubmit = (data: UpdateCountryRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/countries` })
        },
      },
    )
  }

  useEffect(() => {
    if (id) {
      getCountryQuery(id)
    }
  }, [])

  const handleCancel = () => {
    navigate({ to: `/administration/countries` })
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
        <p>{t("countries.form.edit.loadError")}</p>
      </div>
    )
  }

  // if (isError && error) {
  //     // toast.error(t(error))
  //   }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("countries.edit")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("countries.title"), href: "/country" }, { label: t("countries.edit") }]}
        />
      }
      content={<CountryEditForm countryId={id} initialData={data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
