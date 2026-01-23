import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { CampaignEditForm } from "../components/CampaignEditForm"
import { useCampaignMutations } from "../hooks/useCampaignMutations"
import { useCampaignDetail } from "../hooks/useCampaignDetail"
import { UpdateCampaignRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditCampaignPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/campaign/$id/edit" })
  
  const { campaign, isLoading, isError } = useCampaignDetail(id)
  const { updateMutation } = useCampaignMutations()

  const handleSubmit = (data: UpdateCampaignRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/campaign" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/campaign" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !campaign) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("campaign.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("campaign.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("campaign.title"), href: "/campaign" },
          { label: t("campaign.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <CampaignEditForm
          initialData={campaign}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
