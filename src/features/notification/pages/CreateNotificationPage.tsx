import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { NotificationCreateForm } from "../components/NotificationCreateForm"
import { useNotificationMutations } from "../hooks/useNotificationMutations"
import { CreateNotificationRequest } from "@/shared/api/types.gen"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"

export function CreateNotificationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useNotificationMutations()

  const handleSubmit = (data: CreateNotificationRequest, setError: any) => {
    createMutation.mutate(
      { body: data },
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

  return (
    <div className="container mx-auto py-6">
      <CreatePageHeader
        title={t("notification.form.create.title")}
        breadcrumbs={[
          { label: t("navigation.dashboard"), href: "/dashboard" },
          { label: t("notification.title"), href: "/notification" },
          { label: t("notification.actions.add") },
        ]}
      />
      <div className="mt-6">
        <NotificationCreateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
