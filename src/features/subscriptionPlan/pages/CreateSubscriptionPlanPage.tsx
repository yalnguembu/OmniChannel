import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { SubscriptionPlanCreateForm } from "../components/SubscriptionPlanCreateForm"
import { useSubscriptionPlanMutations } from "../hooks/useSubscriptionPlanMutations"
import { CreateSubscriptionPlanRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateSubscriptionPlanPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useSubscriptionPlanMutations()

  const handleSubmit = (data: CreateSubscriptionPlanRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: "/subscriptionPlan" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/subscriptionPlan" })
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("subscriptionPlan.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("subscriptionPlan.title"), href: "/subscriptionPlan" },
          { label: t("subscriptionPlan.actions.add") },
        ]}
      />
      <div className="mt-6">
        <SubscriptionPlanCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
