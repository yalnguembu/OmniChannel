import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { CompanyCreateForm } from "../components/CompanyCreateForm"
import { useCompanyMutations } from "../hooks/useCompanyMutations"
import { CreateCompanyRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateCompanyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useCompanyMutations()

  const handleSubmit = (data: CreateCompanyRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("company.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("company.title"), href: "/company" },
          { label: t("company.actions.add") },
        ]}
      />
      <div className="mt-6">
        <CompanyCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
