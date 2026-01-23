import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useSubscriptionPlanDetail } from "../hooks/useSubscriptionPlanDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { SubscriptionPlanDetails } from "../components/SubscriptionPlanDetails"

export function SubscriptionPlanDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/subscriptionPlan/$id" })
  
  const { subscriptionPlan, isLoading, isError } = useSubscriptionPlanDetail(id)

  const handleEdit = () => {
    navigate({ to: `/subscriptionPlan/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/subscriptionPlan" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !subscriptionPlan) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("subscriptionPlan.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("subscriptionPlan.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("subscriptionPlan.title"), href: "/subscriptionPlan" },
          { label: t("subscriptionPlan.details.view") },
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
            <CardTitle>{t("subscriptionPlan.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <SubscriptionPlanDetails data={subscriptionPlan} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
