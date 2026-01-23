import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useClientImportDetail } from "../hooks/useClientImportDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { ClientImportDetails } from "../components/ClientImportDetails"

export function ClientImportDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/clientImport/$id" })
  
  const { clientImport, isLoading, isError } = useClientImportDetail(id)

  const handleEdit = () => {
    navigate({ to: `/clientImport/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/clientImport" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !clientImport) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("clientImport.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("clientImport.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("clientImport.title"), href: "/clientImport" },
          { label: t("clientImport.details.view") },
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
            <CardTitle>{t("clientImport.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <ClientImportDetails data={clientImport} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
