import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { usePaymentDetail } from "../hooks/usePaymentDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { PaymentDetails } from "../components/PaymentDetails"

export function PaymentDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/payment/$id" })
  
  const { payment, isLoading, isError } = usePaymentDetail(id)

  const handleEdit = () => {
    navigate({ to: `/payment/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/payment" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !payment) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("payment.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("payment.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("payment.title"), href: "/payment" },
          { label: t("payment.details.view") },
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
            <CardTitle>{t("payment.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <PaymentDetails data={payment} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
