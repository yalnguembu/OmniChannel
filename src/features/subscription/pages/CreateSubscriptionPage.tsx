import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { SubscriptionCreateForm } from "../components/SubscriptionCreateForm"
import { useSubscriptionMutations } from "../hooks/useSubscriptionMutations"
import { CreateSubscriptionRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateSubscriptionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useSubscriptionMutations()

  const handleSubmit = (data: CreateSubscriptionRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: "/subscription" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/subscription" })
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("subscription.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("subscription.title"), href: "/subscription" },
          { label: t("subscription.actions.add") },
        ]}
      />
      <div className="mt-6">
        <SubscriptionCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
