import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useMessageDetail } from "../hooks/useMessageDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { MessageDetails } from "../components/MessageDetails"

export function MessageDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/message/$id" })
  
  const { message, isLoading, isError } = useMessageDetail(id)

  const handleEdit = () => {
    navigate({ to: `/message/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/message" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !message) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("message.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("message.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("message.title"), href: "/message" },
          { label: t("message.details.view") },
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
            <CardTitle>{t("message.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <MessageDetails data={message} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
