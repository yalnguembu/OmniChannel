import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useTemplateDetail } from "../hooks/useTemplateDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { TemplateDetails } from "../components/TemplateDetails"

export function TemplateDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/template/$id" })
  
  const { template, isLoading, isError } = useTemplateDetail(id)

  const handleEdit = () => {
    navigate({ to: `/template/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/template" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !template) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("template.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("template.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("template.title"), href: "/template" },
          { label: t("template.details.view") },
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
            <CardTitle>{t("template.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <TemplateDetails data={template} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
