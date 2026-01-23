import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { PaymentEditForm } from "../components/PaymentEditForm"
import { usePaymentMutations } from "../hooks/usePaymentMutations"
import { usePaymentDetail } from "../hooks/usePaymentDetail"
import { UpdatePaymentRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditPaymentPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/payment/$id/edit" })
  
  const { payment, isLoading, isError } = usePaymentDetail(id)
  const { updateMutation } = usePaymentMutations()

  const handleSubmit = (data: UpdatePaymentRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/payment" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/payment" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !payment) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("payment.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("payment.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("payment.title"), href: "/payment" },
          { label: t("payment.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <PaymentEditForm
          initialData={payment}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
