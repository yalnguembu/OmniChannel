import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { usePricingDetail } from "../hooks/usePricingDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { PricingDetails } from "../components/PricingDetails"

export function PricingDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/pricing/$id" })
  
  const { pricing, isLoading, isError } = usePricingDetail(id)

  const handleEdit = () => {
    navigate({ to: `/pricing/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/pricing" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !pricing) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("pricing.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("pricing.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("pricing.title"), href: "/pricing" },
          { label: t("pricing.details.view") },
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
            <CardTitle>{t("pricing.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <PricingDetails data={pricing} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
