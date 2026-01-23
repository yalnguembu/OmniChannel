import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useClientDetail } from "../hooks/useClientDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { ClientDetails } from "../components/ClientDetails"

export function ClientDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/client/$id" })
  
  const { client, isLoading, isError } = useClientDetail(id)

  const handleEdit = () => {
    navigate({ to: `/client/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/client" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !client) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("client.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("client.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("client.title"), href: "/client" },
          { label: t("client.details.view") },
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
            <CardTitle>{t("client.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <ClientDetails data={client} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
