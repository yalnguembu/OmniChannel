import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { IntegrationSyncLogEditForm } from "../components/IntegrationSyncLogEditForm"
import { useIntegrationSyncLogMutations } from "../hooks/useIntegrationSyncLogMutations"
import { useIntegrationSyncLogDetail } from "../hooks/useIntegrationSyncLogDetail"
import { UpdateIntegrationSyncLogRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditIntegrationSyncLogPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/integrationSyncLog/$id/edit" })
  
  const { integrationSyncLog, isLoading, isError } = useIntegrationSyncLogDetail(id)
  const { updateMutation } = useIntegrationSyncLogMutations()

  const handleSubmit = (data: UpdateIntegrationSyncLogRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
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

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !integrationSyncLog) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("integrationSyncLog.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("integrationSyncLog.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("integrationSyncLog.title"), href: "/integrationSyncLog" },
          { label: t("integrationSyncLog.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <IntegrationSyncLogEditForm
          initialData={integrationSyncLog}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
