import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useSubscriptionDetail } from "../hooks/useSubscriptionDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { SubscriptionDetails } from "../components/SubscriptionDetails"

export function SubscriptionDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/subscription/$id" })
  
  const { subscription, isLoading, isError } = useSubscriptionDetail(id)

  const handleEdit = () => {
    navigate({ to: `/subscription/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/subscription" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !subscription) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("subscription.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("subscription.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("subscription.title"), href: "/subscription" },
          { label: t("subscription.details.view") },
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
            <CardTitle>{t("subscription.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <SubscriptionDetails data={subscription} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
