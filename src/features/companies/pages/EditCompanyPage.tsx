import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { CompanyEditForm } from "../components/CompanyEditForm"
import { Loader2 } from "lucide-react"
import { useCompany } from "../hooks/useCompany"
import { UpdateCompanyRequest } from "@/shared/api"

export function EditCompanyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/companies/$id/edit" })
  const { updateCompanyWithValidation, getCompanyQuery } = useCompany()

  const handleSubmit = (data: UpdateCompanyRequest, setError: any) => {
    updateCompanyWithValidation(data, setError, () => {
      navigate({ to: "/companies" })
    })
  }

  const { data, isPending } = getCompanyQuery(id)

  const handleCancel = () => {
    navigate({ to: `/companies` })
  }

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data?.data) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>{t("companies.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("companies.edit")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("companies.title"), href: "/companies" }, { label: t("companies.edit") }]}
        />
      }
      content={<CompanyEditForm companyId={id} initialData={data.data} onSubmit={handleSubmit as any} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
