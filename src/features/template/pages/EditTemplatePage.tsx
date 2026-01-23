import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { TemplateEditForm } from "../components/TemplateEditForm"
import { useTemplateMutations } from "../hooks/useTemplateMutations"
import { useTemplateDetail } from "../hooks/useTemplateDetail"
import { UpdateTemplateRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditTemplatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/template/$id/edit" })
  
  const { template, isLoading, isError } = useTemplateDetail(id)
  const { updateMutation } = useTemplateMutations()

  const handleSubmit = (data: UpdateTemplateRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
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

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !template) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("template.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("template.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("template.title"), href: "/template" },
          { label: t("template.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <TemplateEditForm
          initialData={template}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
