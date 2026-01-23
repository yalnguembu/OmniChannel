import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { PricingEditForm } from "../components/PricingEditForm"
import { usePricingMutations } from "../hooks/usePricingMutations"
import { usePricingDetail } from "../hooks/usePricingDetail"
import { UpdatePricingRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditPricingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/pricing/$id/edit" })
  
  const { pricing, isLoading, isError } = usePricingDetail(id)
  const { updateMutation } = usePricingMutations()

  const handleSubmit = (data: UpdatePricingRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
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

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !pricing) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("pricing.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("pricing.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("pricing.title"), href: "/pricing" },
          { label: t("pricing.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <PricingEditForm
          initialData={pricing}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
