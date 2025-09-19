import { useTranslation } from "react-i18next"
// import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { FeeConfigurationCreateForm } from "../components/FeeConfigurationCreateForm"
import { useFeeConfiguration } from "../hooks/useFeeConfiguration"
import { UpdateFeeConfigurationRequest } from "@/shared/api"

export function CreateFeeConfigurationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useFeeConfiguration()

  const handleSubmit = (data: UpdateFeeConfigurationRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/fee-configurations` })
        },
        onError: () => {
          // toast.error(t(error))
        },
      },
    )
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
