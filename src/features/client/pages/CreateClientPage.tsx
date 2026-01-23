import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { ClientCreateForm } from "../components/ClientCreateForm"
import { useClientMutations } from "../hooks/useClientMutations"
import { CreateClientRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateClientPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useClientMutations()

  const handleSubmit = (data: CreateClientRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("client.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("client.title"), href: "/client" },
          { label: t("client.actions.add") },
        ]}
      />
      <div className="mt-6">
        <ClientCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
