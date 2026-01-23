import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ClientImportCreateForm } from "../components/ClientImportCreateForm"
import { useClientImportMutations } from "../hooks/useClientImportMutations"
import { CreateClientImportRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateClientImportPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useClientImportMutations()

  const handleSubmit = (data: CreateClientImportRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("clientImport.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("clientImport.title"), href: "/clientImport" },
          { label: t("clientImport.actions.add") },
        ]}
      />
      <div className="mt-6">
        <ClientImportCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
