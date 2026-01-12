import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { CompanyCreateForm } from "../components/CompanyCreateForm"
import { useCompanyMutations } from "../hooks/useCompanyMutations"
import { CreateCompanyRequest } from "@/shared/api"

export function CreateCompanyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createCompanyWithValidation } = useCompanyMutations()

  const handleSubmit = (data: CreateCompanyRequest, setError: any) => {
    createCompanyWithValidation(data, setError, () => {
      navigate({ to: `/companies` })
    })
  }

  const handleCancel = () => {
    navigate({ to: `/companies` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("companies.create")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("companies.title"), href: "/companies" }, { label: t("companies.create") }]}
        />
      }
      content={<CompanyCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
