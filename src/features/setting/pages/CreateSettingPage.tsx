import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { SettingCreateForm } from "../components/SettingCreateForm"
import { useSettingMutations } from "../hooks/useSettingMutations"
import { CreateSettingRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateSettingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useSettingMutations()

  const handleSubmit = (data: CreateSettingRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("setting.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("setting.title"), href: "/setting" },
          { label: t("setting.actions.add") },
        ]}
      />
      <div className="mt-6">
        <SettingCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
