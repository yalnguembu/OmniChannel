import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useAuditLogDetail } from "../hooks/useAuditLogDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { AuditLogDetails } from "../components/AuditLogDetails"

export function AuditLogDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/auditLog/$id" })
  
  const { auditLog, isLoading, isError } = useAuditLogDetail(id)

  const handleEdit = () => {
    navigate({ to: `/auditLog/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/auditLog" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !auditLog) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("auditLog.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("auditLog.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("auditLog.title"), href: "/auditLog" },
          { label: t("auditLog.details.view") },
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
            <CardTitle>{t("auditLog.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <AuditLogDetails data={auditLog} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
