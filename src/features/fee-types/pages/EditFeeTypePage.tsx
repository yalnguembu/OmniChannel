import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { FeeTypeEditForm } from "../components/FeeTypeEditForm"
import { Loader2 } from "lucide-react"
// import { toast } from "sonner"
import { useFeeType } from "../hooks/useFeeType"
import { UpdateFeeTypeRequest } from "@/shared/api"

export function EditFeeTypePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: `/_protected/administration/fee-types/$id/` })
  const { selectedFeeType: data, updateMutation, getFeeTypeQuery, isLoading } = useFeeType()

  const handleSubmit = (data: UpdateFeeTypeRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/fee-types` })
        },
      },
    )
  }

  useEffect(() => {
    if (id) {
      getFeeTypeQuery(id)
    }
  }, [])

  const handleCancel = () => {
    navigate({ to: `/administration/fee-types` })
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
        <p>{t("feeTypes.form.edit.loadError")}</p>
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
          title={t("feeTypes.edit")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("feeTypes.title"), href: "/feeType" }, { label: t("feeTypes.edit") }]}
        />
      }
      content={<FeeTypeEditForm feeTypeId={id} initialData={data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
