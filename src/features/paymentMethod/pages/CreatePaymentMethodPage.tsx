import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { PaymentMethodCreateForm } from "../components/PaymentMethodCreateForm"
import { usePaymentMethodMutations } from "../hooks/usePaymentMethodMutations"
import { CreatePaymentMethodRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreatePaymentMethodPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = usePaymentMethodMutations()

  const handleSubmit = (data: CreatePaymentMethodRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("paymentMethod.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("paymentMethod.title"), href: "/paymentMethod" },
          { label: t("paymentMethod.actions.add") },
        ]}
      />
      <div className="mt-6">
        <PaymentMethodCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
