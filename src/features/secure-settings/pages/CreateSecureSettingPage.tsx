import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { SecureSettingCreateForm } from "../components/SecureSettingCreateForm"
import { useSecureSetting } from "../hooks/useSecureSetting"
import { SecureSettingRequest } from "@/shared/api"

export function CreateSecureSettingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useSecureSetting()

  const handleSubmit = (data: SecureSettingRequest[]) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/secure-settings` })
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/administration/secure-settings` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("secureSettings.create")}
          breadcrumbs={[
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("secureSettings.title"), href: "/administration/secure-settings" },
            { label: t("secureSettings.create") },
          ]}
        />
      }
      content={<SecureSettingCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
