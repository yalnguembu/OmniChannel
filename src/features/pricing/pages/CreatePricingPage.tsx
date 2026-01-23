import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { PricingCreateForm } from "../components/PricingCreateForm"
import { usePricingMutations } from "../hooks/usePricingMutations"
import { CreatePricingRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreatePricingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = usePricingMutations()

  const handleSubmit = (data: CreatePricingRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: "/pricing" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/pricing" })
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("pricing.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("pricing.title"), href: "/pricing" },
          { label: t("pricing.actions.add") },
        ]}
      />
      <div className="mt-6">
        <PricingCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
