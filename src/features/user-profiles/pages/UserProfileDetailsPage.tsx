import { useNavigate, useParams } from "@tanstack/react-router"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Edit, ArrowLeft, Loader2, Shield, User, Calendar, Clock, LucideIcon } from "lucide-react"
import { useUserProfile } from "../hooks/useUserProfile"
import { Label } from "@/shared/components/ui/label"
import { Separator } from "@/shared/components/ui/separator"
import { Badge } from "@/shared/components/ui/badge"
import { formatDate } from "@/shared/lib/date"
import { useTranslation } from "react-i18next"

const DetailItem = ({ icon: Icon, label, value }: { icon?: LucideIcon | null; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-4 py-3">
    {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />}
    <div className="flex-1 space-y-1">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="text-sm">{value ?? "N/A"}</div>
    </div>
  </div>
)
export function UserProfileDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams({ from: `/_protected/access-control/user-profiles/$id/` })
  const { getUserProfileQuery } = useUserProfile()

  const handleEdit = () => {
    navigate({ to: `/access-control/user-profiles/${id}/edit` })
  }

  const handleAssignPermissions = () => {
    navigate({ to: `/access-control/user-profiles/${id}/assign` })
  }

  const handleBack = () => {
    navigate({ to: `/access-control/user-profiles` })
  }

  const { data, isLoading, isError } = getUserProfileQuery(id)

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
        <p>{t("userProfiles.messages.notFound")}</p>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.backToList")}
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.backToList")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAssignPermissions}>
            <Shield className="mr-2 h-4 w-4" />
            {t("userProfiles.actions.assignPermissions")}
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {t("userProfiles.actions.edit")}
          </Button>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{t("userProfiles.details.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">{t("userProfiles.details.sections.information")}</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <DetailItem icon={User} label={t("userProfiles.fields.name")} value={data?.data?.name} />
                  <Separator />
                </div>
                <div>
                  <DetailItem icon={User} label={t("userProfiles.fields.description")} value={data?.data?.description} />
                  <Separator />
                </div>
                <div>
                  <DetailItem icon={User} label={t("userProfiles.fields.systemProfile")} value={data?.data?.isSystemProfile ? t("common.yes") : t("common.no")} />
                  <Separator />
                </div>
                <div>
                  <DetailItem icon={User} label={t("userProfiles.fields.active")} value={data?.data?.isActive ? t("common.yes") : t("common.no")} />
                  <Separator />
                </div>
                <div>
                  <DetailItem icon={Calendar} label={t("common.createdAt")} value={data?.data?.createdAt ? formatDate(data?.data?.createdAt) : t("common.na")} />
                </div>
                <DetailItem icon={Clock} label={t("common.updatedAt")} value={data?.data?.updatedAt ? formatDate(data?.data?.updatedAt) : t("common.na")} />
              </div>
            </div>

            {data?.data?.permissions && data?.data?.permissions.length > 0 && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    {t("userProfiles.details.sections.permissions")} ({data?.data?.permissions.split(",").length})
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {data?.data?.permissions.split(",").map((permission, index) => (
                      <Badge key={index} variant="secondary" className="font-normal text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </CardContent>
      </Card>
    </div>
  )
}
