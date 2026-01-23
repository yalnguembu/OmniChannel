import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ClientImportEditForm } from "../components/ClientImportEditForm"
import { useClientImportMutations } from "../hooks/useClientImportMutations"
import { useClientImportDetail } from "../hooks/useClientImportDetail"
import { UpdateClientImportRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditClientImportPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/clientImport/$id/edit" })
  
  const { clientImport, isLoading, isError } = useClientImportDetail(id)
  const { updateMutation } = useClientImportMutations()

  const handleSubmit = (data: UpdateClientImportRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/clientImport" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/clientImport" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !clientImport) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("clientImport.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("clientImport.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("clientImport.title"), href: "/clientImport" },
          { label: t("clientImport.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <ClientImportEditForm
          initialData={clientImport}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
