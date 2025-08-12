import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { SettingEditForm } from "../components/SettingEditForm"
import { Loader2 } from "lucide-react"
import { useSetting } from "../hooks/useSetting"
import { UpdateSettingRequest } from "@/shared/api"

export function EditSettingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/administration/settings/$id/edit" })
  const { updateMutation, getSettingQuery, isLoading } = useSetting()

  const handleSubmit = (data: UpdateSettingRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/settings` })
        },
      },
    )
  }

  const { data } = getSettingQuery(id)

  const handleCancel = () => {
    navigate({ to: `/administration/settings` })
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
        <p>{t("settings.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("settings.edit")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("settings.title"), href: "/administration/settings" }, { label: t("settings.edit") }]}
        />
      }
      content={<SettingEditForm settingId={id} initialData={data.data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
