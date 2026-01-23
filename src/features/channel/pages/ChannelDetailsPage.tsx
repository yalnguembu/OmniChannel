import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useChannelDetail } from "../hooks/useChannelDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { ChannelDetails } from "../components/ChannelDetails"

export function ChannelDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/channel/$id" })
  
  const { channel, isLoading, isError } = useChannelDetail(id)

  const handleEdit = () => {
    navigate({ to: `/channel/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/channel" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !channel) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("channel.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("channel.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("channel.title"), href: "/channel" },
          { label: t("channel.details.view") },
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
            <CardTitle>{t("channel.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <ChannelDetails data={channel} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
