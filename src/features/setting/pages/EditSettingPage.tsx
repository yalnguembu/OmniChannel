import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { SettingEditForm } from "../components/SettingEditForm"
import { useSettingMutations } from "../hooks/useSettingMutations"
import { useSettingDetail } from "../hooks/useSettingDetail"
import { UpdateSettingRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditSettingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/setting/$id/edit" })
  
  const { setting, isLoading, isError } = useSettingDetail(id)
  const { updateMutation } = useSettingMutations()

  const handleSubmit = (data: UpdateSettingRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/setting" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/setting" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !setting) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("setting.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("setting.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("setting.title"), href: "/setting" },
          { label: t("setting.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <SettingEditForm
          initialData={setting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
