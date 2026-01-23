import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { CompanyVerificationEditForm } from "../components/CompanyVerificationEditForm"
import { useCompanyVerificationMutations } from "../hooks/useCompanyVerificationMutations"
import { useCompanyVerificationDetail } from "../hooks/useCompanyVerificationDetail"
import { UpdateCompanyVerificationRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditCompanyVerificationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/companyVerification/$id/edit" })
  
  const { companyVerification, isLoading, isError } = useCompanyVerificationDetail(id)
  const { updateMutation } = useCompanyVerificationMutations()

  const handleSubmit = (data: UpdateCompanyVerificationRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/companyVerification" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/companyVerification" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !companyVerification) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("companyVerification.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("companyVerification.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("companyVerification.title"), href: "/companyVerification" },
          { label: t("companyVerification.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <CompanyVerificationEditForm
          initialData={companyVerification}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
