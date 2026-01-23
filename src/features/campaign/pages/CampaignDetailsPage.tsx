import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useCampaignDetail } from "../hooks/useCampaignDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { CampaignDetails } from "../components/CampaignDetails"

export function CampaignDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/campaign/$id" })
  
  const { campaign, isLoading, isError } = useCampaignDetail(id)

  const handleEdit = () => {
    navigate({ to: `/campaign/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/campaign" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !campaign) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("campaign.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("campaign.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("campaign.title"), href: "/campaign" },
          { label: t("campaign.details.view") },
        ]}
      />
      
      <div className="mt-6 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {t("common.actions.edit")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("campaign.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <CampaignDetails data={campaign} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
