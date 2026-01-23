import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useConnectorDetail } from "../hooks/useConnectorDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { ConnectorDetails } from "../components/ConnectorDetails"

export function ConnectorDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/connector/$id" })
  
  const { connector, isLoading, isError } = useConnectorDetail(id)

  const handleEdit = () => {
    navigate({ to: `/connector/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/connector" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !connector) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("connector.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("connector.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("connector.title"), href: "/connector" },
          { label: t("connector.details.view") },
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
            <CardTitle>{t("connector.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <ConnectorDetails data={connector} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
