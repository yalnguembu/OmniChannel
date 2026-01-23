import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { CompanyEditForm } from "../components/CompanyEditForm"
import { useCompanyMutations } from "../hooks/useCompanyMutations"
import { useCompanyDetail } from "../hooks/useCompanyDetail"
import { UpdateCompanyRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditCompanyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/company/$id/edit" })
  
  const { company, isLoading, isError } = useCompanyDetail(id)
  const { updateMutation } = useCompanyMutations()

  const handleSubmit = (data: UpdateCompanyRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/company" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/company" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !company) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("company.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("company.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("company.title"), href: "/company" },
          { label: t("company.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <CompanyEditForm
          initialData={company}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
