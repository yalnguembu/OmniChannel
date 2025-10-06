import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { useSecureSetting } from "../hooks/useSecureSetting"
import { SecureSettingRequest } from "@/shared/api"
import { SecureSettingEditForm } from "../components/SecureSettingEditForm"

export function EditSecureSettingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { updateSecureSettingWithValidation, getSecureSettingBySystemNameQuery } = useSecureSetting()
  const { "system-name": systemName } = useParams({ from: "/_protected/administration/secure-settings/$system-name/edit" })

  const handleSubmit = (data: SecureSettingRequest[], setError: any) => {
    updateSecureSettingWithValidation(data, setError, () => {
      navigate({ to: `/administration/secure-settings` })
    })
  }

  const handleCancel = () => {
    navigate({ to: `/administration/secure-settings` })
  }
  const { data, isLoading } = getSecureSettingBySystemNameQuery(systemName)

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
      content={<SecureSettingEditForm defaultValues={data?.data ?? []} systemName={systemName} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />}
    />
  )
}
