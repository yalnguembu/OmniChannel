import { useTranslation } from "react-i18next"
import { Notification } from "@/shared/api/types.gen"
import { Separator } from "@/shared/components/ui/separator"

interface NotificationDetailsProps {
  data: Notification
}

export function NotificationDetails({ data }: NotificationDetailsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.type")}</h4>
          <p className="text-sm text-muted-foreground">{data.type?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.title")}</h4>
          <p className="text-sm text-muted-foreground">{data.title?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.status")}</h4>
          <p className="text-sm text-muted-foreground">{data.status?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.detail")}</h4>
          <p className="text-sm text-muted-foreground">{data.detail?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.instance")}</h4>
          <p className="text-sm text-muted-foreground">{data.instance?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.data")}</h4>
          <p className="text-sm text-muted-foreground">{data.data?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.success")}</h4>
          <p className="text-sm text-muted-foreground">{data.success?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.errorCode")}</h4>
          <p className="text-sm text-muted-foreground">{data.errorCode?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.traceId")}</h4>
          <p className="text-sm text-muted-foreground">{data.traceId?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.timestamp")}</h4>
          <p className="text-sm text-muted-foreground">{data.timestamp?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.validationErrors")}</h4>
          <p className="text-sm text-muted-foreground">{data.validationErrors?.toString() || "-"}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">{t("notification.fields.metadata")}</h4>
          <p className="text-sm text-muted-foreground">{data.metadata?.toString() || "-"}</p>
        </div>
      </div>
    </div>
  )
}
