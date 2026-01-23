import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useCompanyVerificationDetail } from "../hooks/useCompanyVerificationDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { CompanyVerificationDetails } from "../components/CompanyVerificationDetails"

export function CompanyVerificationDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/companyVerification/$id" })
  
  const { companyVerification, isLoading, isError } = useCompanyVerificationDetail(id)

  const handleEdit = () => {
    navigate({ to: `/companyVerification/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/companyVerification" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !companyVerification) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("companyVerification.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("companyVerification.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("companyVerification.title"), href: "/companyVerification" },
          { label: t("companyVerification.details.view") },
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
            <CardTitle>{t("companyVerification.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <CompanyVerificationDetails data={companyVerification} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
