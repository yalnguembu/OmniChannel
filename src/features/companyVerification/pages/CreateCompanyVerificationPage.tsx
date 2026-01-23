import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { CompanyVerificationCreateForm } from "../components/CompanyVerificationCreateForm"
import { useCompanyVerificationMutations } from "../hooks/useCompanyVerificationMutations"
import { CreateCompanyVerificationRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateCompanyVerificationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useCompanyVerificationMutations()

  const handleSubmit = (data: CreateCompanyVerificationRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("companyVerification.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("companyVerification.title"), href: "/companyVerification" },
          { label: t("companyVerification.actions.add") },
        ]}
      />
      <div className="mt-6">
        <CompanyVerificationCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
