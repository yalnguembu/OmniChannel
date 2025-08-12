import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { ApplicationEditForm } from "../components/ApplicationEditForm"
import { Loader2 } from "lucide-react"
import { useApplication } from "../hooks/useApplication"
import { UpdateApplicationRequest } from "@/shared/api"

export function EditApplicationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/applications/$id/edit" })
  const { updateMutation, isError, getApplicationQuery } = useApplication()

  const handleSubmit = (data: UpdateApplicationRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/applications` })
        },
      },
    )
  }

  const { data, isLoading } = getApplicationQuery(id)

  const handleCancel = () => {
    navigate({ to: `/applications` })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data?.data) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>{t("applications.form.edit.loadError")}</p>
      </div>
    )
  }

  if (isError) {
    // console.log(error)
    // toast.error(t(error))
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("applications.edit")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("applications.title"), href: "/application" }, { label: t("applications.edit") }]}
        />
      }
      content={<ApplicationEditForm applicationId={id} initialData={data.data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
