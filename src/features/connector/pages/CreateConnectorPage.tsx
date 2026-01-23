import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ConnectorCreateForm } from "../components/ConnectorCreateForm"
import { useConnectorMutations } from "../hooks/useConnectorMutations"
import { CreateConnectorRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateConnectorPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useConnectorMutations()

  const handleSubmit = (data: CreateConnectorRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("connector.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("connector.title"), href: "/connector" },
          { label: t("connector.actions.add") },
        ]}
      />
      <div className="mt-6">
        <ConnectorCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
