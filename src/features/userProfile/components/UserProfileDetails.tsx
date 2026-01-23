import { useTranslation } from "react-i18next"
import { UserProfile } from "@/shared/api/types.gen"
import { Separator } from "@/shared/components/ui/separator"

interface UserProfileDetailsProps {
  data: UserProfile
}

export function UserProfileDetails({ data }: UserProfileDetailsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.type")}</h4>
          <p className="text-sm text-muted-foreground">{data.type?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.title")}</h4>
          <p className="text-sm text-muted-foreground">{data.title?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.status")}</h4>
          <p className="text-sm text-muted-foreground">{data.status?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.detail")}</h4>
          <p className="text-sm text-muted-foreground">{data.detail?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.instance")}</h4>
          <p className="text-sm text-muted-foreground">{data.instance?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.data")}</h4>
          <p className="text-sm text-muted-foreground">{data.data?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.success")}</h4>
          <p className="text-sm text-muted-foreground">{data.success?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.errorCode")}</h4>
          <p className="text-sm text-muted-foreground">{data.errorCode?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.traceId")}</h4>
          <p className="text-sm text-muted-foreground">{data.traceId?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.timestamp")}</h4>
          <p className="text-sm text-muted-foreground">{data.timestamp?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.validationErrors")}</h4>
          <p className="text-sm text-muted-foreground">{data.validationErrors?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("userProfile.fields.metadata")}</h4>
          <p className="text-sm text-muted-foreground">{data.metadata?.toString() || "-"}</p>
        </div>
      </div>
    </div>
  )
}
