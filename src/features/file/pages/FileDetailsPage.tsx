import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useFileDetail } from "../hooks/useFileDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { FileDetails } from "../components/FileDetails"

export function FileDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/file/$id" })
  
  const { file, isLoading, isError } = useFileDetail(id)

  const handleEdit = () => {
    navigate({ to: `/file/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/file" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !file) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("file.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("file.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("file.title"), href: "/file" },
          { label: t("file.details.view") },
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
            <CardTitle>{t("file.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <FileDetails data={file} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
