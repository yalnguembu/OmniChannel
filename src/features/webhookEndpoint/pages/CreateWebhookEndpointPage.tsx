import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { WebhookEndpointCreateForm } from "../components/WebhookEndpointCreateForm"
import { useWebhookEndpointMutations } from "../hooks/useWebhookEndpointMutations"
import { CreateWebhookEndpointRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateWebhookEndpointPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useWebhookEndpointMutations()

  const handleSubmit = (data: CreateWebhookEndpointRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("webhookEndpoint.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("webhookEndpoint.title"), href: "/webhookEndpoint" },
          { label: t("webhookEndpoint.actions.add") },
        ]}
      />
      <div className="mt-6">
        <WebhookEndpointCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
