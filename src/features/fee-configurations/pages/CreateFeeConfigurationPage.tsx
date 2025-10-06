import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { FeeConfigurationCreateForm } from "../components/FeeConfigurationCreateForm"
import { useFeeConfiguration } from "../hooks/useFeeConfiguration"
import { CreateFeeConfigurationRequest } from "@/shared/api"

export function CreateFeeConfigurationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createFeeConfigurationWithValidation } = useFeeConfiguration()

  const handleSubmit = (data: CreateFeeConfigurationRequest, setError: any) => {
    createFeeConfigurationWithValidation(data, setError, () => {
      navigate({ to: `/administration/fee-configurations` })
    })
  }

  const handleCancel = () => {
    navigate({ to: `/administration/fee-configurations` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("feeConfigurations.create")}
          breadcrumbs={[
            { label: t("menu.administration"), href: "/dashboard" },
            { label: t("feeConfigurations.title"), href: "/administration/fee-configurations" },
            { label: t("feeConfigurations.create") },
          ]}
        />
      }
      content={<FeeConfigurationCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
