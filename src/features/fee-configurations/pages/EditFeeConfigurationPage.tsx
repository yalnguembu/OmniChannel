import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { FeeConfigurationEditForm } from "../components/FeeConfigurationEditForm"
import { Loader2 } from "lucide-react"
import { useFeeConfiguration } from "../hooks/useFeeConfiguration"
import { UpdateFeeConfigurationRequest } from "@/shared/api"

export function EditFeeConfigurationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/administration/fee-configurations/$id/edit" })
  const { updateFeeConfigurationWithValidation, getFeeConfigurationQuery, isLoading } = useFeeConfiguration()

  const handleSubmit = (data: UpdateFeeConfigurationRequest, setError: any) => {
    updateFeeConfigurationWithValidation(data, setError, () => {
      navigate({ to: `/administration/fee-configurations` })
    })
  }

  const { data: response } = getFeeConfigurationQuery(id)

  const handleCancel = () => {
    navigate({ to: `/administration/fee-configurations` })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!response?.data) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>{t("feeConfigurations.form.edit.loadError")}</p>
      </div>
    )
  }

  // if (isError && error) {
  //     // toast.error(t(error))
  //   }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("feeConfigurations.edit")}
          breadcrumbs={[
            { label: t("menu.administration"), href: "/dashboard" },
            { label: t("feeConfigurations.title"), href: "/administration/document-types" },
            { label: t("feeConfigurations.edit") },
          ]}
        />
      }
      content={<FeeConfigurationEditForm feeConfigurationId={id} initialData={response.data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
