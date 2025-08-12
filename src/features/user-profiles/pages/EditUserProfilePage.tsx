import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "@tanstack/react-router"
import { StandardListPageLayout } from "@/shared/components/layouts/ListPageLayout"
import { CreatePageHeader } from "@/shared/components/CreatePageHeader"
import { UserProfileEditForm } from "../components/UserProfileEditForm"
import { Loader2 } from "lucide-react"
// import { toast } from "sonner"
import { useUserProfile } from "../hooks/useUserProfile"
import { UpdateUserProfileRequest } from "@/shared/api"

export function EditUserProfilePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { id } = useParams({ from: "/_protected/access-control/user-profiles/$id/edit" })
  const { selectedUserProfile: data, updateMutation, getUserProfileQuery, isLoading } = useUserProfile()

  const handleSubmit = (data: UpdateUserProfileRequest) => {
    updateMutation.mutate(
      { body: data },
      {
        onSuccess: () => {
          navigate({ to: `/access-control/user-profiles` })
        },
      },
    )
  }

  useEffect(() => {
    if (id) {
      getUserProfileQuery(id)
    }
  }, [])

  const handleCancel = () => {
    navigate({ to: `/access-control/user-profiles` })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto py-6 text-center">
        <p>{t("userProfile.form.edit.loadError")}</p>
      </div>
    )
  }

  // if (isError && error) {
  //     // toast.error(t(error))
  //   }

  return (
    <StandardListPageLayout
      header={
        <CreatePageHeader
          title={t("userProfile.edit")}
          breadcrumbs={[{ label: t("navigation.dashboard"), href: "/dashboard" }, { label: t("userProfile.title"), href: "/userProfile" }, { label: t("userProfile.edit") }]}
        />
      }
      content={<UserProfileEditForm userProfileId={id} initialData={data} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={false} />}
    />
  )
}
