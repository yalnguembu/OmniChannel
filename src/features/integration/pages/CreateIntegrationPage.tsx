import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { IntegrationCreateForm } from "../components/IntegrationCreateForm"
import { useIntegrationMutations } from "../hooks/useIntegrationMutations"
import { CreateIntegrationRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateIntegrationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useIntegrationMutations()

  const handleSubmit = (data: CreateIntegrationRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("integration.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("integration.title"), href: "/integration" },
          { label: t("integration.actions.add") },
        ]}
      />
      <div className="mt-6">
        <IntegrationCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
