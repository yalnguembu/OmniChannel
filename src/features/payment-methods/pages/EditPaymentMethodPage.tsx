import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PaymentMethodEditForm } from "../components/PaymentMethodEditForm"
import { Loader2 } from "lucide-react"
import { usePaymentMethod } from "../hooks/usePayMentmethod"
import { UpdatePaymentMethodRequest } from "@/shared/api"

export function EditPaymentMethodPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/administration/payment-methods/$id/edit" })
  const { updateMutation, getPaymentMethodQuery, isLoading } = usePaymentMethod()

  const handleSubmit = (data: UpdatePaymentMethodRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/payment-methods` })
        },
      },
    )
  }

  const { data } = getPaymentMethodQuery(id)

  const handleCancel = () => {
    navigate({ to: `/administration/payment-methods` })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data?.data) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>{t("paymentMethods.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("paymentMethods.edit")}
          breadcrumbs={[
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("paymentMethods.title"), href: "/paymentMethod" },
            { label: t("paymentMethods.edit") },
          ]}
        />
      }
      content={<PaymentMethodEditForm paymentMethodId={id} initialData={data.data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
