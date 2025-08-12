import { useTranslation } from "react-i18next"
// import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PaymentMethodCreateForm } from "../components/PaymentMethodCreateForm"
import { usePaymentMethod } from "../hooks/usePayMentmethod"
import { UpdatePaymentMethodRequest } from "@/shared/api"

export function CreatePaymentMethodPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = usePaymentMethod()

  const handleSubmit = (data: UpdatePaymentMethodRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/administration/payment-methods` })
        },
        onError: () => {
          // toast.error(t(error))
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/administration/payment-methods` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("paymentMethods.create")}
          breadcrumbs={[
            { label: t("navigation.dashboard"), href: "/dashboard" },
            { label: t("paymentMethods.title"), href: `/administration/payment-methods` },
            { label: t("paymentMethods.create") },
          ]}
        />
      }
      content={<PaymentMethodCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
