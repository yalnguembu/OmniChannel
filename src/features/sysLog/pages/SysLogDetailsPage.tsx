import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useSysLogDetail } from "../hooks/useSysLogDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { SysLogDetails } from "../components/SysLogDetails"

export function SysLogDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/sysLog/$id" })
  
  const { sysLog, isLoading, isError } = useSysLogDetail(id)

  const handleEdit = () => {
    navigate({ to: `/sysLog/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/sysLog" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !sysLog) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("sysLog.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("sysLog.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("sysLog.title"), href: "/sysLog" },
          { label: t("sysLog.details.view") },
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
            <CardTitle>{t("sysLog.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <SysLogDetails data={sysLog} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
