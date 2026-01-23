import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { WebhookEndpointEditForm } from "../components/WebhookEndpointEditForm"
import { useWebhookEndpointMutations } from "../hooks/useWebhookEndpointMutations"
import { useWebhookEndpointDetail } from "../hooks/useWebhookEndpointDetail"
import { UpdateWebhookEndpointRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditWebhookEndpointPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/webhookEndpoint/$id/edit" })
  
  const { webhookEndpoint, isLoading, isError } = useWebhookEndpointDetail(id)
  const { updateMutation } = useWebhookEndpointMutations()

  const handleSubmit = (data: UpdateWebhookEndpointRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/webhookEndpoint" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/webhookEndpoint" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !webhookEndpoint) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("webhookEndpoint.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("webhookEndpoint.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("webhookEndpoint.title"), href: "/webhookEndpoint" },
          { label: t("webhookEndpoint.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <WebhookEndpointEditForm
          initialData={webhookEndpoint}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
