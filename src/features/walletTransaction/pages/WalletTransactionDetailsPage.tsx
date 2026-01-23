import { useParams, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useWalletTransactionDetail } from "../hooks/useWalletTransactionDetail"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { PageLoader } from "@/shared/components/PageLoader"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { Edit, ArrowLeft } from "lucide-react"
import { WalletTransactionDetails } from "../components/WalletTransactionDetails"

export function WalletTransactionDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/walletTransaction/$id" })
  
  const { walletTransaction, isLoading, isError } = useWalletTransactionDetail(id)

  const handleEdit = () => {
    navigate({ to: `/walletTransaction/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: "/walletTransaction" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !walletTransaction) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("walletTransaction.messages.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("walletTransaction.details.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("walletTransaction.title"), href: "/walletTransaction" },
          { label: t("walletTransaction.details.view") },
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
            <CardTitle>{t("walletTransaction.details.information")}</CardTitle>
          </CardHeader>
          <CardContent>
             <WalletTransactionDetails data={walletTransaction} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
