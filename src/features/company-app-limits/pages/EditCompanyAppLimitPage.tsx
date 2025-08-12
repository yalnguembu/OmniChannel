import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { CompanyAppLimitEditForm } from "../components/CompanyAppLimitEditForm"
import { Loader2 } from "lucide-react"
// import { toast } from "sonner"
import { useCompanyAppLimit } from "../hooks/useCompanyAppLimit"
import { UpdateCompanyAppLimitRequest } from "@/shared/api"

export function EditCompanyAppLimitPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/administration/company-app-limits/$id/edit" })
  const { selectedCompanyAppLimit: data, updateMutation, getCompanyAppLimitQuery, isLoading } = useCompanyAppLimit()

  const handleSubmit = (data: UpdateCompanyAppLimitRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/company-app-limits` })
        },
      },
    )
  }

  useEffect(() => {
    if (id) {
      getCompanyAppLimitQuery(id)
    }
  }, [])

  const handleCancel = () => {
    navigate({ to: `/administration/company-app-limits` })
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
        <p>{t("companyAppLimits.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("companyAppLimits.edit")}
          breadcrumbs={[
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("companyAppLimits.title"), href: "/companyAppLimit" },
            { label: t("companyAppLimits.edit") },
          ]}
        />
      }
      content={<CompanyAppLimitEditForm companyAppLimitId={id} initialData={data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
