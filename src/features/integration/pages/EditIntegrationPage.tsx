import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { IntegrationEditForm } from "../components/IntegrationEditForm"
import { useIntegrationMutations } from "../hooks/useIntegrationMutations"
import { useIntegrationDetail } from "../hooks/useIntegrationDetail"
import { UpdateIntegrationRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditIntegrationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/integration/$id/edit" })
  
  const { integration, isLoading, isError } = useIntegrationDetail(id)
  const { updateMutation } = useIntegrationMutations()

  const handleSubmit = (data: UpdateIntegrationRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/integration" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/integration" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !integration) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("integration.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("integration.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("integration.title"), href: "/integration" },
          { label: t("integration.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <IntegrationEditForm
          initialData={integration}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
