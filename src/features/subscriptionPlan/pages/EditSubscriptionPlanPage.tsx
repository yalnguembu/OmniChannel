import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { SubscriptionPlanEditForm } from "../components/SubscriptionPlanEditForm"
import { useSubscriptionPlanMutations } from "../hooks/useSubscriptionPlanMutations"
import { useSubscriptionPlanDetail } from "../hooks/useSubscriptionPlanDetail"
import { UpdateSubscriptionPlanRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditSubscriptionPlanPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/subscriptionPlan/$id/edit" })
  
  const { subscriptionPlan, isLoading, isError } = useSubscriptionPlanDetail(id)
  const { updateMutation } = useSubscriptionPlanMutations()

  const handleSubmit = (data: UpdateSubscriptionPlanRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
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

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !subscriptionPlan) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("subscriptionPlan.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("subscriptionPlan.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("subscriptionPlan.title"), href: "/subscriptionPlan" },
          { label: t("subscriptionPlan.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <SubscriptionPlanEditForm
          initialData={subscriptionPlan}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
