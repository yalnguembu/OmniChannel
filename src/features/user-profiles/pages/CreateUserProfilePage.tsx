import { useTranslation } from "react-i18next"
// import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { UserProfileCreateForm } from "../components/UserProfileCreateForm"
import { useUserProfile } from "../hooks/useUserProfile"
import { UpdateUserProfileRequest } from "@/shared/api"

export function CreateUserProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { createMutation } = useUserProfile()

  const handleSubmit = (data: UpdateUserProfileRequest) => {
    createMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/access-control/user-profiles` })
        },
        onError: () => {
          // toast.error(t(error))
        },
      },
    )
  }

  const handleCancel = () => {
    navigate({ to: `/access-control/user-profiles` })
  }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("userProfile.create")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("userProfile.title"), href: "/userProfile" }, { label: t("userProfile.create") }]}
        />
      }
      content={<UserProfileCreateForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
