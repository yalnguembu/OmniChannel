import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useJobDetail } from "../hooks/useJobDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { JobDetails } from "../components/JobDetails"

export function JobDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/job/$id" })
  
  const { job, isLoading, isError } = useJobDetail(id)

  const handleEdit = () => {
    navigate({ to: `/job/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/job" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !job) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("job.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("job.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("job.title"), href: "/job" },
          { label: t("job.details.view") },
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
            <CardTitle>{t("job.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <JobDetails data={job} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
