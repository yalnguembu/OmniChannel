import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { ListPageHeader } from "@/shared/components/ListPageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import { Loader2, User, Mail, Building2, Shield, Calendar, Clock, type LucideIcon } from "lucide-react"
import { Separator } from "@/shared/components/ui/separator"
import { useQuery } from "@tanstack/react-query"
import { getApiUserMe } from "@/shared/api/sdk.gen"
import { useSessionStore } from "@/shared/stores/sessionStore"

const DetailItem = ({ icon: Icon, label, value, t }: { icon?: LucideIcon | null; label: string; value: React.ReactNode; t: any }) => (
  <div className="flex items-start gap-4 py-3">
    {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />}
    <div className="flex-1 space-y-1">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="text-sm">{value ?? t("common.na")}</div>
    </div>
  </div>
)

export function UserProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const sessionStore = useSessionStore()

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const result = await getApiUserMe()
      if (result.data?.data) {
        // sessionStore.setUser(result.data.data)
        sessionStore.setPermissions(result.data.data?.permissions || [])
      }
      return result.data
    },
  })

  const userData = response?.data

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !userData) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>{t("settings.userProfile.messages.loadError")}</p>
        <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })} className="mt-4">
          {t("settings.userProfile.actions.returnToDashboard")}
        </Button>
      </div>
    )
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t("common.na")
    return new Date(dateString).toLocaleString()
  }

  return (
    <StandardListPageLayout
      header={
        <ListPageHeader
          title={t("settings.userProfile.title") || "My Profile"}
          breadcrumbs={[
            { label: t("navigation.dashboard") || "Dashboard", href: "/dashboard" },
            { label: t("settings.title") || "Settings", href: "/settings" },
            { label: t("settings.userProfile.title") || "My Profile" },
          ]}
        />
      }
      content={
        <div className="container mx-auto py-6 space-y-6 max-w-4xl h-full overflow-y-auto">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : t("settings.userProfile.title")}
                  </CardTitle>
                  <CardDescription className="text-base">{userData.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">{t("settings.userProfile.sections.personalInfo")}</h3>
                <div className="space-y-1">
                  <DetailItem icon={User} label={t("settings.userProfile.fields.firstName")} value={userData.firstName} t={t} />
                  <Separator />
                  <DetailItem icon={User} label={t("settings.userProfile.fields.lastName")} value={userData.lastName} t={t} />
                  <Separator />
                  <DetailItem icon={Mail} label={t("settings.userProfile.fields.email")} value={userData.email} t={t} />
                  <Separator />
                  <DetailItem icon={null} label={t("settings.userProfile.fields.publicId")} value={userData.publicId} t={t} />
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-sm font-semibold mb-3">{t("settings.userProfile.sections.accountInfo")}</h3>
                <div className="space-y-1">
                  <DetailItem
                    icon={null}
                    label={t("settings.userProfile.fields.userType")}
                    value={
                      userData.userType ? (
                        <Badge variant="outline" className="font-normal">
                          {userData.userType}
                        </Badge>
                      ) : (
                        t("common.na")
                      )
                    }
                    t={t}
                  />
                  <Separator />
                  <DetailItem
                    icon={null}
                    label={t("settings.userProfile.fields.status")}
                    value={
                      userData.status ? (
                        <Badge variant={userData.status === "Active" ? "default" : "secondary"} className="font-normal">
                          {userData.status}
                        </Badge>
                      ) : (
                        t("common.na")
                      )
                    }
                    t={t}
                  />
                  <Separator />
                  <DetailItem icon={Calendar} label={t("common.createdAt")} value={formatDate(userData.createdAt)} t={t} />
                  <Separator />
                  <DetailItem icon={Clock} label={t("settings.userProfile.fields.lastLogin")} value={formatDate(userData.lastLoginAt)} t={t} />
                </div>
              </div>

              {(userData.companyId || userData.companyName) && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-sm font-semibold mb-3">{t("settings.userProfile.sections.companyInfo")}</h3>
                    <div className="space-y-1">
                      <DetailItem icon={Building2} label={t("settings.userProfile.fields.companyName")} value={userData.companyName} t={t} />
                      <Separator />
                      <DetailItem icon={null} label={t("settings.userProfile.fields.companyId")} value={userData.companyId} t={t} />
                    </div>
                  </div>
                </>
              )}

              {(userData.profileId || userData.profileName) && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-sm font-semibold mb-3">{t("settings.userProfile.sections.profilePermissions")}</h3>
                    <div className="space-y-1">
                      <DetailItem icon={Shield} label={t("settings.userProfile.fields.profileName")} value={userData.profileName} t={t} />
                      <Separator />
                      <DetailItem icon={null} label={t("settings.userProfile.fields.profileId")} value={userData.profileId} t={t} />
                    </div>
                  </div>
                </>
              )}

              {userData.permissions && userData.permissions.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-sm font-semibold mb-3">
                      {t("settings.userProfile.sections.permissions")} ({userData.permissions.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {userData.permissions.map((permission, index) => (
                        <Badge key={index} variant="secondary" className="font-normal text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      }
    />
  )
}
