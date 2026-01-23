import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { SubscriptionEditForm } from "../components/SubscriptionEditForm"
import { useSubscriptionMutations } from "../hooks/useSubscriptionMutations"
import { useSubscriptionDetail } from "../hooks/useSubscriptionDetail"
import { UpdateSubscriptionRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditSubscriptionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/subscription/$id/edit" })
  
  const { subscription, isLoading, isError } = useSubscriptionDetail(id)
  const { updateMutation } = useSubscriptionMutations()

  const handleSubmit = (data: UpdateSubscriptionRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
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

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !subscription) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("subscription.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("subscription.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("subscription.title"), href: "/subscription" },
          { label: t("subscription.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <SubscriptionEditForm
          initialData={subscription}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
