import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { CampaignCreateForm } from "../components/CampaignCreateForm"
import { useCampaignMutations } from "../hooks/useCampaignMutations"
import { CreateCampaignRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateCampaignPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useCampaignMutations()

  const handleSubmit = (data: CreateCampaignRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("campaign.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("campaign.title"), href: "/campaign" },
          { label: t("campaign.actions.add") },
        ]}
      />
      <div className="mt-6">
        <CampaignCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
