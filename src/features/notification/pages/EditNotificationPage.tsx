import { useNavigate, useParams } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { NotificationEditForm } from "../components/NotificationEditForm"
import { useNotificationMutations } from "../hooks/useNotificationMutations"
import { useNotificationDetail } from "../hooks/useNotificationDetail"
import { UpdateNotificationRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { PageLoader } from "@/shared/components/PageLoader"

export function EditNotificationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/notification/$id/edit" })
  
  const { notification, isLoading, isError } = useNotificationDetail(id)
  const { updateMutation } = useNotificationMutations()

  const handleSubmit = (data: UpdateNotificationRequest, setError: any) => {
    updateMutation.mutate(
      { path: { id }, body: data },
      {
        onSuccess: () => {
          navigate({ to: "/notification" })
        },
        onError: (error: any) => {},
      }
    )
  }

  const handleCancel = () => {
    navigate({ to: "/notification" })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !notification) {
    return (
      <div className="container mx-auto py-6">
        <p>{t("notification.form.edit.loadError")}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("notification.form.edit.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("notification.title"), href: "/notification" },
          { label: t("notification.actions.edit") },
        ]}
      />
      <div className="mt-6">
        <NotificationEditForm
          initialData={notification}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
