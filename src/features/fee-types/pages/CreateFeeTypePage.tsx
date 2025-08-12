import { useTranslation } from "react-i18next"
// import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { FeeTypeCreateForm } from "../components/FeeTypeCreateForm"
import { useFeeType } from "../hooks/useFeeType"
import { UpdateFeeTypeRequest } from "@/shared/api"

export function CreateFeeTypePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useFeeType()

  const handleSubmit = (data: UpdateFeeTypeRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/fee-types` })
        },
        onError: () => {
          // toast.error(t(error))
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/administration/fee-types` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("feeTypes.create")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("feeTypes.title"), href: `/administration/fee-types` }, { label: t("feeTypes.create") }]}
        />
      }
      content={<FeeTypeCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
