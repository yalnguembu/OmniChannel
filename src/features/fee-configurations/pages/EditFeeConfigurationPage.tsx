import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { FeeConfigurationEditForm } from "../components/FeeConfigurationEditForm"
import { Loader2 } from "lucide-react"
// import { toast } from "sonner"
import { useFeeConfiguration } from "../hooks/useFeeConfiguration"
import { UpdateFeeConfigurationRequest } from "@/shared/api"

export function EditFeeConfigurationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/administration/fee-configurations/$id/edit" })
  const { selectedFeeConfiguration: data, updateMutation, getFeeConfigurationQuery, isLoading } = useFeeConfiguration()

  const handleSubmit = (data: UpdateFeeConfigurationRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/fee-configurations` })
        },
      },
    )
  }

  useEffect(() => {
    if (id) {
      getFeeConfigurationQuery(id)
    }
  }, [])

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

  if (!data) {
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
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("feeConfigurations.title"), href: "/administration/document-types" },
            { label: t("feeConfigurations.edit") },
          ]}
        />
      }
      content={<FeeConfigurationEditForm feeConfigurationId={id} initialData={data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
