import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useNotificationDetail } from "../hooks/useNotificationDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { NotificationDetails } from "../components/NotificationDetails"

export function NotificationDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/notification/$id" })
  
  const { notification, isLoading, isError } = useNotificationDetail(id)

  const handleEdit = () => {
    navigate({ to: `/notification/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/notification" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !notification) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("notification.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("notification.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("notification.title"), href: "/notification" },
          { label: t("notification.details.view") },
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
            <CardTitle>{t("notification.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <NotificationDetails data={notification} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
