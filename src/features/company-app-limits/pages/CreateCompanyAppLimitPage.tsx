import { useTranslation } from "react-i18next"
// import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { CompanyAppLimitCreateForm } from "../components/CompanyAppLimitCreateForm"
import { useCompanyAppLimit } from "../hooks/useCompanyAppLimit"
import { UpdateCompanyAppLimitRequest } from "@/shared/api"

export function CreateCompanyAppLimitPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useCompanyAppLimit()

  const handleSubmit = (data: UpdateCompanyAppLimitRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/company-app-limits` })
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/administration/company-app-limits` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("companyAppLimits.create")}
          breadcrumbs={[
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("companyAppLimits.title"), href: "/companyAppLimit" },
            { label: t("companyAppLimits.create") },
          ]}
        />
      }
      content={<CompanyAppLimitCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
