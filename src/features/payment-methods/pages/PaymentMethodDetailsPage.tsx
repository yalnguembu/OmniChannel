import { useNavigate, useParams } from "@tanstack/react-router"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Edit, ArrowLeft, Loader2 } from "lucide-react"
import { usePaymentMethod } from "../hooks/usePayMentmethod"
import { Label } from "@/shared/components/ui/label"

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b">
    <Label className="font-semibold text-muted-foreground">{label}</Label>
    <div className="md:col-span-2">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "N/A")}</div>
  </div>
)

export function PaymentMethodDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_protected/administration/payment-methods/$id/" })
  const { getPaymentMethodQuery, isLoading, isError } = usePaymentMethod()

  const handleEdit = () => {
    navigate({ to: `/administration/payment-methods/${id}/edit` })
  }

  const handleBack = () => {
    navigate({ to: `/administration/payment-methods` })
  }
  const { data } = getPaymentMethodQuery(id)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>PaymentMethod not found.</p>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to list
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to list
        </Button>
        <Button onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit PaymentMethod
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>PaymentMethod Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(data.data).map(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
            return <DetailItem key={key} label={formattedKey} value={value} />
          })}
        </CardContent>
      </Card>
    </div>
  )
}
