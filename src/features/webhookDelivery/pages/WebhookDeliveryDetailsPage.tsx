import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useWebhookDeliveryDetail } from "../hooks/useWebhookDeliveryDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { WebhookDeliveryDetails } from "../components/WebhookDeliveryDetails"

export function WebhookDeliveryDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/webhookDelivery/$id" })
  
  const { webhookDelivery, isLoading, isError } = useWebhookDeliveryDetail(id)

  const handleEdit = () => {
    navigate({ to: `/webhookDelivery/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/webhookDelivery" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !webhookDelivery) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("webhookDelivery.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("webhookDelivery.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("webhookDelivery.title"), href: "/webhookDelivery" },
          { label: t("webhookDelivery.details.view") },
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
            <CardTitle>{t("webhookDelivery.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <WebhookDeliveryDetails data={webhookDelivery} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
