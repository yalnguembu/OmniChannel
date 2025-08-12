import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { SettingCreateForm } from "../components/SettingCreateForm"
import { useSetting } from "../hooks/useSetting"
import { UpdateSettingRequest } from "@/shared/api"

export function CreateSettingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useSetting()

  const handleSubmit = (data: UpdateSettingRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/settings` })
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/administration/settings` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("settings.create")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("settings.title"), href: "/administration/settings" }, { label: t("settings.create") }]}
        />
      }
      content={<SettingCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
