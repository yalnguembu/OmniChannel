import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useCurrencyDetail } from "../hooks/useCurrencyDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { CurrencyDetails } from "../components/CurrencyDetails"

export function CurrencyDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/currency/$id" })
  
  const { currency, isLoading, isError } = useCurrencyDetail(id)

  const handleEdit = () => {
    navigate({ to: `/currency/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/currency" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !currency) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("currency.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("currency.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("currency.title"), href: "/currency" },
          { label: t("currency.details.view") },
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
            <CardTitle>{t("currency.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <CurrencyDetails data={currency} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
