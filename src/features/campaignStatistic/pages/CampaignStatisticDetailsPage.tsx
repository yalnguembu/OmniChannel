import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useCampaignStatisticDetail } from "../hooks/useCampaignStatisticDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { CampaignStatisticDetails } from "../components/CampaignStatisticDetails"

export function CampaignStatisticDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/campaignStatistic/$id" })
  
  const { campaignStatistic, isLoading, isError } = useCampaignStatisticDetail(id)

  const handleEdit = () => {
    navigate({ to: `/campaignStatistic/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/campaignStatistic" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !campaignStatistic) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("campaignStatistic.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("campaignStatistic.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("campaignStatistic.title"), href: "/campaignStatistic" },
          { label: t("campaignStatistic.details.view") },
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
            <CardTitle>{t("campaignStatistic.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <CampaignStatisticDetails data={campaignStatistic} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
