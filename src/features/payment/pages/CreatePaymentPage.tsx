import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { PaymentCreateForm } from "../components/PaymentCreateForm"
import { usePaymentMutations } from "../hooks/usePaymentMutations"
import { CreatePaymentRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreatePaymentPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = usePaymentMutations()

  const handleSubmit = (data: CreatePaymentRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("payment.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("payment.title"), href: "/payment" },
          { label: t("payment.actions.add") },
        ]}
      />
      <div className="mt-6">
        <PaymentCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
