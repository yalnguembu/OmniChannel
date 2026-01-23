import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ConnectorEditForm } from "../components/ConnectorEditForm"
import { useConnectorMutations } from "../hooks/useConnectorMutations"
import { useConnectorDetail } from "../hooks/useConnectorDetail"
import { UpdateConnectorRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditConnectorPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/connector/$id/edit" })
  
  const { connector, isLoading, isError } = useConnectorDetail(id)
  const { updateMutation } = useConnectorMutations()

  const handleSubmit = (data: UpdateConnectorRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/connector" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/connector" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !connector) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("connector.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("connector.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("connector.title"), href: "/connector" },
          { label: t("connector.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <ConnectorEditForm
          initialData={connector}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
