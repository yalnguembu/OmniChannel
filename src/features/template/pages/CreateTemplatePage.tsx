import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { TemplateCreateForm } from "../components/TemplateCreateForm"
import { useTemplateMutations } from "../hooks/useTemplateMutations"
import { CreateTemplateRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateTemplatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useTemplateMutations()

  const handleSubmit = (data: CreateTemplateRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: "/template" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/template" })
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("template.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("template.title"), href: "/template" },
          { label: t("template.actions.add") },
        ]}
      />
      <div className="mt-6">
        <TemplateCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
