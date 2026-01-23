import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { PaymentMethodEditForm } from "../components/PaymentMethodEditForm"
import { usePaymentMethodMutations } from "../hooks/usePaymentMethodMutations"
import { usePaymentMethodDetail } from "../hooks/usePaymentMethodDetail"
import { UpdatePaymentMethodRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditPaymentMethodPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/paymentMethod/$id/edit" })
  
  const { paymentMethod, isLoading, isError } = usePaymentMethodDetail(id)
  const { updateMutation } = usePaymentMethodMutations()

  const handleSubmit = (data: UpdatePaymentMethodRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/paymentMethod" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/paymentMethod" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !paymentMethod) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("paymentMethod.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("paymentMethod.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("paymentMethod.title"), href: "/paymentMethod" },
          { label: t("paymentMethod.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <PaymentMethodEditForm
          initialData={paymentMethod}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
