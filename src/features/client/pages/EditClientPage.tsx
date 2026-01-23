import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ClientEditForm } from "../components/ClientEditForm"
import { useClientMutations } from "../hooks/useClientMutations"
import { useClientDetail } from "../hooks/useClientDetail"
import { UpdateClientRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditClientPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/client/$id/edit" })
  
  const { client, isLoading, isError } = useClientDetail(id)
  const { updateMutation } = useClientMutations()

  const handleSubmit = (data: UpdateClientRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/client" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/client" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !client) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("client.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("client.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("client.title"), href: "/client" },
          { label: t("client.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <ClientEditForm
          initialData={client}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
