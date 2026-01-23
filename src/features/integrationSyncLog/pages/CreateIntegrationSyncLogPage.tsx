import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { IntegrationSyncLogCreateForm } from "../components/IntegrationSyncLogCreateForm"
import { useIntegrationSyncLogMutations } from "../hooks/useIntegrationSyncLogMutations"
import { CreateIntegrationSyncLogRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateIntegrationSyncLogPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useIntegrationSyncLogMutations()

  const handleSubmit = (data: CreateIntegrationSyncLogRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: "/integrationSyncLog" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/integrationSyncLog" })
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("integrationSyncLog.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("integrationSyncLog.title"), href: "/integrationSyncLog" },
          { label: t("integrationSyncLog.actions.add") },
        ]}
      />
      <div className="mt-6">
        <IntegrationSyncLogCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
